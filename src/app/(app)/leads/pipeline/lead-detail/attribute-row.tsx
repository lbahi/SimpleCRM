// SimpleCRM — attribute-row
"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { format } from "date-fns";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { MemberCell } from "../cells/member-cell";
import { SourceCell } from "../cells/source-cell";
import { formatDateTime, getFieldValue, type ColumnId, type PipelineLead } from "../model";

// ─── Types ───────────────────────────────────────────────────

export interface AttributeColumn {
  id: ColumnId;
  label: string;
}

interface AttributeValueProps {
  col: AttributeColumn;
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}

interface AttributeRowProps {
  col: AttributeColumn;
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}

// ─── Value renderer ───────────────────────────────────────────

function AttributeValue({ col, lead, onUpdate }: AttributeValueProps) {
  switch (col.id) {
    case "status":
      return (
        <StatusCell value={lead.status} onChange={(v) => onUpdate("status", v)} />
      );
    case "rating":
      return (
        <RatingCell value={lead.rating || 0} onChange={(v) => onUpdate("rating", v)} />
      );
    case "assignedTo":
      return (
        <MemberCell value={lead.assignedTo?.name || ""} onChange={(v) => onUpdate("assignedTo", v)} isAdmin />
      );
    case "sources":
      return <SourceCell sources={lead.sources} />;
    case "location":
      return <span className="text-[13px] text-neutral-700">{lead.location || "—"}</span>;
    case "createdAt":
      return (
        <button
          type="button"
          className="text-[13px] text-neutral-700 hover:bg-muted/60 rounded px-1 py-1 text-left w-full"
          onClick={() => onUpdate("createdAt", lead.createdAt)}
        >
          {formatDateTime(lead.createdAt)}
        </button>
      );
    case "lastContacted":
      return (
        <button
          type="button"
          className="text-[13px] text-neutral-700 hover:bg-muted/60 rounded px-1 py-1 text-left w-full"
          onClick={() => onUpdate("lastContacted", lead.lastContacted)}
        >
          {lead.lastContacted ? formatDateTime(lead.lastContacted) : "—"}
        </button>
      );
    case "notePreview":
      return <span className="text-[13px] italic text-neutral-400">See notes below ↓</span>;
    default: {
      const raw = getFieldValue(lead, col.id);
      return (
        <span className="truncate text-[13px] text-neutral-700">
          {raw !== "" && raw !== null && raw !== undefined ? String(raw) : "—"}
        </span>
      );
    }
  }
}

// ─── Sortable row ─────────────────────────────────────────────

export function AttributeRow({ col, lead, onUpdate }: AttributeRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-100 hover:bg-neutral-50"
    >
      {/* Drag handle — listeners only on this element */}
      <button
        type="button"
        className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        tabIndex={-1}
        aria-label={`Drag to reorder ${col.label}`}
      >
        <GripVertical className="h-3.5 w-3.5 text-neutral-300" />
      </button>

      {/* Label */}
      <span className="w-[140px] shrink-0 text-[12px] font-medium text-neutral-400">
        {col.label}
      </span>

      {/* Value */}
      <div className="flex min-w-0 flex-1 items-center">
        <AttributeValue col={col} lead={lead} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
