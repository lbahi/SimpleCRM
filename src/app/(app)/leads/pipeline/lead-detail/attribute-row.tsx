// SimpleCRM — attribute-row
"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { MemberCell } from "../cells/member-cell";
import { SourceCell } from "../cells/source-cell";
import { LastContactedCell } from "../cells/last-contacted-cell";
import { type ColumnId, type PipelineLead, valueToString, getFieldValue } from "../model";

export interface AttributeColumn {
  id: ColumnId;
  label: string;
}

interface AttributeRowProps {
  col: AttributeColumn;
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}

function AttributeValue({
  col,
  lead,
  onUpdate,
}: {
  col: AttributeColumn;
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}) {
  switch (col.id) {
    case "status":
      return (
        <StatusCell
          value={lead.status}
          onChange={(v) => onUpdate("status", v)}
          usePortal={false}
        />
      );

    case "rating":
      return (
        <RatingCell
          value={lead.rating ?? 0}
          onChange={(v) => onUpdate("rating", v)}
        />
      );

    case "assignedTo":
      return (
        <MemberCell
          value={lead.assignedTo}
          onChange={(v) => onUpdate("assignedTo", v)}
          isAdmin={true}
          usePortal={false}
        />
      );

    case "sources":
      return (
        <SourceCell
          sources={lead.sources}
          onChange={(v) => onUpdate("sources", v)}
          usePortal={false}
        />
      );

    case "lastContacted":
      return (
        <LastContactedCell
          value={lead.lastContacted}
          onChange={(v) => onUpdate("lastContacted", v)}
          usePortal={false}
        />
      );

    case "createdAt":
      return (
        <span className="text-[13px] text-neutral-700 px-1">
          {format(new Date(lead.createdAt), "MMM d, yyyy")}
        </span>
      );

    case "name":
    case "phone":
    case "location": {
      const raw = getFieldValue(lead, col.id);
      const text = valueToString(raw);
      return (
        <input
          defaultValue={text || ""}
          onBlur={(e) => onUpdate(col.id, e.target.value)}
          className={cn(
            "w-full bg-transparent text-neutral-700 outline-none border-b border-transparent hover:border-neutral-200 focus:border-neutral-400 px-1 py-1 rounded-sm",
            col.id === "name" ? "text-[14px] font-medium" : "text-[13px]"
          )}
          placeholder="—"
          type={col.id === "phone" ? "tel" : "text"}
        />
      );
    }

    default: {
      if (typeof col.id === "string" && col.id.startsWith("custom_")) {
        const val = (lead.customFields as any)?.[col.id] ?? "";
        return (
          <input
            defaultValue={String(val)}
            onBlur={(e) => onUpdate(col.id, e.target.value)}
            className="w-full bg-transparent text-[13px] text-neutral-700 outline-none border-b border-transparent hover:border-neutral-200 focus:border-neutral-400 px-1 py-1 rounded-sm"
            placeholder="—"
          />
        );
      }
      const raw = getFieldValue(lead, col.id);
      const text = valueToString(raw);
      return (
        <span className="text-[13px] text-neutral-700 px-1">{text || "—"}</span>
      );
    }
  }
}

export function AttributeRow({ col, lead, onUpdate }: AttributeRowProps) {
  return (
    <div className="flex items-center min-h-[44px] px-6 border-b border-neutral-50 group">
      <span className="w-[160px] flex-shrink-0 text-[12px] font-medium text-neutral-400">
        {col.label}
      </span>
      <div className="flex-1 flex items-center min-w-0">
        <AttributeValue col={col} lead={lead} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
