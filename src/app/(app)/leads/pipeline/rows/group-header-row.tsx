// SimpleCRM — group-header-row.tsx
"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupHeaderRowProps {
  label: string;
  isCollapsed: boolean;
  totalAmount: number;
  count: number;
  colSpan: number;
  onToggle: () => void;
}

export function GroupHeaderRow({
  label,
  isCollapsed,
  totalAmount,
  count,
  colSpan,
  onToggle,
}: GroupHeaderRowProps) {
  return (
    <tr key={`group-${label}`}>
      <td
        colSpan={colSpan}
        className="border-b border-neutral-100 bg-neutral-50 px-3 py-2 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold"
      >
        <button type="button" className="flex w-full items-center gap-2" onClick={onToggle}>
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          <span>{label}</span>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-neutral-200 text-neutral-600">
            {count}
          </Badge>
        </button>
      </td>
    </tr>
  );
}
