// SimpleCRM — pipeline-cell.tsx
"use client";

import { format } from "date-fns";
import { 
  PipelineLead, 
  ColumnId, 
  valueToString, 
  formatDateTime
} from "../model";
import { StatusCell } from "./status-cell";
import { MemberCell } from "./member-cell";
import { RatingCell } from "./rating-cell";
import { SourceCell } from "./source-cell";
import { Checkbox } from "@/components/ui/checkbox";
import { ReminderClockBadge } from "@/components/shared/reminder-clock-badge";
import { useColumnStateContext } from "../context/column-state-context";

interface PipelineCellProps {
  lead: PipelineLead;
  column: ColumnId;
  onUpdateField: (lead: PipelineLead, column: ColumnId, value: unknown) => void | Promise<void>;
  currentUserRole: string;
}

export function PipelineCell({
  lead,
  column,
  onUpdateField,
  currentUserRole,
}: PipelineCellProps) {
  if (typeof column === "string" && column.startsWith("custom_")) {
    const { allAvailableColumns } = useColumnStateContext();
    const customDef = allAvailableColumns.find((c: any) => c.id === column);
    const val = (lead.customFields as any)?.[column] ?? "";

    if (!customDef) return <span className="text-neutral-400">—</span>;

    switch (customDef.type) {
      case "Checkbox":
        return <Checkbox checked={!!val} onCheckedChange={(checked: boolean) => onUpdateField(lead, column, checked)} />;
      case "Date":
        return <span>{val ? format(new Date(val as string), "MMM d, yyyy") : "—"}</span>;
      case "Number":
        return <span>{val !== "" ? Number(val).toLocaleString() : "—"}</span>;
      case "Select":
        return val ? (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
            {val as string}
          </span>
        ) : <span className="text-neutral-400">—</span>;
      case "Multi-select":
        const values = Array.isArray(val) ? val : [];
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((v: string) => (
              <span key={v} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-bold border border-neutral-200">
                {v}
              </span>
            ))}
            {values.length === 0 && <span className="text-neutral-400">—</span>}
          </div>
        );
      default:
        return <span className="truncate">{String(val || "—")}</span>;
    }
  }

  const value = lead[column as keyof PipelineLead];
  
  switch (column) {
    case "status":
      return (
        <StatusCell 
          value={valueToString(value)} 
          onChange={(newVal) => onUpdateField(lead, column, newVal)} 
        />
      );
    case "assignedTo":
      return (
        <MemberCell 
          value={lead.assignedTo} 
          onChange={(newVal) => onUpdateField(lead, column, newVal)} 
          isAdmin={currentUserRole === "ADMIN"}
        />
      );
    case "rating":
      return (
        <RatingCell 
          value={Number(value || 0)} 
          onChange={(newVal) => onUpdateField(lead, column, newVal)} 
        />
      );
    case "sources":
      return <SourceCell sources={lead.sources} />;
    case "lastContacted":
      return (
        <div className="flex flex-col gap-0.5">
          <span>{formatDateTime(value)}</span>
          <ReminderClockBadge reminders={lead.reminders || []} />
        </div>
      );
    case "createdAt":
      return (
        <span className="text-[12px] text-neutral-400">
          {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : "—"}
        </span>
      );
    case "notePreview":
      return <span className="truncate text-neutral-500 italic">{lead.notes?.[0]?.body || "-"}</span>;
    default:
      return <span className="truncate">{valueToString(value) || "-"}</span>;
  }
}
