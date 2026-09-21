// SimpleCRM — group-header-row.tsx
"use client";

import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { STATUS_CONFIG } from "../cells/status-cell";
import { LeadStatus } from "@prisma/client";
import { PipelineLead } from "../model";
import { InlineRowState } from "../hooks/use-inline-row";
import { cn } from "@/lib/utils";

interface GroupHeaderRowProps {
  groupKey: string;
  groupLeads: PipelineLead[];
  expandedGroups: Set<string>;
  onToggle: () => void;
  inlineRow: InlineRowState;
  colSpan: number;
  children?: React.ReactNode;
}

export function GroupHeaderRow({
  groupKey,
  groupLeads,
  expandedGroups,
  onToggle,
  inlineRow,
  colSpan,
  children,
}: GroupHeaderRowProps) {
  if (groupKey === "ungrouped") {
    return <>{children}</>;
  }

  const isExpanded = expandedGroups.has(groupKey);
  const statusConfig = STATUS_CONFIG[groupKey as LeadStatus];
  const dotColor = statusConfig
    ? statusConfig.dot === "#ffffffff" || statusConfig.dot === "#ffffff"
      ? "#646464"
      : statusConfig.dot
    : "#9CA3AF";
  const groupTintBg = statusConfig
    ? `color-mix(in srgb, ${statusConfig.bg} 25%, white)`
    : undefined;

  return (
    <>
      <tr
        className={cn(
          "border-b border-gray-100 cursor-pointer transition-colors",
          !statusConfig && "bg-gray-50 hover:bg-gray-100"
        )}
        style={{ backgroundColor: groupTintBg }}
        onClick={onToggle}
      >
        <td colSpan={colSpan} className="py-3 px-4" style={{ borderLeft: `3px solid ${dotColor}` }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-neutral-500 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
              {statusConfig && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                {statusConfig?.label || groupKey}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: statusConfig ? statusConfig.bg : "#E5E7EB",
                  color: statusConfig ? statusConfig.text : "#374151",
                }}
              >
                {groupLeads.length}
              </span>
            </div>
            {!isExpanded && (
              <span className="text-xs text-neutral-400 font-normal">Click to expand</span>
            )}
          </div>
        </td>
      </tr>

      {children}

      {isExpanded && (
        <>
          <tr
            onClick={() => inlineRow.activate("name")}
            className="cursor-pointer border-b border-dashed border-neutral-200/80 hover:bg-neutral-50/80 transition-colors"
            style={{
              backgroundColor: groupTintBg
                ? `color-mix(in srgb, ${groupTintBg} 40%, white)`
                : undefined,
            }}
          >
            <td colSpan={colSpan} className="px-4 py-2 text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-2 ps-6">
                <Plus size={13} className="text-neutral-400" />
                <span>+ Add a lead to {statusConfig?.label || groupKey}...</span>
              </div>
            </td>
          </tr>
          <tr className="h-2" style={{ backgroundColor: groupTintBg || "#F9FAFB" }}>
            <td colSpan={colSpan} className="p-0 h-2 border-b border-neutral-100" />
          </tr>
        </>
      )}
    </>
  );
}
