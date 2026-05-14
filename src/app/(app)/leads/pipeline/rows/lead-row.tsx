// SimpleCRM — lead-row.tsx
"use client";

import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PipelineLead, 
  ColumnId, 
  COLUMN_DEFS, 
  getFieldValue, 
  valueToString, 
  formatDateTime
} from "../model";
import { CellEditor } from "../cells/cell-editor";
import { StatusCell } from "../cells/status-cell";
import { MemberCell } from "../cells/member-cell";
import { RatingCell } from "../cells/rating-cell";
import { SourceCell } from "../cells/source-cell";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RowDragHandle } from "./row-drag-handle";
import { ReminderClockBadge } from "@/components/shared/reminder-clock-badge";

interface LeadRowProps {
  lead: PipelineLead;
  rowIndex: number;
  columns: ColumnId[];
  columnWidths: Record<string, number>;
  selectedDetailId: string | null;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onExpand: (id: string) => void;
  editingCell: { leadId: string; column: ColumnId } | null;
  editingValue: string;
  onStartEdit: (lead: PipelineLead, column: ColumnId) => void;
  onChangeEditingValue: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateField: (lead: PipelineLead, column: ColumnId, value: unknown) => void | Promise<void>;
  pinnedColumns: string[];
  pinnedOffsets: Record<string, number>;
  currentUserRole: string;
}

export function LeadRow({
  lead,
  rowIndex,
  columns,
  columnWidths,
  selectedDetailId,
  isSelected,
  onToggleSelection,
  onExpand,
  editingCell,
  editingValue,
  onStartEdit,
  onChangeEditingValue,
  onSaveEdit,
  onCancelEdit,
  onUpdateField,
  pinnedColumns,
  pinnedOffsets,
  currentUserRole,
}: LeadRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: isDragging ? "relative" : undefined as any,
  };

  const selected = selectedDetailId === lead.id;

  const renderCellContent = (lead: PipelineLead, column: ColumnId) => {
    const value = getFieldValue(lead, column);
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
        return <SourceCell sources={value as any} />;
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
            {lead.createdAt 
              ? format(new Date(lead.createdAt), "MMM d, yyyy") 
              : "—"}
          </span>
        );
      case "notePreview":
        return <span className="truncate">{valueToString(value) || "-"}</span>;
      default:
        return <span className="truncate">{valueToString(value) || "-"}</span>;
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-colors duration-200 hover:bg-neutral-50/60",
        selected && "bg-blue-50",
        isDragging && "z-50 bg-neutral-50 opacity-70"
      )}
    >
      <RowDragHandle attributes={attributes} listeners={listeners} />
      <td 
        className="w-12 sticky left-12 z-10 bg-white border-b border-neutral-100 px-2 py-2.5"
        style={{ width: 48, left: 48 }}
      >
        <div className="flex items-center justify-center">
          {onToggleSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(lead.id)}
              aria-label="Select row"
            />
          )}
        </div>
      </td>
      {columns.map((column) => {
        const isEditing = editingCell?.leadId === lead.id && editingCell.column === column;
        const width = columnWidths[column] || 150;
        const isInteractive = 
          column === "name" ||
          column === "phone" ||
          column === "location";
        const isPinned = pinnedColumns.includes(column);
        const left = pinnedOffsets[column];

        return (
          <td
            key={`${lead.id}-${column}`}
            className={cn(
              "border-b border-neutral-100 px-3 py-2.5 text-[13px] text-neutral-600 transition-colors",
              isPinned && "sticky z-10 bg-white",
              isInteractive && "cursor-pointer hover:bg-neutral-50"
            )}
            style={{ 
              width: isPinned ? undefined : width,
              minWidth: isPinned ? undefined : width,
              left: isPinned ? left : undefined 
            }}
          >
            {isEditing ? (
              <CellEditor
                column={column}
                value={editingValue}
                onChange={onChangeEditingValue}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : isInteractive ? (
              <button
                type="button"
                className="flex min-h-[36px] w-full items-center rounded px-1 py-1 text-left hover:bg-neutral-50"
                title={valueToString(getFieldValue(lead, column))}
                onClick={() => onStartEdit(lead, column)}
              >
                {renderCellContent(lead, column)}
              </button>
            ) : (
              <div className="flex min-h-[36px] w-full items-center px-1 py-1">
                {renderCellContent(lead, column)}
              </div>
            )}
          </td>
        );
      })}
      <td 
        className="w-12 sticky right-0 z-30 bg-white border-b border-neutral-100 px-2 py-2.5 border-l"
        style={{ width: 48, right: 0 }}
      >
        <button
          type="button"
          aria-label={`Open details for ${lead.name}`}
          title="Open lead details"
          className="rounded-full p-0.5 text-neutral-400 opacity-60 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-600 hover:opacity-100"
          onClick={() => onExpand(lead.id)}
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </button>
      </td>
    </tr>
  );
}
