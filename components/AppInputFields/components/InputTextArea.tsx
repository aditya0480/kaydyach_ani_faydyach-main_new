import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { InputFieldProps } from "../InputField";

const InputTextArea = (props: Omit<InputFieldProps, "form">) => {
  const {
    label,
    name,
    placeholder,
    className,
    disabled,
    Icon,
    iconClassName,
    description,
    required,
  } = props;

  const form = useFormContext();

  if (!form) {
    throw new Error("InputTextArea must be used within a FormProvider");
  }

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={({ field }) => {
        return (
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
                required &&
                  "after:ml-0.5 after:text-red-500 after:content-['*']"
              )}
            >
              {label}
            </FormLabel>
            <FormControl>
              <div className="relative w-full">
                {Icon && (
                  <Icon
                    size={10}
                    className={cn(
                      "absolute top-3 left-3 z-10 h-4 w-4",
                      "text-muted-foreground transition-colors duration-200",
                      "group-hover:text-primary",
                      iconClassName
                    )}
                  />
                )}

                <Textarea
                  className={cn(
                    "w-full",
                    "resize-none",
                    "min-h-20",
                    "transition-all duration-200",
                    "border-2 focus:border-primary",
                    "hover:border-primary/50",
                    "rounded-md shadow-sm",
                    "placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-primary/20",
                    "focus-visible:ring-primary",
                    Icon ? "pl-10" : "pl-3"
                  )}
                  placeholder={placeholder}
                  {...field}
                />
              </div>
            </FormControl>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            <FormMessage className="animate-in fade-in-50 mt-1 text-xs font-medium text-destructive" />
          </FormItem>
        );
      }}
    />
  );
};

export default InputTextArea;
