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
        />
      );

    case "sources": {
      const unique = lead.sources.filter(
        (s, i, arr) => arr.findIndex((x) => x.source === s.source) === i
      );
      return (
        <SourceCell
          sources={unique}
          onChange={(v) => onUpdate("sources", v)}
        />
      );
    }

    case "lastContacted":
      return (
        <span className="text-[13px] text-neutral-700">
          {lead.lastContacted
            ? format(new Date(lead.lastContacted), "MMM d, yyyy h:mm a")
            : "Never"}
        </span>
      );

    default: {
      if (typeof col.id === "string" && col.id.startsWith("custom_")) {
        const val = (lead.customFields as any)?.[col.id] ?? "";
        return (
          <span className="text-[13px] text-neutral-700">
            {String(val) || "—"}
          </span>
        );
      }
      const raw = getFieldValue(lead, col.id);
      const text = valueToString(raw);
      return (
        <span className="text-[13px] text-neutral-700">{text || "—"}</span>
      );
    }
  }
}

export function AttributeRow({ col, lead, onUpdate }: AttributeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });

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
      className="group flex items-start gap-2 py-3 px-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
    >
      {/* Drag handle — hidden until hover */}
      <button
        type="button"
        className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
        tabIndex={-1}
      >
        <GripVertical size={16} className="text-neutral-400" />
      </button>

      {/* Label on top, value below — matching reference SortableField */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-neutral-500 mb-1.5">
          {col.label}
        </div>
        <div className="min-h-[24px] flex items-center">
          <AttributeValue col={col} lead={lead} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}
