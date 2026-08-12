"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { BaseInputProps } from "../InputField";

// Generate years from 1900 to current year + 10
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 1900; year <= currentYear + 10; year++) {
    years.push(year);
  }
  return years.reverse(); // Most recent years first
};

// Month names for better UX
const months = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const InputDate = <T extends FieldValues>({
  label,
  name,
  placeholder,
  className,
  disabled = false,
  required = false,
  description,
}: Omit<BaseInputProps<T>, "form">) => {
  const form = useFormContext<T>();
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(new Date());

  if (!form) {
    throw new Error("InputDate must be used within a FormProvider");
  }

  const years = React.useMemo(() => generateYears(), []);

  // Handle month/year navigation
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(parseInt(monthIndex));
    setViewDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(parseInt(year));
    setViewDate(newDate);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
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
              "text-sm font-medium transition-colors",
              "group-hover:text-primary",
              required && "after:ml-0.5 after:text-red-500 after:content-['*']"
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative w-full">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      disabled={disabled}
                      className={cn(
                        "min-h-10.5 w-full text-left font-normal",
                        "flex items-center justify-start gap-2 px-3 py-2",
                        "border-2 hover:border-primary/50 focus-visible:border-primary",
                        "transition-all duration-200 ease-in-out",
                        "shadow-sm hover:shadow-md focus-visible:shadow-md",
                        "bg-background hover:bg-accent/50",
                        !field.value && "text-muted-foreground",
                        disabled && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <CalendarIcon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          field.value ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <div className="flex-1 truncate text-left">
                        {field.value ? (
                          <span className="font-medium text-foreground">
                            {format(
                              new Date(field.value),
                              "EEEE, MMMM do, yyyy"
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {placeholder || "Select a date"}
                          </span>
                        )}
                      </div>
                    </Button>
                  </FormControl>
                </DialogTrigger>
                <DialogContent className="overflow-hidden p-0 sm:max-w-85">
                  <DialogHeader className="border-b bg-muted/10 px-6 py-4">
                    <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      Select Date
                    </DialogTitle>
                  </DialogHeader>

                  {/* Enhanced Header with Month/Year Selectors */}
                  <div className="flex items-center justify-between border-b bg-muted/20 p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      {/* Month Selector */}
                      <Select
                        value={viewDate.getMonth().toString()}
                        onValueChange={handleMonthChange}
                      >
                        <SelectTrigger className="h-8 border-0 bg-transparent text-sm font-medium hover:bg-primary/10 focus:bg-primary/10">
                          <SelectValue>
                            {months[viewDate.getMonth()].label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-50">
                          {months.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Year Selector */}
                      <Select
                        value={viewDate.getFullYear().toString()}
                        onValueChange={handleYearChange}
                      >
                        <SelectTrigger className="h-8 border-0 bg-transparent text-sm font-medium hover:bg-primary/10 focus:bg-primary/10">
                          <SelectValue>{viewDate.getFullYear()}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-50">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendar Component */}
                  <div className="flex justify-center px-4 py-6">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      month={viewDate}
                      onMonthChange={setViewDate}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                          setOpen(false);
                        } else {
                          field.onChange("");
                        }
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="mx-auto rounded-md"
                      classNames={{
                        months: "flex flex-col space-y-4",
                        month: "space-y-4 mx-auto",
                        caption: "hidden", // Hide default caption since we have custom header
                        table: "w-full border-collapse",
                        head_row: "flex justify-center mb-1",
                        head_cell:
                          "text-muted-foreground rounded-md w-10 h-10 font-medium text-sm flex items-center justify-center",
                        row: "flex justify-center mt-1",
                        cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
                        day: cn(
                          "flex h-10 w-10 items-center justify-center rounded-md p-0 text-sm font-medium",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:bg-accent focus-visible:text-accent-foreground",
                          "transition-all duration-150 ease-in-out",
                          "aria-selected:opacity-100"
                        ),
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus-visible:bg-primary/90 focus-visible:text-primary-foreground shadow-sm",
                        day_today:
                          "bg-accent text-accent-foreground font-semibold border-2 border-primary/20",
                        day_outside: "text-muted-foreground/40 opacity-50",
                        day_disabled:
                          "text-muted-foreground/30 opacity-30 cursor-not-allowed",
                      }}
                    />
                  </div>

                  {/* Quick Actions Footer */}
                  {/* Quick Actions Footer with Presets */}
                  <div className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-3">
                    <div className="flex flex-wrap justify-center gap-2">
                       <Button
                        variant="secondary"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() - 1);
                          field.onChange(format(date, "yyyy-MM-dd"));
                          setViewDate(date);
                          setOpen(false);
                        }}
                        className="h-6 px-2 text-[10px]"
                      >
                        Yesterday
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const today = new Date();
                          field.onChange(format(today, "yyyy-MM-dd"));
                          setViewDate(today);
                          setOpen(false);
                        }}
                        className="h-6 px-2 text-[10px]"
                      >
                        Today
                      </Button>
                       <Button
                        variant="secondary"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 1);
                          field.onChange(format(date, "yyyy-MM-dd"));
                          setViewDate(date);
                          setOpen(false);
                        }}
                        className="h-6 px-2 text-[10px]"
                      >
                        Tomorrow
                      </Button>
                       <Button
                        variant="secondary"
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 7);
                          field.onChange(format(date, "yyyy-MM-dd"));
                          setViewDate(date);
                          setOpen(false);
                        }}
                        className="h-6 px-2 text-[10px]"
                      >
                        Next Week
                      </Button>
                    </div>
                    {field.value && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          field.onChange("");
                          setOpen(false);
                        }}
                        className="h-7 w-full px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Clear Date
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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

export default React.memo(InputDate) as <T extends FieldValues>(
  props: Omit<BaseInputProps<T>, "form">
) => React.ReactNode;
