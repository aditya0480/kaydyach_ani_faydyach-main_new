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
import { Eye, EyeOff } from "lucide-react";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";
import { InputFieldProps } from "../InputField";

const InputPassword: FC<Omit<InputFieldProps, "form">> = (props) => {
  const {
    label,
    name,
    placeholder,
    className,
    disabled = false,
    Icon,
    iconClassName,
    required = false,
    description,
  } = props;

  const form = useFormContext();

  if (!form) {
    throw new Error("InputPassword must be used within a FormProvider");
  }

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Password strength calculation
  const calculateStrength = (password: string): number => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = calculateStrength(form.watch(name));

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-yellow-500";
    if (score <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score <= 1) return "Weak";
    if (score <= 2) return "Fair";
    if (score <= 3) return "Good";
    return "Strong";
  };

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
              "text-sm font-medium",
              "transition-colors duration-200",
              "group-hover:text-primary",
              required && "after:ml-0.5 after:text-red-500 after:content-['*']"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon
                  size={10}
                  className={cn(
                    "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                    iconClassName
                  )}
                />
              )}

              <Input
                type={showPassword ? "text" : "password"}
                className={cn(
                  "h-11 w-full",
                  "transition-all duration-200",
                  "border-2 focus:border-primary",
                  "hover:border-primary/50",
                  "rounded-md shadow-sm",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-primary/20",
                  "pl-10"
                )}
                placeholder={placeholder}
                {...field}
              />

              <button
                type="button"
                onClick={togglePassword}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormControl>
          
          {/* Password Strength Indicator */}
          {field.value && (
            <div className="mt-2 space-y-1">
              <div className="flex h-1 gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-full flex-1 rounded-full transition-all duration-300",
                      strength >= level ? getStrengthColor(strength) : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className={cn("text-right text-xs font-medium", 
                strength <= 1 ? "text-red-500" : 
                strength <= 2 ? "text-yellow-500" : 
                strength <= 3 ? "text-blue-500" : "text-green-500"
              )}>
                {getStrengthLabel(strength)}
              </p>
            </div>
          )}

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
        </FormItem>
      )}
    />
  );
};

export default InputPassword;
