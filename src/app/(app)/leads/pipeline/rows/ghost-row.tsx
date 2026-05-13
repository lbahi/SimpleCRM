// SimpleCRM — ghost-row.tsx
"use client";

import { Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnId, COLUMN_DEFS } from "../model";
import { InlineRowState } from "../hooks/use-inline-row";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { MemberCell } from "../cells/member-cell";
import { DatePicker } from "@/components/ui/date-picker";

interface GhostRowProps {
  columns: ColumnId[];
  columnWidths: Record<string, number>;
  state: InlineRowState;
  pinnedColumns: string[];
  pinnedOffsets: Record<string, number>;
  isAdmin?: boolean;
}

export function GhostRow({ columns, columnWidths, state, pinnedColumns, pinnedOffsets, isAdmin = false }: GhostRowProps) {
  const { isActive, values, activeCell, errors, activate, setValue, submit, cancel } = state;

  const handleKeyDown = (e: React.KeyboardEvent, columnId: ColumnId) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  const renderGhostInput = (col: ColumnId) => {
    const hasError = errors[col];
    
    if (!isActive) {
      return (
        <div className="flex h-6 items-center text-neutral-400">
          {col === "name" && <Plus className="mr-2 h-3.5 w-3.5" />}
          <span className="text-[13px]">
            {col === "name" ? "Add lead" : ""}
          </span>
        </div>
      );
    }

    // Type-aware inputs based on column
    switch (col) {
      case "name":
        return (
          <input
            autoFocus={activeCell === col}
            type="text"
            className={cn(
              "w-full bg-transparent text-[13px] outline-none",
              hasError && "border-b-2 border-red-500"
            )}
            placeholder="Full name"
            value={values[col] || ""}
            onChange={(e) => setValue(col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, col)}
          />
        );
      
      case "phone":
        return (
          <input
            autoFocus={activeCell === col}
            type="tel"
            className={cn(
              "w-full bg-transparent text-[13px] outline-none",
              hasError && "border-b-2 border-red-500"
            )}
            placeholder="Phone number"
            value={values[col] || ""}
            onChange={(e) => setValue(col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, col)}
          />
        );
      
      case "location":
        return (
          <input
            autoFocus={activeCell === col}
            type="text"
            className="w-full bg-transparent text-[13px] outline-none"
            placeholder="City / Region"
            value={values[col] || ""}
            onChange={(e) => setValue(col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, col)}
          />
        );
      
      case "status":
        return (
          <StatusCell
            value={values[col] || "NEW"}
            onChange={(value) => setValue(col, value)}
            readOnly={false}
          />
        );
      
      case "rating":
        return (
          <RatingCell
            value={Number(values[col]) || 0}
            onChange={(value) => setValue(col, String(value))}
            readOnly={false}
          />
        );
      
      case "assignedTo":
        return (
          <MemberCell
            value={values[col] || ""}
            onChange={(value) => setValue(col, value)}
            isAdmin={isAdmin}
          />
        );
      
      case "lastContacted":
        return (
          <DatePicker
            value={values[col] || ""}
            onChange={(date) => setValue(col, date)}
            placeholder="Select date"
            className="w-full bg-transparent text-[13px] outline-none border-0"
          />
        );
      
      case "createdAt":
        return (
          <DatePicker
            value={values[col] || ""}
            onChange={(date) => setValue(col, date)}
            placeholder="Select date"
            className="w-full bg-transparent text-[13px] outline-none border-0"
          />
        );
      
      // Read-only fields in ghost row
      case "sources":
      case "notePreview":
        return (
          <div className="flex h-6 items-center text-neutral-400">
            <span className="text-[13px]">—</span>
          </div>
        );
      
      // Custom columns - determine type from context
      default:
        return (
          <input
            autoFocus={activeCell === col}
            type="text"
            className="w-full bg-transparent text-[13px] outline-none"
            placeholder={`Add ${col}...`}
            value={values[col] || ""}
            onChange={(e) => setValue(col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, col)}
          />
        );
    }
  };

  return (
    <tr className="group border-b border-neutral-100 transition-all duration-200 hover:bg-neutral-50">
      <td className="w-8 border-b border-neutral-100" />
      <td className="w-10 border-b border-neutral-100" />
      {columns.map((col) => {
        const def = COLUMN_DEFS.find((item) => item.id === col);
        const width = columnWidths[col] || 150;
        const isPinned = pinnedColumns.includes(col);
        const left = pinnedOffsets[col];

        return (
          <td
            key={`ghost-${col}`}
            style={{ 
              width, 
              minWidth: width,
              left: isPinned ? left : undefined,
              zIndex: isPinned ? 20 : 1
            }}
            className={cn(
              "border-b border-neutral-100 px-3 py-2.5 transition-all duration-200 hover:bg-neutral-50",
              isPinned && "sticky bg-white"
            )}
            onClick={() => !isActive && activate(col)}
          >
            {renderGhostInput(col)}
          </td>
        );
      })}
      <td className="w-10 border-b border-neutral-100" />
    </tr>
  );
}
