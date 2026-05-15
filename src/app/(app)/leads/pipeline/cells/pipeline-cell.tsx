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
import { ReminderClockBadge } from "@/components/shared/reminder-clock-badge";

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
