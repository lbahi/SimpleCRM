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
import { PipelineCell } from "../cells/pipeline-cell";
import { type ColumnId, type PipelineLead } from "../model";

export interface AttributeColumn {
  id: ColumnId;
  label: string;
}

interface AttributeRowProps {
  col: AttributeColumn;
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}

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
      className="group flex items-center min-h-[44px] py-2 px-3 transition-colors duration-100 hover:bg-neutral-50"
    >
      <button
        type="button"
        className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing mr-1"
        {...attributes}
        {...listeners}
        tabIndex={-1}
      >
        <GripVertical className="h-3.5 w-3.5 text-neutral-300" />
      </button>

      <span className="w-[160px] flex-shrink-0 text-[12px] font-medium text-neutral-400">
        {col.label}
      </span>

      <div className="flex-1 min-w-0">
        <PipelineCell 
          lead={lead} 
          column={col.id} 
          onUpdateField={(l, c, v) => onUpdate(c, v)} 
          currentUserRole="ADMIN" // Default to admin for modal editing
        />
      </div>
    </div>
  );
}
