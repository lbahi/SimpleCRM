// SimpleCRM — mobile-status-chips.tsx
"use client";

import { useMemo } from "react";
import { LeadStatus } from "@prisma/client";
import { PipelineLead } from "./model";
import { STATUS_CONFIG } from "./cells/status-cell";
import { cn } from "@/lib/utils";

interface MobileStatusChipsProps {
  allLeads: PipelineLead[];
  selectedStatuses: string[];
  onStatusToggle: (status: string) => void;
  onClearStatus?: () => void;
}

const STATUS_LIST: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.NO_RESPOND,
  LeadStatus.CONTACTED,
  LeadStatus.CONVERTED,
  LeadStatus.LOST,
];

export function MobileStatusChips({
  allLeads,
  selectedStatuses,
  onStatusToggle,
  onClearStatus,
}: MobileStatusChipsProps) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const lead of allLeads) {
      map[lead.status] = (map[lead.status] || 0) + 1;
    }
    return map;
  }, [allLeads]);

  const isAllActive = selectedStatuses.length === 0;

  const handleClear = () => {
    if (onClearStatus) {
      onClearStatus();
    } else {
      onStatusToggle("ALL");
    }
  };

  return (
    <div className="flex items-center overflow-x-auto gap-2 px-4 py-2 bg-white border-b border-gray-100 lg:hidden scrollbar-none shrink-0">
      {/* "All" Chip */}
      <button
        type="button"
        onClick={handleClear}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all",
          isAllActive
            ? "bg-neutral-900 text-white shadow-sm border border-neutral-900"
            : "bg-white border border-gray-200 text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <span>All</span>
        <span
          className={cn(
            "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
            isAllActive
              ? "bg-white/20 text-white"
              : "bg-neutral-100 text-neutral-500"
          )}
        >
          {allLeads.length}
        </span>
      </button>

      {/* Per-Status Chips */}
      {STATUS_LIST.map((status) => {
        const config = STATUS_CONFIG[status];
        const count = counts[status] || 0;
        const isActive = selectedStatuses.includes(status);
        const dotColor =
          config.dot === "#ffffffff" || config.dot === "#ffffff"
            ? "#646464"
            : config.dot;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onStatusToggle(status)}
            style={
              isActive
                ? {
                    backgroundColor: config.bg,
                    color: config.text,
                    borderColor: dotColor,
                  }
                : undefined
            }
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-all",
              isActive
                ? "font-semibold border-2 shadow-sm"
                : "font-medium bg-white border border-gray-200 text-neutral-600 hover:bg-neutral-50"
            )}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span>{config.label}</span>
            <span
              className={cn(
                "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
                isActive ? "bg-black/10" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
