// SimpleCRM — row-drag-handle.tsx
"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface RowDragHandleProps {
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  isSelected?: boolean;
}

export function RowDragHandle({ attributes, listeners, isSelected }: RowDragHandleProps) {
  return (
    <td
      className={cn(
        "sticky left-0 z-30 w-12 cursor-grab border-b border-neutral-100 bg-gray-50 px-1 text-center transition-all duration-200 hover:bg-neutral-50 active:cursor-grabbing",
        isSelected && "border-l-2 border-[#378ADD]"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-150">
        <GripVertical className="h-3.5 w-3.5 text-blue-600 hover:text-purple-600 transition-colors" />
      </div>
    </td>
  );
}
