"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import Select, { GroupBase, StylesConfig } from "react-select";
import { InputFieldProps } from "../InputField";

const InputSelect: React.FC<Omit<InputFieldProps, "form">> = (props) => {
  const {
    label,
    name,
    placeholder,
    className,
    disabled,
    Icon,
    options,
    description,
    required,
    isSearchable = false,
  } = props;
  const form = useFormContext();

  if (!form) {
    throw new Error("InputSelect must be used within a FormProvider");
  }

  interface Option {
    label: string;
    value: string;
  }

  const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
    // ... same styles ...
    control: (provided, state) => ({
      ...provided,
      minHeight: "44px",
      border: state.isFocused
        ? "2px solid var(--primary)"
        : "2px solid var(--input)",
      borderRadius: "var(--radius)",
      backgroundColor: disabled ? "var(--muted)" : "transparent",
      boxShadow: state.isFocused ? "0 0 0 2px var(--primary)/0.2" : "none",
      transition: "all 200ms ease",
      "&:hover": {
        borderColor: "var(--primary)",
        cursor: "pointer",
      },
      paddingLeft: "38px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
      paddingLeft: "0",
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--foreground)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--foreground)",
      transition: "color 200ms ease",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      animation: "scaleIn 200ms ease",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      overflowX: "hidden",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
        ? "var(--accent)"
        : "transparent",
      color: state.isSelected
        ? "var(--primary-foreground)"
        : "var(--foreground)",
      cursor: "pointer",
      transition: "all 150ms ease",
      "&:hover": {
        backgroundColor: state.isSelected ? "var(--primary)" : "var(--accent)",

      },
      zIndex: 9999,
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      transition: "transform 200ms ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
      color: state.isFocused ? "var(--primary)" : "var(--muted-foreground)",
      "&:hover": {
        color: "var(--primary)",
      },
    }),
  };

  // Sort options by label in ascending order
  const sortedOptions = React.useMemo(() => {
    if (!options) return [];
    return props.is_sorted
      ? [...options].sort((a, b) => a.label.localeCompare(b.label))
      : options;
  }, [options, props.is_sorted]);

  const mappedOptions: Option[] = React.useMemo(() => {
    return sortedOptions.map((opt) => ({
      label: opt.label,
      value: opt.value ?? "",
    }));
  }, [sortedOptions]);

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
            <div className="relative flex w-full items-center">
              {Icon && (
                <div className="absolute top-1/2 left-3 z-0 -translate-y-1/2 transform text-muted-foreground transition-colors group-hover:text-primary">
                  <Icon size={20} />
                </div>
              )}
              <Select<Option, false, GroupBase<Option>>
                menuPlacement="auto"
                {...field}
                isDisabled={disabled}
                options={mappedOptions}
                placeholder={placeholder}
                className="w-full"
                styles={customStyles}
                value={mappedOptions.find((opt) => opt.value === (field.value ?? ""))}
                onChange={(newValue) => field.onChange(newValue?.value)}
                components={{
                  IndicatorSeparator: () => null,
                }}
                isSearchable={isSearchable}
                menuShouldScrollIntoView={false}
                instanceId={`select-${name}`}
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

export default InputSelect;
