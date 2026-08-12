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
import { GroupBase, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { InputFieldProps } from "../InputField";

const InputMultiSelect: React.FC<InputFieldProps> = (props) => {
  const {
    label,
    name,
    options,
    className,
    placeholder,
    disabled,
    Icon,
    required,
    description,
  } = props;
  const form = useFormContext();

  if (!form) {
    throw new Error("InputMultiSelect must be used within a FormProvider");
  }

  interface Option {
    label: string;
    value: string;
  }

  const customStyles: StylesConfig<Option, true, GroupBase<Option>> = {
    // ... same styles ...
    control: (provided, state) => ({
      ...provided,
      minHeight: "44px",
      border: state.isFocused
        ? "2px solid var(--primary)"
        : "2px solid var(--input)",
      borderRadius: "var(--radius)",
      backgroundColor: disabled ? "var(--muted)" : "transparent",
      boxShadow: state.isFocused ? "0 0 0 2px var(--primary) / 0.2" : "none",
      transition: "all 200ms ease",
      "&:hover": {
        borderColor: "var(--input)",
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
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "var(--accent)",
      borderRadius: "var(--radius)",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "var(--accent-foreground)",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "var(--accent-foreground)",
      "&:hover": {
        backgroundColor: "var(--destructive)",
        color: "var(--destructive-foreground)",
      },
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

  const mappedOptions: Option[] = React.useMemo(() => {
    return options?.map((opt) => ({
      label: opt.label,
      value: opt.value ?? "",
    })) ?? [];
  }, [options]);

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
            <div className="relative flex w-full items-start">
              {Icon && (
                <div className="absolute top-5 left-3 z-0 -translate-y-1/2 transform text-muted-foreground transition-colors group-hover:text-primary">
                  <Icon size={20} />
                </div>
              )}
              <CreatableSelect<Option, true, GroupBase<Option>>
                {...field}
                className="w-full"
                value={(field.value || []).map((val: string) => mappedOptions.find(opt => opt.value === val)).filter((opt: Option | undefined): opt is Option => !!opt)}
                placeholder={placeholder}
                isMulti
                name={name}
                options={mappedOptions}
                instanceId={`select-${name}`}
                onChange={(newValue) => {
                  field.onChange(newValue ? newValue.map(v => v.value) : []);
                }}
                styles={customStyles}
                components={{
                  IndicatorSeparator: () => null,
                }}
                menuShouldScrollIntoView={false}
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

export default InputMultiSelect;
