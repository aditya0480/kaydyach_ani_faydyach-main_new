"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  Clock,
  FileText,
  Hash,
  Image,
  Lock,
  LucideIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Star,
  Type,
} from "lucide-react";
import React from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { IconType } from "react-icons";
import InputAddress from "./components/InputAddress/input";
import InputAITextArea from "./components/InputAITextArea";
import InputCheckbox from "./components/InputCheckBox";
import InputDate from "./components/InputDate";
import ImageInput from "./components/InputImage/InputImage";
import InputMultiCheckbox from "./components/InputMultiCheckbox";
import InputMultipleDates from "./components/InputMultipleDates";
import InputMultiSelect from "./components/InputMultiSelect";
import InputNumber from "./components/InputNumber";
import InputOTPController from "./components/InputOTP";
import InputPassword from "./components/InputPassword";
import InputPhone from "./components/InputPhone";
import InputRadio from "./components/InputRadio";
import InputRating from "./components/InputRating";
import InputSelect from "./components/InputSelect";
import InputSwitch from "./components/InputSwitch";
import InputTextArea from "./components/InputTextArea";
import ModernImageInput from "./components/ModernImageInput";
import MultiImageInput from "./components/multiImageInput";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
// Detailed skeleton for the editor to match the actual UI
const EditorLoadingSkeleton = () => {
  return (
    <div className="w-full space-y-2">
      {/* Label Skeleton */}
      <Skeleton className="h-4 w-24" />
      
      <div className="overflow-hidden rounded-md border bg-background">
        {/* Toolbar Skeleton - Matches p-2 and h-8 buttons */}
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/50 p-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Editor Content Skeleton - Matches px-4 py-3 and min-h-[200px] */}
        <div className="min-h-50 space-y-3 px-4 py-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* AI Section Skeleton - Matches mt-3 p-3 and inner elements */}
      <div className="mt-3 rounded-md border border-border bg-muted/50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Skeleton className="h-4 w-4 rounded-full" />
             <Skeleton className="h-4 w-32" />
          </div>
        </div>
        {/* Matches min-h-20 (80px) for textarea */}
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="mt-2 flex justify-end">
          {/* Matches button size */}
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        {/* Matches help text */}
        <div className="mt-2">
           <Skeleton className="h-3 w-48" />
        </div>
      </div>
      
      {/* Description Skeleton */}
      <Skeleton className="mt-1 h-3 w-64" />
    </div>
  );
};

const DynamicInputEditorV2 = dynamic(() => import("./InputEditorJS"), {
  ssr: false,
  loading: () => <EditorLoadingSkeleton />,
});

// Base type for form values
type DefaultFormValues = Record<string, unknown>;

// Function to get default icon for each input type
const getDefaultIcon = (type: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    text: Type,
    email: Mail,
    password: Lock,
    number: Hash,
    file: FileText,
    select: ChevronDown,
    multiSelect: ChevronDown,
    multiCheckbox: CheckSquare,
    "text-area": FileText,
    "ai-text-area": FileText,
    editor: FileText,
    date: Calendar,
    "multiple-dates": Calendar,
    "datetime-local": Clock,
    checkbox: CheckSquare,
    radio: CheckSquare,
    yes_no_radio: CheckSquare,
    phone: Phone,
    places_autocomplete: MapPin,
    rating: Star,
    avatar: Image,
    "modern-image": Image,
    multiSelect_images: Image,
    "color-picker": Palette,
    switch: CheckSquare,
    OTP: Hash,
  };

  return iconMap[type] || Type;
};

export interface BaseInputProps<T extends FieldValues = DefaultFormValues> {
  label?: string;
  name: Path<T>;
  placeholder?: string;
  description?: string;
  type:
    | "text"
    | "password"
    | "email"
    | "OTP"
    | "avatar"
    | "number"
    | "file"
    | "select"
    | "multiSelect"
    | "multiCheckbox"
    | "multiSelect_images"
    | "rating"
    | "places_autocomplete"
    | "text-area"
    | "ai-text-area"
    | "editor"
    | "date"
    | "multiple-dates"
    | "datetime-local"
    | "checkbox"
    | "radio"
    | "yes_no_radio"
    | "switch"
    | "phone"
    | "modern-image"
    | "color-picker";
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  onComplete?: (data: unknown) => void;
}

export interface InputFieldProps<T extends FieldValues = DefaultFormValues>
  extends BaseInputProps<T> {
  options?: {
    value: string | null;
    label: string;
  }[];
  async_function?: (
    input: string
  ) => Promise<{ value: string; label: string }[]>;
  Icon?: LucideIcon | IconType;
  iconClassName?: string;
  is_sorted?: true | false;
  isSearchable?: boolean;
  // AI-specific props
  generationPrompt?: string;
  context?: string;
  maxLength?: number;
  aiButtonText?: string;
  // Location-specific props
  detectLocation?: boolean;
  autoDetectLocation?: boolean;
  // Number input props
  min?: number;
  max?: number;
  step?: number;
}

const InputField = <T extends FieldValues>({
  label,
  name,
  placeholder,
  type,
  className,
  disabled = false,
  autoComplete = "off",
  Icon,
  iconClassName,
  required = false,
  options,
  description,
  isSearchable,
  is_sorted = false,
  onComplete,
  generationPrompt,
  context,
  maxLength,
  aiButtonText,
  detectLocation = false,
  autoDetectLocation = false,
  min,
  max,
  step,
}: InputFieldProps<T>) => {
  const form = useFormContext<T>();

  if (!form) {
    throw new Error("InputField must be used within a FormProvider");
  }

  // Use provided icon or get default icon for the input type
  const ComponentIcon = Icon || getDefaultIcon(type);

  if (type === "OTP") {
    return (
      <InputOTPController
        label={label}
        name={name}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        onComplete={onComplete}
        placeholder={placeholder}
      />
    );
  }

  if (type === "modern-image") {
    return (
      <ModernImageInput
        label={label}
        name={name}
        className={className}
        required={required}
        description={description}
      />
    );
  }

  if (type === "avatar") {
    return (
      <ImageInput
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "select" && options) {
    return (
      <InputSelect
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        options={options}
        required={required}
        type={type}
        description={description}
        isSearchable={isSearchable}
        is_sorted={is_sorted}
      />
    );
  }

  if (type === "multiSelect" && options) {
    return (
      <InputMultiSelect
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        options={options}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "multiCheckbox" && options) {
    return (
      <InputMultiCheckbox
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        options={options}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "multiSelect_images") {
    return (
      <MultiImageInput
        label={label}
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        description={description}
      />
    );
  }

  if (type === "rating") {
    return (
      <InputRating
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        placeholder={placeholder}
      />
    );
  }

  if (type === "places_autocomplete") {
    return (
      <InputAddress
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        detectLocation={detectLocation}
        autoDetectLocation={autoDetectLocation}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <InputCheckbox
        label={label}
        name={name}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        placeholder={placeholder}
      />
    );
  }

  if (type === "radio" && options) {
    return (
      <InputRadio
        label={label}
        name={name}
        options={options}
        className={className}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "yes_no_radio") {
    return (
      <InputRadio
        label={label}
        name={name}
        options={[
          { label: "Yes", value: "Yes" },
          { label: "No", value: "No" },
        ]}
        className={className}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        description={description}
        placeholder={placeholder}
      />
    );
  }

  if (type === "password") {
    return (
      <InputPassword
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "date") {
    return (
      <InputDate
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
      />
    );
  }

  if (type === "multiple-dates") {
    return (
      <InputMultipleDates
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
      />
    );
  }

  if (type === "number") {
    return (
      <InputNumber
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        min={min}
        max={max}
        step={step}
      />
    );
  }

  if (type === "switch") {
    return (
      <InputSwitch
        label={label || ""}
        name={name}
        description={description}
        className={className}
        disabled={disabled}
        required={required}
        Icon={ComponentIcon}
      />
    );
  }

  if (type === "phone") {
    return (
      <InputPhone
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
      />
    );
  }

  if (type === "text-area") {
    return (
      <InputTextArea
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        type={type}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
      />
    );
  }

  if (type === "editor") {
    return (
      <DynamicInputEditorV2
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon as LucideIcon}
        iconClassName={iconClassName}
        context={context}
        defaultPrompt={generationPrompt}
      />
    );
  }

  if (type === "ai-text-area") {
    return (
      <InputAITextArea
        label={label}
        name={name}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        required={required}
        description={description}
        Icon={ComponentIcon}
        iconClassName={iconClassName}
        generationPrompt={generationPrompt}
        context={context}
        maxLength={maxLength}
        aiButtonText={aiButtonText}
      />
    );
  }

  if (type === "color-picker") {
    return (
      <FormField
        control={form.control}
        name={name}
        disabled={disabled}
        render={({ field }) => (
          <FormItem
            className={cn(
              "relative w-full",
              "group transition-all duration-300 ease-in-out",
              className
            )}
          >
            <FormLabel
              className={cn(
                "text-sm font-medium transition-colors",
                "group-hover:text-primary",
                required &&
                  "after:ml-0.5 after:text-red-500 after:content-['*']"
              )}
            >
              {label}
            </FormLabel>
            <FormControl>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className={cn(
                      "h-11 w-full px-3 py-2 text-left",
                      "border-2 border-input bg-background",
                      "rounded-md shadow-sm transition-colors",
                      "hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "flex items-center gap-2"
                    )}
                  >
                    <div
                      className="h-4 w-4 shrink-0 rounded border border-gray-300"
                      style={{ backgroundColor: field.value || "#3B82F6" }}
                    />
                    <span className="flex-1 truncate text-sm">
                      {field.value || "#3B82F6"}
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-3" align="start">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Choose a color</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#F97316",
                        "#06B6D4",
                        "#84CC16",
                        "#EC4899",
                        "#6B7280",
                        "#14B8A6",
                        "#A855F7",
                        "#DC2626",
                        "#059669",
                        "#D97706",
                        "#7C3AED",
                        "#0891B2",
                        "#65A30D",
                        "#BE185D",
                        "#374151",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "h-8 w-8 rounded-md border-2 transition-all duration-200",
                            "hover:scale-110 hover:shadow-md",
                            "focus:ring-2 focus:ring-primary/50 focus:outline-none",
                            field.value === color
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          disabled={disabled}
                        >
                          {field.value === color && (
                            <Check className="mx-auto h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Custom color input */}
                    <div className="border-t pt-2">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Custom color (hex):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1 rounded border px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          disabled={disabled}
                        />
                        <input
                          type="color"
                          value={field.value || "#3B82F6"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-6 w-8 cursor-pointer rounded border"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </FormControl>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />
    );
  }

  if (type === "datetime-local") {
    return (
      <FormField
        control={form.control}
        name={name}
        disabled={disabled}
        render={({ field }) => (
          <FormItem className={cn("w-full", className)}>
            <FormLabel
              className={cn(
                "text-sm font-medium",
                required &&
                  "after:ml-0.5 after:text-red-500 after:content-['*']"
              )}
            >
              {label}
            </FormLabel>
            <FormControl>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-md border-2 px-3 shadow-sm placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...field}
              />
            </FormControl>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full min-w-0",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <FormLabel
            className={cn(
              "text-sm font-medium transition-colors",
              "group-hover:text-primary",
              required && "after:ml-0.5 after:text-red-500 after:content-['*']"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative w-full min-w-0">
              <ComponentIcon
                size={10}
                className={cn(
                  "absolute top-1/2 left-3 z-0 h-4 w-4 -translate-y-1/2",
                  "text-muted-foreground transition-colors duration-200",
                  "group-hover:text-primary",
                  iconClassName
                )}
              />
              <Input
                autoComplete={autoComplete}
                size={6}
                onWheel={(e) => e.currentTarget.blur()}
                className={cn(
                  "h-11 w-full min-w-0",
                  "transition-all duration-200",
                  "border-2 focus:border-primary",
                  "hover:border-primary/50",
                  "rounded-md shadow-sm",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-primary/20",
                  "pl-10"
                )}
                type={type}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ""} // Ensure value is always a string
              />
            </div>
          </FormControl>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
        </FormItem>
      )}
    />
  );
};

export default React.memo(InputField) as <T extends FieldValues>(
  props: InputFieldProps<T>
) => React.ReactNode;
