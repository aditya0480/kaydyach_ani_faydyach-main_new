"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  Plus,
  Repeat,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";
import { FieldValues, Path, PathValue, useFormContext } from "react-hook-form";
import { BaseInputProps } from "../InputField";

// Styles for scrollable popover
const styles = `
  .date-picker-popover {
    max-height: 80vh !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .date-picker-content {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--primary) / 0.2) transparent;
  }
  .date-picker-content::-webkit-scrollbar {
    width: 4px;
  }
  .date-picker-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .date-picker-content::-webkit-scrollbar-thumb {
    background-color: hsl(var(--primary) / 0.2);
    border-radius: 2px;
  }
  .date-picker-content::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--primary) / 0.3);
  }
  .date-picker-footer {
    border-top: 1px solid hsl(var(--border));
    padding: 0.75rem;
    background: linear-gradient(to right, hsl(var(--muted) / 0.2), hsl(var(--muted) / 0.3));
    backdrop-filter: blur(8px);
  }
`;

const InputMultipleDates = <T extends FieldValues>({
  label,
  name,
  placeholder,
  className,
  disabled = false,
  required = false,
  description,
}: Omit<BaseInputProps<T>, "form" | "type">) => {
  const form = useFormContext<T>();
  const [open, setOpen] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState(false);

  if (!form) {
    throw new Error("InputMultipleDates must be used within a FormProvider");
  }

  const selectedDates: string[] = form.watch(name) || [];

  // Smart suggestions for common compliance dates
  const smartSuggestions = [
    {
      day: 1,
      label: "1st of each month",
      description: "Monthly reports, invoices",
      icon: Target,
    },
    {
      day: 15,
      label: "15th of each month",
      description: "Mid-month reviews, payroll",
      icon: Clock,
    },
    {
      day: 30,
      label: "30th of each month",
      description: "Month-end closing, summaries",
      icon: Repeat,
    },
    {
      day: 5,
      label: "5th of each month",
      description: "Payment deadlines",
      icon: Target,
    },
    {
      day: 10,
      label: "10th of each month",
      description: "Tax submissions",
      icon: Clock,
    },
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Format as MM-DD (month-day only)
    const monthDay = format(date, "MM-dd");

    const currentDates: string[] = form.getValues(name) || [];

    // Check if date already exists
    if (currentDates.includes(monthDay)) {
      // Remove if already selected
      const updatedDates = currentDates.filter((d: string) => d !== monthDay);
      form.setValue(name, updatedDates as PathValue<T, Path<T>>);
    } else {
      // Add new date
      form.setValue(name, [...currentDates, monthDay] as PathValue<T, Path<T>>);
    }
  };

  const handleQuickSelection = (targetDay: number) => {
    setIsLoading(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      const currentDates: string[] = form.getValues(name) || [];
      const newDates: string[] = [];

      // Generate dates for all 12 months
      for (let month = 1; month <= 12; month++) {
        let day = targetDay;

        // Handle last day of month or days that don't exist in some months
        if (
          targetDay === 31 ||
          targetDay > getDaysInMonth(new Date(2024, month - 1))
        ) {
          day = getDaysInMonth(new Date(2024, month - 1));
        }

        const monthDay = `${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;

        // Only add if not already selected
        if (!currentDates.includes(monthDay)) {
          newDates.push(monthDay);
        }
      }

      // Add new dates to existing ones
      const updatedDates = [...currentDates, ...newDates];
      form.setValue(name, updatedDates as PathValue<T, Path<T>>);
      setIsLoading(false);

      // Auto-close dialog after adding dates
      setOpen(false);
    }, 300);
  };

  const removeDate = (dateToRemove: string) => {
    const currentDates: string[] = form.getValues(name) || [];
    const updatedDates = currentDates.filter((d: string) => d !== dateToRemove);
    form.setValue(name, updatedDates as PathValue<T, Path<T>>);
  };

  const clearAllDates = () => {
    form.setValue(name, [] as unknown as PathValue<T, Path<T>>);
  };

  const formatDisplayDate = (dateString: string) => {
    const [month, day] = dateString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };




  // Sort dates by month then day for better display
  const sortedDates = [...selectedDates].sort((a, b) => {
    const [monthA, dayA] = a.split("-").map(Number);
    const [monthB, dayB] = b.split("-").map(Number);
    return monthA - monthB || dayA - dayB;
  });

  // Create a date object for the current year to check if it's selected
  const isDateSelected = (date: Date) => {
    const monthDay = format(date, "MM-dd");
    return selectedDates.includes(monthDay);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      disabled={disabled}
      render={() => (
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
            <div className="space-y-3">
              {/* Selected Dates Display */}
              {selectedDates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-foreground">
                        {selectedDates.length} Date
                        {selectedDates.length !== 1 ? "s" : ""} Selected
                      </span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAllDates}
                            className="h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Clear All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove all selected dates</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex max-h-30 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border/50 bg-linear-to-r from-muted/30 to-muted/20 p-2">
                    {sortedDates.map((date: string) => (
                      <Badge
                        key={date}
                        variant="secondary"
                        className="group flex h-6 items-center justify-between gap-1 border-primary/10 bg-primary/5 px-2 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/10"
                      >
                        <span>{formatDisplayDate(date)}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDate(date)}
                          className="ml-1 h-4 w-4 rounded-full p-0 text-primary/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${formatDisplayDate(date)}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Picker */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "group w-full justify-between text-left font-normal",
                      "border-2 hover:border-primary/50 focus:border-primary",
                      "transition-all duration-200",
                      "shadow-sm hover:shadow-md focus:shadow-lg",
                      "bg-linear-to-r from-background to-muted/20",
                      "hover:from-primary/5 hover:to-primary/10",
                      selectedDates.length === 0 && "text-muted-foreground",
                      "h-11 px-4 py-2"
                    )}
                  >
                    <div className="flex items-center">
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {selectedDates.length > 0
                            ? `${selectedDates.length} date${
                                selectedDates.length > 1 ? "s" : ""
                              } selected`
                            : placeholder || "Select compliance dates"}
                        </span>
                        {selectedDates.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Click to add more or modify dates
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedDates.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {selectedDates.length}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="date-picker-popover z-60 h-112.5 w-80 p-0"
                  align="start"
                >
                  <style jsx global>
                    {styles}
                  </style>
                  <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                      <TabsTrigger
                        value="calendar"
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>Calendar</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="quick"
                        className="flex items-center gap-2"
                      >
                        <Target className="h-4 w-4" />
                        <span>Quick Add</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="suggestions"
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Smart</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="date-picker-content">
                      <TabsContent value="calendar" className="m-0 p-4">
                        <div className="space-y-4">
                          <div className="rounded-lg border border-blue-500/20 bg-linear-to-r from-blue-500/5 to-blue-600/10 p-4">
                            <Calendar
                              mode="single"
                              selected={undefined}
                              onSelect={handleDateSelect}
                              initialFocus
                              className="w-full rounded-md border-0 [&_.rdp-cell]:rounded-lg [&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:text-sm [&_.rdp-day]:font-medium"
                              modifiers={{
                                selected: isDateSelected,
                              }}
                              modifiersStyles={{
                                selected: {
                                  backgroundColor: "hsl(var(--primary))",
                                  color: "hsl(var(--primary-foreground))",
                                  fontWeight: "600",
                                },
                              }}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="quick" className="m-0 p-4">
                        <div className="space-y-4">
                          <div className="space-y-3 rounded-lg border border-primary/20 bg-linear-to-r from-primary/5 to-primary/10 p-4">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <Label
                                htmlFor="day-selector"
                                className="text-sm font-medium text-foreground"
                              >
                                Day of month (1-29)
                              </Label>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                id="day-selector"
                                type="number"
                                min="1"
                                max="29"
                                value={selectedDay}
                                onChange={(e) =>
                                  setSelectedDay(Number(e.target.value))
                                }
                                className="h-9 w-20 border-primary/30 text-center font-medium focus:border-primary focus:ring-primary"
                                placeholder="11"
                              />
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleQuickSelection(selectedDay)
                                }
                                className="h-9 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={
                                  selectedDay < 1 ||
                                  selectedDay > 29 ||
                                  isLoading
                                }
                              >
                                {isLoading ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                    Adding dates...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add to all months
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="flex items-start gap-2 rounded-md bg-background/50 p-3">
                              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                              <p className="text-xs text-muted-foreground">
                                This will add the <strong>{selectedDay}</strong>
                                <strong>
                                  {selectedDay === 1
                                    ? "st"
                                    : selectedDay === 2
                                    ? "nd"
                                    : selectedDay === 3
                                    ? "rd"
                                    : "th"}
                                </strong>{" "}
                                of every month. For shorter months, it adjusts
                                to the last available day.
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="suggestions" className="m-0 p-4">
                        <div className="space-y-3">
                          {smartSuggestions.map((suggestion) => {
                            const Icon = suggestion.icon;
                            return (
                              <Button
                                key={suggestion.day}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDay(suggestion.day);
                                  handleQuickSelection(suggestion.day);
                                }}
                                className="h-auto w-full justify-start border-orange-500/20 bg-linear-to-r from-orange-500/5 to-orange-600/10 p-3 text-left hover:from-orange-500/10 hover:to-orange-600/20"
                              >
                                <Icon className="mr-3 h-4 w-4 shrink-0 text-orange-600" />
                                <div className="text-left">
                                  <div className="text-sm font-medium">
                                    {suggestion.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {suggestion.description}
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </div>

                    <div className="date-picker-footer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-foreground">
                              {selectedDates.length}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            date{selectedDates.length !== 1 ? "s" : ""} selected
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setOpen(false)}
                          className="h-8 bg-primary px-4 text-xs font-medium hover:bg-primary/90"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Done
                        </Button>
                      </div>
                    </div>
                  </Tabs>
                </PopoverContent>
              </Popover>
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

export default InputMultipleDates;
