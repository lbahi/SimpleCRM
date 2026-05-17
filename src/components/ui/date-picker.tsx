// SimpleCRM — date-picker.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  usePortal?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  usePortal = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Parse the date string or use null
  const date = value ? new Date(value) : undefined;
  
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      onChange?.(dateString);
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8",
            "border-neutral-200 focus:border-neutral-300 focus:ring-0",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {value ? format(date!, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent usePortal={usePortal} className="w-auto p-0 z-[200]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="rounded-lg border bg-white shadow-md"
        />
      </PopoverContent>
    </Popover>
  );
}
