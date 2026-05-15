// SimpleCRM — ghost-row.tsx
"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnId, COLUMN_DEFS } from "../model";
import { InlineRowState } from "../hooks/use-inline-row";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { MemberCell } from "../cells/member-cell";
import { SourceCell } from "../cells/source-cell";
import { LeadStatus } from "@prisma/client";

interface GhostRowProps {
  columns: ColumnId[];
  columnWidths: Record<string, number>;
  state: InlineRowState;
  pinnedColumns: string[];
  pinnedOffsets: Record<string, number>;
  isAdmin?: boolean;
}

interface MemberValue {
  id: string;
  name: string;
  avatarInitials: string;
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
      if (col === "name") {
        return (
          <div className="flex items-center text-neutral-400">
            <Plus size={13} className="mr-1.5" />
            <span className="text-[13px]">Add a lead...</span>
          </div>
        );
      }
      return null;
    }

    // Type-aware inputs based on column
    switch (col) {
      case "name":
        return (
          <input
            autoFocus={activeCell === col}
            type="text"
            className={cn(
              "w-full bg-transparent text-[13px] text-neutral-700 outline-none h-[44px]",
              "placeholder:text-neutral-300 focus:border-b focus:border-neutral-400",
              hasError && "border-b border-red-500"
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
              "w-full bg-transparent text-[13px] text-neutral-700 outline-none h-[44px]",
              "placeholder:text-neutral-300 focus:border-b focus:border-neutral-400",
              hasError && "border-b border-red-500"
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
            className={cn(
              "w-full bg-transparent text-[13px] text-neutral-700 outline-none h-[44px]",
              "placeholder:text-neutral-300 focus:border-b focus:border-neutral-400"
            )}
            placeholder="City / Region"
            value={values[col] || ""}
            onChange={(e) => setValue(col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, col)}
          />
        );
      
      case "status":
        return (
          <StatusCell
            value={(values[col] as LeadStatus) || LeadStatus.NEW}
            onChange={(value) => setValue(col, value)}
            readOnly={false}
          />
        );
      
      case "rating":
        return (
          <RatingCell
            value={values[col] ? parseInt(values[col]) : 0}
            onChange={(value) => setValue(col, String(value))}
            readOnly={false}
          />
        );
      
      case "assignedTo":
        return (
          <MemberCell
            value={values.assignedToId || ""}
            onChange={(val: MemberValue | null) => {
              setValue("assignedToId", val?.id || "");
            }}
            isAdmin={isAdmin}
          />
        );
      
      case "sources":
        return (
          <SourceCell
            sources={values.sources || []}
            onChange={(tags) => setValue("sources", tags)}
            readOnly={false}
          />
        );
      
      case "createdAt":
      case "lastContacted":
      case "notePreview":
        return <span className="text-[13px] text-neutral-400">—</span>;
      
      default:
        return null;
    }
  };

  return (
    <tr 
      className={cn(
        "group h-[44px] border-t border-dashed border-neutral-100 transition-all duration-200",
        !isActive ? "bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer" : "bg-white"
      )}
      onClick={() => !isActive && activate("name")}
    >
      <td className="w-12 sticky left-0 z-30 bg-inherit" style={{ width: 48, left: 0 }} />
      <td className="w-12 sticky left-12 z-10 bg-inherit" style={{ width: 48, left: 48 }} />
      {columns.map((col) => {
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
              "px-3 py-0 transition-all duration-200",
              isPinned && "sticky bg-inherit"
            )}
            onClick={(e) => {
              if (!isActive) {
                e.stopPropagation();
                activate(col);
              }
            }}
          >
            <div className="flex items-center h-[44px]">
              {renderGhostInput(col)}
            </div>
          </td>
        );
      })}
      <td className="w-10" />
    </tr>
  );
}
