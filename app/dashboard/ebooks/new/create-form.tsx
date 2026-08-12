"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Upload, Save, ArrowLeft, FileText, IndianRupee, Image as ImageIcon, Crop as CropIcon, ZoomIn } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

// Form & Validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import InputField from "@/components/AppInputFields/InputField";

// Helper for file size
function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper function to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Please select a category"),
    language: z.enum(["MARATHI", "HINDI", "ENGLISH"]).default("MARATHI"),
    price: z.coerce.number().min(0, "Price must be a valid number"),
    pages: z.coerce.number().min(0, "Pages must be a valid number").optional(),
    isCombo: z.boolean().default(false),
    includedEbooks: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEbookForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Crop State
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, _setRotate] = useState(0);
    const [aspect, _setAspect] = useState<number | undefined>(3 / 4);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // File States
    const [ebookFile, setEbookFile] = useState<File | null>(null);

    const [sampleImages, setSampleImages] = useState<File[]>([]);
    const [samplePreviews, setSamplePreviews] = useState<string[]>([]);

    // Form Hook
    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            category: "Property Law",
            language: "MARATHI" as const,
            price: 0,
            isCombo: false,
            includedEbooks: [],
        },
    });

    // Watch values for live preview
    const watchedTitle = form.watch("title");
    const watchedPrice = form.watch("price");
    const isCombo = form.watch("isCombo");
    const includedEbooks = form.watch("includedEbooks") || [];

    const moveBook = (index: number, direction: 'up' | 'down') => {
        const currentList = form.getValues("includedEbooks") || [];
        if (direction === 'up' && index > 0) {
            const newList = [...currentList];
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
            form.setValue("includedEbooks", newList, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        } else if (direction === 'down' && index < currentList.length - 1) {
            const newList = [...currentList];
            [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
            form.setValue("includedEbooks", newList, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
        }
    };

    // Fetch Ebooks for Combo Selection
    const [ebookOptions, setEbookOptions] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        async function fetchEbooks() {
            try {
                const res = await fetch("/api/admin/ebooks?view=minimal");
                if (res.ok) {
                    const data = await res.json();
                    setEbookOptions(data.map((e: { title: string; id: string }) => ({
                        label: e.title,
                        value: e.id
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch ebook options", error);
            }
        }
        fetchEbooks();
    }, []);

    // Handle Image Selection
    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setIsCropOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);

            // Clear input value to allow re-selecting same file if needed
            e.target.value = '';
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    // Generate Canvas Preview
    useEffect(() => {
        if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current
        ) {
            const image = imgRef.current;
            const canvas = previewCanvasRef.current;
            const crop = completedCrop;

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return;
            }

            const pixelRatio = window.devicePixelRatio;
            canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
            canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = 'high';

            const cropX = crop.x * scaleX;
            const cropY = crop.y * scaleY;

            const centerX = image.naturalWidth / 2;
            const centerY = image.naturalHeight / 2;

            ctx.save();

            // Translate to center to allow rotation (future proof)
            ctx.translate(-cropX, -cropY);
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);

            ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
            );

            ctx.restore();
        }
    }, [completedCrop, scale, rotate]);

    const handleApplyCrop = async () => {
        if (imgRef.current && previewCanvasRef.current && completedCrop) {
            // Generate Blob
            previewCanvasRef.current.toBlob((blob) => {
                if (blob) {
                    setCroppedBlob(blob);
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setIsCropOpen(false);
                    toast.success("Image cropped successfully!");
                }
            }, 'image/jpeg', 0.8); // Compress to JPEG 80% quality
        } else {
            setIsCropOpen(false);
        }
    }

    async function uploadDirectToS3(
        file: Blob,
        kind: "cover" | "sample" | "ebook",
        filename: string,
    ): Promise<{ key: string; publicUrl: string | null }> {
        const presignRes = await fetch("/api/admin/ebooks/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename, contentType: file.type, kind }),
        });
        if (!presignRes.ok) {
            const txt = await presignRes.text().catch(() => "");
            throw new Error(`Presign failed (${kind}): ${txt || presignRes.status}`);
        }
        const { uploadUrl, key, publicUrl } = (await presignRes.json()) as {
            uploadUrl: string; key: string; publicUrl: string | null;
        };
        const putRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
        });
        if (!putRes.ok) {
            throw new Error(`S3 upload failed (${kind}): ${putRes.status}`);
        }
        return { key, publicUrl };
    }

    async function onSubmit(values: FormValues) {
        setLoading(true);

        try {
            // Validate: non-combo requires PDF
            if (!values.isCombo && !ebookFile) {
                toast.error("Please upload the Ebook PDF file");
                setLoading(false);
                return;
            }

            // Client-side total size sanity (50MB) — direct-to-S3 path so this is just a guardrail.
            let totalSize = 0;
            if (croppedBlob) totalSize += croppedBlob.size;
            if (ebookFile) totalSize += ebookFile.size;
            sampleImages.forEach(f => totalSize += f.size);
            if (totalSize > 200 * 1024 * 1024) {
                toast.error(`Total file size (${formatBytes(totalSize)}) too large. Please compress.`);
                setLoading(false);
                return;
            }

            // 1) Upload cover (if any) directly to S3
            let coverImageUrl: string | null = null;
            if (croppedBlob) {
                const r = await uploadDirectToS3(croppedBlob, "cover", "cover-image.jpg");
                coverImageUrl = r.publicUrl;
            }

            // 2) Upload sample images
            const sampleImageUrls: string[] = [];
            for (const file of sampleImages) {
                const r = await uploadDirectToS3(file, "sample", file.name);
                if (r.publicUrl) sampleImageUrls.push(r.publicUrl);
            }

            // 3) Upload main PDF (if provided)
            let fileKey: string | null = null;
            if (ebookFile) {
                const r = await uploadDirectToS3(ebookFile, "ebook", ebookFile.name);
                fileKey = r.key;
            }

            // 4) POST metadata JSON
            const response = await fetch("/api/admin/ebooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    pages: values.pages,
                    category: values.category,
                    language: values.language,
                    isCombo: values.isCombo,
                    includedEbooks: values.includedEbooks ?? [],
                    coverImageUrl,
                    fileKey,
                    sampleImageUrls,
                }),
            });

            if (!response.ok) {
                const txt = await response.text().catch(() => "");
                throw new Error(txt || "Failed to create ebook");
            }

            toast.success("Ebook created successfully / नवीन पुस्तक तयार झाले");
            router.push("/dashboard/ebooks");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
                    <div className="flex flex-col gap-6 xl:flex-row">

                        {/* Left Column: Main Info */}
                        <div className="flex-1 space-y-6">
                            <Card className="border shadow-sm">
                                <CardHeader className="border-b bg-gray-50/50 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                                        <BookOpen className="h-4 w-4 text-brand-teal" />
                                        Basic Information / मूलभूत माहिती
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Enter the title, description and pricing details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <InputField
                                        name="title"
                                        label="Book Title / पुस्तकाचे शीर्षक"
                                        type="text"
                                        placeholder="Ex. Maharashtra Rent Control Act"
                                        required
                                    />

                                    <InputField
                                        name="description"
                                        label="Description / वर्णन"
                                        type="editor"
                                        placeholder="Enter detailed description... (AI generation available)"
                                        required
                                        generationPrompt="Write a compelling description for this legal ebook"
                                        context={watchedTitle} // Pass title as context for AI
                                    />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <InputField
                                            name="category"
                                            label="Category / श्रेणी"
                                            type="select"
                                            placeholder="Select Category"
                                            required
                                            options={[
                                                { value: "Property Law", label: "Property Law (मालमत्ता कायदा)" },
                                                { value: "Family Law", label: "Family Law (कौटुंबिक कायदा)" },
                                                { value: "Criminal Law", label: "Criminal Law (फौजदारी कायदा)" },
                                                { value: "Civil Law", label: "Civil Law (दिवाणी कायदा)" },
                                                { value: "Constitution", label: "Constitution (संविधान)" },
                                                { value: "Other", label: "Other (इतर)" },
                                            ]}
                                        />

                                        <InputField
                                            name="language"
                                            label="Language / भाषा"
                                            type="select"
                                            placeholder="Select Language"
                                            required
                                            options={[
                                                { value: "MARATHI", label: "मराठी (Marathi)" },
                                                { value: "HINDI", label: "हिंदी (Hindi)" },
                                                { value: "ENGLISH", label: "English" },
                                            ]}
                                        />

                                        <InputField
                                            name="price"
                                            label="Price (₹)"
                                            placeholder="e.g. 199"
                                            type="number"
                                            Icon={IndianRupee} // Retained Icon
                                            required // Retained required
                                            min={0} // Retained min
                                        />

                                        <InputField
                                            name="pages"
                                            label="No. of Pages"
                                            placeholder="e.g. 150"
                                            type="number"
                                            required // Added required for pages
                                            min={1} // Added min for pages
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader className="border-b bg-gray-50/50 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                                        <Upload className="h-4 w-4 text-brand-teal" /> Files / फाइल्स
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Upload necessary documents and images.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4">

                                    {/* Combo Toggle */}
                                    <div className="rounded-lg border border-yellow-100 bg-yellow-50/50 p-4">
                                        <InputField
                                            name="isCombo"
                                            label="Is this a Combo Package? / हा कॉम्बो पॅकेज आहे का?"
                                            type="switch"
                                            description="Enable this to create a package of multiple existing books."
                                        />

                                        {isCombo && (
                                            <div className="animate-in fade-in slide-in-from-top-2 mt-4">
                                                <InputField
                                                    name="includedEbooks"
                                                    label="Select Books for Combo / कॉम्बोसाठी पुस्तके निवडा"
                                                    type="multiSelect"
                                                    placeholder="Select books..."
                                                    options={ebookOptions}
                                                />
                                                <div className="mt-2 space-y-2">
                                                    {includedEbooks.length > 0 && (
                                                        <Label className="text-xs font-semibold text-muted-foreground">Order of Books (Top to Bottom)</Label>
                                                    )}
                                                    {includedEbooks.map((bookId, index) => {
                                                        const book = ebookOptions.find(e => e.value === bookId);
                                                        if (!book) return null;
                                                        return (
                                                            <div key={bookId} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                                                                        {index + 1}
                                                                    </span>
                                                                    <span className="max-w-50 truncate text-sm font-medium text-gray-700" title={book.label}>
                                                                        {book.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => moveBook(index, 'up')}
                                                                        disabled={index === 0}
                                                                    >
                                                                        <ArrowUp className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => moveBook(index, 'down')}
                                                                        disabled={index === includedEbooks.length - 1}
                                                                    >
                                                                        <ArrowDown className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cover Image */}
                                    <div className="space-y-2">
                                        <Label htmlFor="coverImage" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                                            <ImageIcon className="h-3 w-3" /> Cover Image
                                        </Label>
                                        <Input
                                            id="coverImage"
                                            name="coverImageInput" // Changed name to avoid direct submission
                                            type="file"
                                            accept="image/*"
                                            className="text-xs file:font-semibold file:text-brand-teal"
                                            onChange={onSelectFile}
                                        />
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Recommended Size: <strong className="text-gray-700">600x800px</strong> (Aspect Ratio: 3:4).
                                        </p>

                                        {previewUrl && (
                                            <div className="group relative mt-3 h-40 w-32 overflow-hidden rounded-md border bg-gray-100">
                                                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setIsCropOpen(true)}
                                                    >
                                                        <CropIcon className="mr-1 h-3 w-3" /> Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main PDF & Preview */}
                                    <>
                                        {/* Main PDF */}
                                        <div className="space-y-2">
                                            <Label htmlFor="ebookFile" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                                                <FileText className="h-3 w-3" /> Ebook PDF {!isCombo && <span className="text-red-500">*</span>}
                                            </Label>
                                            {isCombo && (
                                                <p className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-700">
                                                    कॉम्बोसाठी PDF ऐच्छिक आहे. अपलोड केल्यास, ही फाइल वापरली जाईल. अन्यथा, निवडलेल्या पुस्तकांचे PDF आपोआप मर्ज केले जाईल.
                                                    <br />
                                                    <span className="text-amber-600">(Optional for combo. If uploaded, this file will be used directly. Otherwise, selected books&apos; PDFs will be auto-merged.)</span>
                                                </p>
                                            )}
                                                {!ebookFile ? (
                                                    <Input
                                                        id="ebookFile"
                                                        name="ebookFile"
                                                        type="file"
                                                        accept="application/pdf"
                                                        className="text-xs file:font-semibold file:text-brand-teal"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) setEbookFile(e.target.files[0]);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50/50 p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                                <FileText className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="line-clamp-1 max-w-50 text-sm font-medium text-blue-900">{ebookFile.name}</p>
                                                                <p className="text-[10px] text-blue-500">{formatBytes(ebookFile.size)}</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-400 hover:bg-red-50 hover:text-red-500"
                                                            onClick={() => setEbookFile(null)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>



                                            {/* Sample Preview Images */}
                                            <div className="space-y-3 border-t border-gray-100 pt-6">
                                                <div className="flex items-center justify-between">
                                                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                                                        <ImageIcon className="h-3 w-3" /> Sample Preview Images (Index/Pages)
                                                    </Label>
                                                    <span className="text-[10px] font-medium text-brand-teal">Add multiple</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {samplePreviews.map((preview, index) => (
                                                        <div key={index} className="group relative aspect-3/4 overflow-hidden rounded-xl border bg-gray-50">
                                                            <Image src={preview} alt={`Sample ${index + 1}`} fill className="object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSampleImages(prev => prev.filter((_, i) => i !== index));
                                                                    setSamplePreviews(prev => prev.filter((_, i) => i !== index));
                                                                }}
                                                                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <label className="group flex aspect-3/4 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-brand-teal/50 hover:bg-brand-teal/5">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-brand-teal/10 group-hover:text-brand-teal">
                                                            <Upload className="h-4 w-4" />
                                                        </div>
                                                        <span className="mt-2 text-[10px] font-medium text-gray-400 group-hover:text-brand-teal">Upload Image</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files) {
                                                                    const files = Array.from(e.target.files);
                                                                    setSampleImages(prev => [...prev, ...files]);
                                                                    const newPreviews = files.map(file => URL.createObjectURL(file));
                                                                    setSamplePreviews(prev => [...prev, ...newPreviews]);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">These images will show up in a carousel on the book detail page.</p>
                                            </div>
                                        </>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Live Preview Info */}
                        <div className="w-full space-y-6 xl:w-87.5">

                            {/* Live Preview Section */}
                            <div className="sticky top-6">
                                <h3 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-muted-foreground">
                                    <BookOpen className="h-4 w-4" /> Live Preview / झलक
                                </h3>

                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
                                    <div className="mx-auto flex max-w-70 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                        {/* Preview Image */}
                                        <div className="relative flex aspect-3/4 items-center justify-center overflow-hidden bg-gray-100">
                                            {previewUrl ? (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                                                    <ImageIcon className="mb-2 h-10 w-10 opacity-30" />
                                                    <span className="text-[10px]">Cover Image will appear here</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preview Details */}
                                        <div className="p-3">
                                            <h4 className="mb-2 line-clamp-2 min-h-10 text-sm leading-tight font-bold text-gray-900">
                                                {watchedTitle || "Book Title..."}
                                            </h4>
                                            <div className="flex items-center justify-between border-t pt-2">
                                                <div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Price</p>
                                                    <p className="text-sm font-bold text-brand-teal">₹{watchedPrice || "0"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-center text-[10px] text-muted-foreground">
                                        This is how your product will appear in the dashboard.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sticky Actions Footer */}
                    <div className="shadow-negative fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white p-4 md:left-64">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="text-muted-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel / मागे जा
                        </Button>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={loading} className="min-w-50 bg-brand-teal shadow-md hover:bg-brand-teal/90">
                                {loading ? "Creating..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Create Ebook / पु तक तयार करा
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            {/* Crop Dialog */}
            <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Adjust Image / प्रतिमा संपादित करा</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4 py-4">
                        {!!imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                className="max-h-125"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    style={{ transform: `scale(${scale})` }}
                                    onLoad={onImageLoad}
                                    className="max-h-[50vh] object-contain md:max-h-100"
                                />
                            </ReactCrop>
                        )}

                        <div className="w-full space-y-2 px-4">
                            <Label className="flex items-center gap-2 text-xs font-semibold">
                                <ZoomIn className="h-3 w-3" /> Zoom
                            </Label>
                            <Slider
                                defaultValue={[1]}
                                min={1}
                                max={3}
                                step={0.1}
                                value={[scale]}
                                onValueChange={(value) => setScale(value[0])}
                            />
                        </div>

                        {/* Hidden Canvas for creating blob */}
                        <canvas
                            ref={previewCanvasRef}
                            style={{
                                objectFit: 'contain',
                                width: completedCrop?.width,
                                height: completedCrop?.height,
                                display: 'none'
                            }}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropOpen(false)}>Cancel</Button>
                        <Button onClick={handleApplyCrop} className="bg-brand-teal hover:bg-brand-teal/90">
                            Apply / लागू करा
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    );
}
