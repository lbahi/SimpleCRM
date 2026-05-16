// SimpleCRM — custom-field-cell.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Check, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CustomFieldCellProps {
  type: string;
  value: any;
  options?: string[];
  onChange: (val: any) => void;
}

export function CustomFieldCell({ type, value, options, onChange }: CustomFieldCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(String(value ?? ""));

  if (type === "Checkbox") {
    return <Checkbox checked={!!value} onCheckedChange={onChange} />;
  }

  if (type === "Date") {
    return (
      <Popover>
        <PopoverTrigger>
          <button className="flex items-center gap-2 text-[12px] text-neutral-600 hover:text-neutral-900 transition-colors">
            <CalendarIcon size={14} className="text-neutral-400" />
            {value ? format(new Date(value), "MMM d, yyyy") : "—"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date?.toISOString() || null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (type === "Select" && options) {
    return (
      <Popover>
        <PopoverTrigger>
          <button className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100 hover:bg-blue-100 transition-all">
            {value || "—"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-1" align="start">
          <div className="flex flex-col">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className="h-8 px-2 rounded-lg flex items-center justify-between text-[13px] font-medium hover:bg-neutral-50 text-neutral-600"
              >
                {opt}
                {opt === value && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (type === "Multi-select" && options) {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt: string) => {
      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
      onChange(next);
    };
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex flex-wrap gap-1 cursor-pointer min-h-6">
            {selected.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold border border-neutral-200">
                {s}
              </span>
            ))}
            {selected.length === 0 && <span className="text-neutral-400">—</span>}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-1" align="start">
          <div className="flex flex-col">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="h-8 px-2 rounded-lg flex items-center justify-between text-[13px] font-medium hover:bg-neutral-50 text-neutral-600"
              >
                {opt}
                {selected.includes(opt) && <Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type === "Number" ? "number" : "text"}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => { setEditing(false); onChange(type === "Number" ? Number(localValue) : localValue); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setEditing(false); onChange(type === "Number" ? Number(localValue) : localValue); }
          if (e.key === "Escape") { setEditing(false); setLocalValue(String(value ?? "")); }
        }}
        className="w-full bg-blue-50 border border-blue-200 rounded px-2 py-1 text-[12px] outline-none"
      />
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="cursor-pointer truncate hover:text-primary transition-colors min-h-[20px]">
      {type === "Number" && value !== "" ? Number(value).toLocaleString() : String(value || "—")}
    </div>
  );
}
