// SimpleCRM — column-resizer.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ColumnResizerProps {
  columnId: string;
  initialWidth: number;
  onResize: (width: number) => void;
}

export function ColumnResizer({
  columnId,
  initialWidth,
  onResize,
}: ColumnResizerProps) {
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.pageX;
    const startWidth = initialWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.pageX;
      const newWidth = startWidth + (currentX - startX);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [initialWidth, onResize]);

  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-neutral-300 transition-colors z-20",
        isResizing && "bg-blue-500 w-0.5"
      )}
      onMouseDown={startResizing}
    />
  );
}
