import { cn } from "@/lib/utils";
import { ImagePlus, X, Check } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  ControllerRenderProps,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { FormField } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ModernImageInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  enableCropping?: boolean;
}

interface ModernImageFieldProps<T extends FieldValues = FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState?: { error?: { message?: string } };
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  enableCropping?: boolean;
}

// Helper to center the crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ModernImageField = <T extends FieldValues = FieldValues>({
  field,
  fieldState,
  label,
  description,
  required = false,
  className,
  enableCropping = true,
}: ModernImageFieldProps<T>) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Cropping State
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined); // undefined = free aspect ratio

  // Combine local error and form error
  const errorMessage = localError || fieldState?.error?.message;

  // Derive preview for string values
  const stringPreview = typeof field.value === "string" ? field.value : null;
  const activePreview = imagePreview || stringPreview;

  // Handle File objects for preview
  useEffect(() => {
    const value = field.value;
    
    // Check if value is a File object safely
    const isFile = (val: unknown): val is File => {
      return val instanceof File;
    };

    if (isFile(value)) {
      const newUrl = URL.createObjectURL(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing object URL for preview
      setImagePreview(newUrl);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(newUrl);
        setImagePreview(null); // Clear preview when unmounting/changing
      };
    } else {
      // If not a file (e.g. became string or null), clear object url state
      setImagePreview(null);
    }
  }, [field.value]);

  // Validate image file
  const validateImageFile = async (file: File): Promise<boolean> => {
    // Check if file exists
    if (!file) {
      if (required) {
        setLocalError("No file selected");
        toast.error("Please select a file to upload");
        return false;
      }
      return true;
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setLocalError("Only image files are allowed");
      toast.error(
        "Invalid file type. Only image files (JPEG, PNG, GIF, WEBP, SVG) are allowed."
      );
      return false;
    }

    // Check for specific image types
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setLocalError("Unsupported image format");
      toast.error(
        "Unsupported image format. Please use JPEG, PNG, GIF, WEBP, or SVG."
      );
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setLocalError("File size exceeds 10MB limit");
      toast.error("File is too large. Maximum size is 10MB.");
      return false;
    }

    // Check minimum file size (to prevent empty or corrupted files)
    const minSize = 100; // 100 bytes
    if (file.size < minSize) {
      setLocalError("File is too small or corrupted");
      toast.error("File appears to be corrupted or empty.");
      return false;
    }

    // Validate image dimensions (for non-SVG files)
    if (file.type !== "image/svg+xml") {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => {
              reject(new Error("Failed to load image"));
            };
            img.src = URL.createObjectURL(file);
          }
        );

        // Check minimum dimensions
        if (dimensions.width < 10 || dimensions.height < 10) {
          setLocalError("Image dimensions too small");
          toast.error(
            "Image dimensions are too small. Minimum size is 10x10 pixels."
          );
          return false;
        }
        // Check maximum dimensions
      } catch (error) {
        console.error("Error validating image dimensions:", error);
        setLocalError("Invalid image file");
        toast.error("The file appears to be corrupted or invalid.");
        return false;
      }
    }

    setLocalError(null);
    return true;
  };

  // Load image for cropping
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
        // Default crop for free aspect
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 16/9));
    }
  }

  // Generate cropped image
  const getCroppedImg = useCallback(async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  }, []);

  const handleCropComplete = async () => {
      if (completedCrop && imgRef.current && completedCrop.width > 0 && completedCrop.height > 0) {
          try {
              const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
              const croppedFile = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
              
              // Create a persistent URL for the cropped file
              const objectUrl = URL.createObjectURL(croppedFile);
              setImagePreview(objectUrl); // Assuming setNewPreview is meant to be setImagePreview
              
              field.onChange(croppedFile);
              // Assuming setCropImageUrl and setIsDialogOpen are state setters that need to be defined or removed
              // For now, commenting them out to maintain syntactical correctness.
              // setCropImageUrl(null); 
              setShowCropper(false); // Assuming setIsDialogOpen is meant to be setShowCropper
              toast.success("Image cropped successfully");
          } catch (error) {
              console.error("Error handling crop:", error);
              toast.error("Failed to process cropped image");
          }
      } else {
          // If no crop, just use original
          setShowCropper(false);
      }
  };


  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateImageFile(file);
      if (isValid) {
        if (enableCropping) {
             const reader = new FileReader();
             reader.addEventListener("load", () =>
               setImgSrc(reader.result?.toString() || "")
             );
             reader.readAsDataURL(file);
             setShowCropper(true);
        } else {
             field.onChange(file);
             setImagePreview(URL.createObjectURL(file));
        }
      } else {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      // Logic for no file...
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isValid = await validateImageFile(file);
      if (isValid) {
        field.onChange(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  // Handle paste
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      const isValid = await validateImageFile(file);
      if (isValid) {
        field.onChange(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Remove/clear image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null); // Clear object url state
    if (fileInputRef.current) fileInputRef.current.value = "";
    field.onChange("");
    if (required) {
      setLocalError("No file selected");
      toast.error("Please select a file to upload");
    } else {
      setLocalError(null);
    }
  };

  return (
    <div className={cn("mb-6 flex w-full flex-col items-center", className)}>
      {label && (
        <label className="mb-3 block w-full text-left text-sm font-semibold text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={cn(
          "group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-all duration-300 hover:bg-gray-50",
          isDragActive && "border-blue-500 bg-blue-50",
          errorMessage && "border-red-400 bg-red-50/50",
          activePreview && "border-solid border-gray-200 bg-white shadow-sm"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
        role="button"
        aria-label={label || "Upload image"}
      >
        {activePreview ? (
          <div className="relative flex h-full w-full items-center justify-center p-4">
            {/* Image Preview */}
            <div className="relative flex h-50 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <Image
                src={activePreview}
                alt="Preview"
                fill
                className="rounded-lg object-contain"
                unoptimized
              />
            </div>
            <button
              type="button"
              aria-label="Remove image"
              className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all duration-200 hover:bg-red-600"
              onClick={handleRemoveImage}
              tabIndex={0}
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all duration-200 hover:bg-black/10">
              <div className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Click to change
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
              <ImagePlus className="h-6 w-6 text-blue-600" />
            </div>
            <p className="mb-1 text-sm font-medium text-gray-900">
              Drag & Drop or Click to Upload
            </p>
            <p className="mb-4 text-xs text-gray-500">
              PNG, JPG or SVG (max. 5MB)
            </p>
            <button
              type="button"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Choose File
            </button>
          </div>
        )}

        {description && (
          <p className="absolute right-2 bottom-2 left-2 rounded bg-white/80 px-2 py-1 text-center text-xs text-gray-500">
            {description}
          </p>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-500/10">
            <div className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white">
              Drop image here
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="mt-2 text-center text-sm font-medium text-red-500">
          {errorMessage}
        </p>
      )}

      {/* Crop Modal */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Adjust Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center">
                {Boolean(imgSrc) && (
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        className="max-h-[60vh]"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            style={{ maxHeight: '60vh' }}
                        />
                    </ReactCrop>
                )}
                
                <div className="mt-4 flex gap-2">
                     <Button variant={aspect === undefined ? "default" : "outline"} size="sm" onClick={() => setAspect(undefined)}>Free</Button>
                     <Button variant={aspect === 1 ? "default" : "outline"} size="sm" onClick={() => setAspect(1)}>Square</Button>
                     <Button variant={aspect === 16/9 ? "default" : "outline"} size="sm" onClick={() => setAspect(16/9)}>16:9</Button>
                     <Button variant={aspect === 4/3 ? "default" : "outline"} size="sm" onClick={() => setAspect(4/3)}>4:3</Button>
                </div>
            </div>
            <DialogFooter className="mt-4 mr-0 gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowCropper(false)}>Cancel</Button>
                <Button onClick={handleCropComplete}>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Crop
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ModernImageInput = <T extends FieldValues>({
  name,
  label,
  description,
  required = false,
  className,
  enableCropping = true,
}: ModernImageInputProps<T>) => {
  const form = useFormContext<T>();

  if (!form)
    throw new Error("ModernImageInput must be used within a FormProvider");

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <ModernImageField
          field={field}
          fieldState={fieldState}
          label={label}
          description={description}
          required={required}
          className={className}
          enableCropping={enableCropping}
        />
      )}
    />
  );
};

export default ModernImageInput;
