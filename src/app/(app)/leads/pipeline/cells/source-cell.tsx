// SimpleCRM — source-cell.tsx
"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const SOURCE_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "MANUAL", label: "Manual" },
  { value: "REFERRAL", label: "Referral" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "GOOGLE", label: "Google" },
];

const sourceColors = [
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-violet-100 text-violet-700 border-violet-200',
];

interface SourceCellProps {
  sources: { source: string }[] | string[] | any;
  onChange?: (sources: string[]) => void;
  readOnly?: boolean;
}

export function SourceCell({ sources, onChange, readOnly = false }: SourceCellProps) {
  const [open, setOpen] = useState(false);

  // Normalize sources to string array
  let currentSources: string[] = [];
  if (Array.isArray(sources)) {
    currentSources = sources.map((s: any) => typeof s === 'string' ? s : s.source);
  } else if (typeof sources === 'string') {
    currentSources = [sources];
  }

  const toggleSource = (source: string) => {
    if (!onChange) return;
    const next = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    onChange(next);
  };

  const displaySources = currentSources.filter(s => !!s);

  if (readOnly) {
    return (
      <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
        {displaySources.map((source, idx) => (
          <span
            key={`${source}-${idx}`}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-colors",
              sourceColors[idx % sourceColors.length]
            )}
          >
            {source}
          </span>
        ))}
        {displaySources.length === 0 && <span className="text-neutral-400 text-[12px]">—</span>}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex flex-wrap items-center gap-1 min-h-[32px] w-full group cursor-pointer text-left"
        onClick={() => setOpen(true)}
      >
        {displaySources.map((source, idx) => (
            <span
              key={`${source}-${idx}`}
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all",
                sourceColors[idx % sourceColors.length]
              )}
            >
              {source}
            </span>
          ))}
          <div 
            className="flex items-center justify-center w-5 h-5 rounded-md border border-dashed border-neutral-300 text-neutral-400 opacity-0 group-hover:opacity-100 hover:border-neutral-400 hover:text-neutral-600 transition-all"
          >
            <Plus size={12} />
          </div>
          {displaySources.length === 0 && (
            <span className="text-neutral-300 text-[12px] group-hover:text-neutral-400 italic">Add source...</span>
          )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-neutral-100" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 mb-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Select Sources</span>
          </div>
          {SOURCE_OPTIONS.map((opt) => {
            const isSelected = currentSources.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSource(opt.value);
                }}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200",
                  isSelected ? "bg-blue-50/80 text-blue-700" : "hover:bg-neutral-50 text-neutral-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isSelected}
                    className={cn(isSelected && "border-blue-500 bg-blue-500")}
                  />
                  <span className="text-[13px] font-medium">{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-blue-500" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
