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
import { LastContactedCell } from "./last-contacted-cell";
import { Checkbox } from "@/components/ui/checkbox";
import { ReminderClockBadge } from "@/components/shared/reminder-clock-badge";
import { useColumnStateContext } from "../context/column-state-context";
import { CustomFieldCell } from "./custom-field-cell";

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

    return (
      <CustomFieldCell 
        type={customDef.type || "Text"} 
        value={val} 
        options={customDef.options}
        onChange={(newVal) => onUpdateField(lead, column, newVal)}
      />
    );
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
      return (
        <SourceCell 
          sources={lead.sources} 
          onChange={(newVal) => onUpdateField(lead, column, newVal)}
        />
      );
    case "lastContacted":
      return (
        <div className="flex flex-col gap-0.5 w-full">
          <LastContactedCell 
            value={lead.lastContacted} 
            onChange={(newDate) => onUpdateField(lead, column, newDate)}
          />
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
