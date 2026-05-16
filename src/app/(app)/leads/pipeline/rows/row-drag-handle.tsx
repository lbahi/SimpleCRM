// SimpleCRM — row-drag-handle.tsx
"use client";

import { useState, useEffect } from "react";
import { GripVertical, Copy, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface RowDragHandleProps {
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  isSelected?: boolean;
  leadId?: string;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function RowDragHandle({ attributes, listeners, isSelected, leadId, onDuplicate, onDelete }: RowDragHandleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!menuOpen) setConfirmDelete(false);
  }, [menuOpen]);

  return (
    <td
      className={cn(
        "sticky left-0 z-30 w-12 border-b border-neutral-100 bg-gray-50 px-1 text-center transition-all duration-200 hover:bg-neutral-50",
        isSelected && "border-l-2 border-[#378ADD]"
      )}
    >
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger 
          render={<div />}
          {...attributes}
          {...listeners}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          className="flex h-full w-full cursor-grab active:cursor-grabbing items-center justify-center gap-1 opacity-60 transition-opacity duration-150 hover:opacity-100"
        >
          <GripVertical className="h-3.5 w-3.5 text-blue-600 transition-colors hover:text-purple-600" />
        </PopoverTrigger>
        <PopoverContent 
          side="right" 
          align="start"
          className="z-50 w-[160px] rounded-xl border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
        >
          <button
            className="flex h-8 w-full items-center gap-2 rounded-lg px-3 text-[13px] text-neutral-700 hover:bg-neutral-100"
            onClick={() => { 
              if (onDuplicate && leadId) onDuplicate(leadId); 
              setMenuOpen(false); 
            }}
          >
            <Copy className="h-3.5 w-3.5 text-neutral-400" />
            Duplicate
          </button>
          {onDelete && (
            <button
              className="flex h-8 w-full items-center gap-2 rounded-lg px-3 text-[13px] text-red-600 hover:bg-red-50"
              onClick={(e) => { 
                if (confirmDelete) {
                  if (onDelete && leadId) onDelete(leadId);
                  setMenuOpen(false);
                } else {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Confirm delete?" : "Delete"}
            </button>
          )}
        </PopoverContent>
      </Popover>
    </td>
  );
}
