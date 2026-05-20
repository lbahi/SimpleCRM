// SimpleCRM — status-cell.tsx
"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LeadStatus } from "@prisma/client";

const STATUS_CONFIG: Record<LeadStatus, {
  label: string; bg: string; text: string; dot: string
}> = {
  NEW:        { label: "New",        bg: "#6464648e", text: "#ffffffff", dot: "#ffffffff" },
  NO_RESPOND: { label: "No Respond", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  CONTACTED:  { label: "Contacted",  bg: "#E8F2FB", text: "#0C447C", dot: "#378ADD" },
  CONVERTED:  { label: "Converted",  bg: "#eafdf0ff", text: "#1f7a3dff", dot: "#00c72bff" },
  LOST:       { label: "Lost",       bg: "#fbededff", text: "#5c2121ff", dot: "#d60000b7" },
};

export { STATUS_CONFIG }

interface StatusCellProps {
  value: LeadStatus | string;
  onChange: (value: LeadStatus) => void;
  readOnly?: boolean;
  usePortal?: boolean;
}

export function StatusCell({ value, onChange, readOnly = false, usePortal = true }: StatusCellProps) {
  const t = useTranslations("status");
  const currentStatus = (value as LeadStatus) || "NEW";
  const config = STATUS_CONFIG[currentStatus as LeadStatus] ?? STATUS_CONFIG.NEW;
  const label = t(currentStatus);

  const pill = (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium cursor-pointer"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.dot }}
      />
      {label}
    </div>
  );

  if (readOnly) return pill;

  return (
    <Popover>
      <PopoverTrigger className="w-full text-left rounded-md outline-none focus:ring-1 focus:ring-primary/20">
        <div className="w-full">
          {pill}
        </div>
      </PopoverTrigger>
      <PopoverContent usePortal={usePortal} align="start" className="w-[180px] p-1 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
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
                {t(key as LeadStatus)}
              </div>
              {key === currentStatus && <Check className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
