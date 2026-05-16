// SimpleCRM — filter-status-section.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "FRESH", label: "Fresh" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

interface FilterStatusSectionProps {
  selected: string[];
  onChange: (values: string[]) => void;
}

export function FilterStatusSection({ selected, onChange }: FilterStatusSectionProps) {
  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(STATUS_OPTIONS.map(o => o.value))} className="text-[11px] font-semibold text-primary hover:underline">Select all</button>
          <button onClick={() => onChange([])} className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-600">Clear all</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <div key={opt.value} onClick={() => toggle(opt.value)} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl border border-neutral-100 cursor-pointer transition-all", isSelected ? "bg-blue-50/50 border-blue-100" : "hover:bg-neutral-50")}>
              <Checkbox checked={isSelected} onCheckedChange={() => toggle(opt.value)} className={cn(isSelected && "border-primary bg-primary")} />
              <span className={cn("text-[13px] font-medium", isSelected ? "text-primary" : "text-neutral-600")}>{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
