// SimpleCRM — column-resizer
"use client";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ColumnResizerProps {
  columnId: string;
  initialWidth: number;
  onResize: (width: number) => void;
}

export function ColumnResizer({ columnId, initialWidth, onResize }: ColumnResizerProps) {
  const [isResizing, setIsResizing] = useState(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.pageX;
      const startWidth = initialWidth;   // always read from prop, never stale

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.pageX - startX;
        const newWidth = Math.max(80, startWidth + delta);
        onResize(newWidth);              // updates columnState → re-renders colgroup
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [initialWidth, onResize]
  );

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute right-0 top-0 h-full w-[4px] cursor-col-resize transition-colors z-30",
        isResizing 
          ? "bg-neutral-400" 
          : "bg-transparent hover:bg-neutral-300"
      )}
    />
  );
}
