"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { FieldValues, useFormContext } from "react-hook-form";
import { IconType } from "react-icons";
import { BaseInputProps } from "../InputField";
import React from "react";

// Explicitly define Option interface if not imported
// Explicitly define Option interface if not imported
interface Option {
  value: string | boolean | null;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

// Ensure Props extend BaseInputProps correctly
interface InputRadioProps<T extends FieldValues>
  extends Omit<BaseInputProps<T>, "form" | "type"> {
  options: Option[];
  direction?: "row" | "column";
  Icon?: LucideIcon | IconType;
  iconClassName?: string;
}

const InputRadio = <T extends FieldValues>({
  label,
  name,
  options,
  direction = "column",
  className,
  disabled,
  required,
  description,
  Icon,
  iconClassName,
}: InputRadioProps<T>) => {
  const form = useFormContext<T>();

  if (!form) {
    throw new Error("InputRadio must be used within a FormProvider");
  }

  // Calculate grid columns based on options length and direction
  const getGridClass = () => {
    if (direction === "row") return "flex flex-row flex-wrap gap-6";
    if (options.length <= 2) return "grid-cols-2";
    if (options.length <= 4) return "grid-cols-1";
    return "grid-cols-3";
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "w-full",
            "group transition-all duration-300 ease-in-out",
            className
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4 text-muted-foreground",
                    "transition-colors duration-200",
                    "group-hover:text-primary",
                    iconClassName
                  )}
                />
              )}
              {label && (
                <Label
                  className={cn(
                    "text-sm font-medium",
                    "transition-colors duration-200",
                    "group-hover:text-primary",
                    required &&
                      "after:ml-0.5 after:text-red-500 after:content-['*']"
                  )}
                >
                  {label}
                </Label>
              )}
            </div>
            {description && (
              <p className="pl-6 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <FormControl>
            <div className="relative flex min-h-10 w-full items-start py-2">
              <RadioGroup
                onValueChange={field.onChange}
                value={String(field.value)} // Ensure value is string for RadioGroup
                className={cn("grid w-full gap-4", getGridClass())}
                disabled={disabled}
              >
                {options.map((option) => (
                  <div
                    key={String(option.value)}
                    className={cn("flex items-center space-x-2", "group/radio")}
                  >
                    <RadioGroupItem
                      value={String(option.value)}
                      id={`${name}-${String(option.value)}`}
                      className={cn(
                        "h-4 w-4",
                        "border border-input",
                        "data-[state=checked]:border-primary",
                        "data-[state=checked]:text-primary",
                        "transition-colors duration-200",
                        "focus:ring-2 focus:ring-primary/20",
                        "cursor-pointer"
                      )}
                    />
                    <Label
                      htmlFor={`${name}-${String(option.value)}`}
                      className={cn(
                        "cursor-pointer text-sm font-normal",
                        "text-muted-foreground group-hover/radio:text-foreground",
                        "transition-colors duration-200"
                      )}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </FormControl>
          <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
        </FormItem>
      )}
    />
  );
};

export default InputRadio;
