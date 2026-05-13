// SimpleCRM — status-cell.tsx
"use client";

import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LeadStatus } from "@prisma/client";

const STATUS_CONFIG: Record<LeadStatus, {
  label: string; bg: string; text: string; dot: string
}> = {
  NEW:        { label: "New",        bg: "#E6F9F3", text: "#0D6B4E", dot: "#1D9E75" },
  NO_RESPOND: { label: "No Respond", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  CONTACTED:  { label: "Contacted",  bg: "#E8F2FB", text: "#0C447C", dot: "#378ADD" },
  CONVERTED:  { label: "Converted",  bg: "#FDEAEA", text: "#7A1F1F", dot: "#E24B4A" },
  LOST:       { label: "Lost",       bg: "#EEEDFB", text: "#26215C", dot: "#534AB7" },
};

export { STATUS_CONFIG }

interface StatusCellProps {
  value: LeadStatus | string;
  onChange: (value: LeadStatus) => void;
  readOnly?: boolean;
}

export function StatusCell({ value, onChange, readOnly = false }: StatusCellProps) {
  const currentStatus = (value as LeadStatus) || "NEW";
  const config = STATUS_CONFIG[currentStatus as LeadStatus] ?? STATUS_CONFIG.NEW;

  const pill = (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium cursor-pointer"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.dot }}
      />
      {config.label}
    </div>
  );

  if (readOnly) return pill;

  return (
    <Popover>
      <PopoverTrigger className="w-full text-left rounded-md outline-none">
        {pill}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[180px] p-1 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <div className="flex flex-col">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onChange(key as LeadStatus)}
              className="h-8 px-2 rounded-lg flex items-center justify-between text-[13px] font-medium transition-colors hover:bg-neutral-50 text-neutral-600"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.dot }}
                />
                {config.label}
              </div>
              {key === currentStatus && <Check className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
