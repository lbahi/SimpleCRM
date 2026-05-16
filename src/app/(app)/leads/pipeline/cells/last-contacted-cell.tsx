// SimpleCRM — last-contacted-cell.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LastContactedCellProps {
  value: string | Date | null;
  onChange: (isoString: string) => void;
}

export function LastContactedCell({ value, onChange }: LastContactedCellProps) {
  const [open, setOpen] = useState(false);
  const currentDate = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex min-h-[36px] w-full items-center rounded px-1 text-left text-[13px] text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        {currentDate ? (
          format(currentDate, "MMM d, yyyy")
        ) : (
          <span className="text-neutral-300">—</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border border-neutral-200 shadow-md rounded-md z-[100]" align="start">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => {
            if (date) {
              onChange(date.toISOString());
              setOpen(false);
            }
          }}
          disabled={(date: Date) => date > new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
