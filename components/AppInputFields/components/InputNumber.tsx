"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { IconType } from "react-icons";

interface InputNumberProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  Icon?: LucideIcon | IconType;
  iconClassName?: string;
  min?: number;
  max?: number;
  step?: number;
}

const InputNumber = <T extends FieldValues>({
  label,
  name,
  placeholder,
  className,
  disabled = false,
  required = false,
  description,
  Icon,
  iconClassName,
  min,
  max,
  step = 1,
}: InputNumberProps<T>) => {
  const form = useFormContext<T>();

  if (!form) {
    throw new Error("InputNumber must be used within a FormProvider");
  }

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full",
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
            <div className="relative w-full">
              <Input
                type="number"
                min={min}
                max={max}
                step={step}
                onWheel={(e) => e.currentTarget.blur()}
                className={cn(
                  "h-11 w-full",
                  "transition-all duration-200",
                  "border-2 focus:border-primary",
                  "hover:border-primary/50",
                  "rounded-md shadow-sm",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-primary/20",
                  Icon ? "pl-10" : "pl-3"
                )}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Convert to number if value is not empty, otherwise keep as empty string
                  if (value === "") {
                    field.onChange("");
                  } else {
                    // Pass as string to allow typing decimals (e.g. "50.00")
                    // Zod schema with z.coerce.number() will handle the conversion
                    field.onChange(value);
                  }
                }}
              />
              {Icon && (
                <Icon
                  size={16}
                  className={cn(
                    "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2",
                    "pointer-events-none text-muted-foreground",
                    "transition-colors duration-200 group-hover:text-primary",
                    iconClassName
                  )}
                />
              )}
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

export default React.memo(InputNumber) as <T extends FieldValues>(
  props: InputNumberProps<T>
) => React.ReactNode;
