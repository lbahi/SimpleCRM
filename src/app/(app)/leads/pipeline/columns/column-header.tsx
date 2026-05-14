// SimpleCRM — column-header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, ArrowUp, ArrowDown, ArrowUpDown, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { ColumnId, COLUMN_DEFS } from "../model";
import { ColumnResizer } from "./column-resizer";
import { ColumnHeaderDropdown } from "./column-header-dropdown";

interface ColumnHeaderProps {
  columnId: ColumnId;
  sortField: ColumnId;
  sortDirection: "asc" | "desc";
  onSort: (columnId: ColumnId) => void;
  width: number;
  onResize: (width: number) => void;
  onAction: (columnId: ColumnId, action: string, payload?: any) => void;
  label: string;
  isPinned: boolean;
  pinnedLeft: number;
}

export function ColumnHeader({
  columnId,
  sortField,
  sortDirection,
  onSort,
  width,
  onResize,
  onAction,
  label,
  isPinned,
  pinnedLeft,
}: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleAction = (action: string) => {
    if (action === "rename") {
      setIsEditing(true);
    } else {
      onAction(columnId, action);
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sortDate, setSortDate] = useState("");

  const isDateColumn = columnId === "lastContacted" || columnId === "createdAt";

  const handleSortClick = () => {
    if (isDateColumn) {
      setShowDatePicker(true);
    } else {
      onSort(columnId);
    }
  };

  const handleDateSelect = (date: string) => {
    setSortDate(date);
    setShowDatePicker(false);
    // Here you could add logic to filter by selected date
  };

  const saveRename = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== label) {
      onAction(columnId, "rename", editValue);
    }
  };

  const def = COLUMN_DEFS.find((item) => item.id === columnId);
  if (!def) return null;
  const Icon = def.icon;
  const isSorted = sortField === columnId;

  return (
    <th
      ref={setNodeRef}
      style={{ 
        ...style,
        left: isPinned ? pinnedLeft : undefined
      }}
      {...attributes}
      {...listeners}
      className={cn(
        "relative border-b border-neutral-100 bg-neutral-50 px-3 py-2.5 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold transition-colors hover:bg-neutral-100",
        isPinned && "sticky z-20 bg-neutral-50",
        isDragging && "z-50 opacity-50"
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveRename();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="h-6 w-full border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <div className="flex items-center gap-2">
          <ColumnHeaderDropdown
            columnId={columnId}
            onAction={handleAction}
            trigger={
              <div className="group flex w-full cursor-pointer items-center gap-2 text-left">
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">{label}</span>
                {isDateColumn ? (
                  <div
                    className="ml-auto h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleSortClick(); }}
                    title="Filter by date"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                ) : isSorted ? (
                  sortDirection === "asc" ? (
                    <div
                      className="ml-auto h-3.5 w-3.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onSort(columnId); }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div
                      className="ml-auto h-3.5 w-3.5 text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onSort(columnId); }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </div>
                  )
                ) : (
                  <div
                    className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onSort(columnId); }}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            }
          />
        </div>
      )}
      <ColumnResizer 
        columnId={columnId} 
        initialWidth={width} 
        onResize={onResize} 
      />
      {showDatePicker && (
        <div className="absolute top-full left-0 z-50 mt-1">
          <DatePicker
            value={sortDate}
            onChange={handleDateSelect}
            placeholder="Filter by date"
            className="text-xs"
          />
        </div>
      )}
    </th>
  );
}
