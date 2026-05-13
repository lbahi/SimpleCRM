// SimpleCRM — row-drag-handle.tsx
"use client";

import { GripVertical } from "lucide-react";

interface RowDragHandleProps {
  attributes?: any;
  listeners?: any;
}

export function RowDragHandle({ attributes, listeners }: RowDragHandleProps) {
  return (
    <td
      className="sticky left-0 z-30 w-10 cursor-grab border-b border-r border-border bg-gradient-to-br from-blue-50/20 to-purple-50/20 px-1 text-center transition-all duration-200 hover:from-blue-100/40 hover:to-purple-100/40 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-150">
        <GripVertical className="h-3.5 w-3.5 text-blue-600 hover:text-purple-600 transition-colors" />
      </div>
    </td>
  );
}
