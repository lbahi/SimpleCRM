// SimpleCRM — last-contacted-cell.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LastContactedCellProps {
  value: Date | string | null;
  onChange: (date: string) => void;
  children?: React.ReactNode; // For the ReminderClockBadge
}

export function LastContactedCell({
  value,
  onChange,
  children,
}: LastContactedCellProps) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : null;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        className="flex flex-col gap-0.5 cursor-pointer group w-full text-left"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[13px] transition-colors",
            !value ? "text-neutral-300" : "text-neutral-600 group-hover:text-neutral-900"
          )}>
            {value ? format(date!, "MMM d, yyyy") : "—"}
          </span>
          <CalendarIcon size={12} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-none" align="start" side="bottom">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          initialFocus
          className="rounded-2xl"
        />
      </PopoverContent>
    </Popover>
  );
}
