// SimpleCRM — rating-cell.tsx
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RatingCellProps {
  value: number | null; // 0 to 5 or null
  onChange: (value: number) => void;
  readOnly?: boolean;
  tooltips?: string[]; // Custom labels like ['Bad', 'Okay', 'Good'...]
}

const DEFAULT_TOOLTIPS = ["Very Bad", "Bad", "Medium", "Good", "Excellent"];

export function RatingCell({ 
  value, 
  onChange, 
  readOnly = false,
  tooltips = DEFAULT_TOOLTIPS 
}: RatingCellProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-[1px]">
        {[1, 2, 3, 4, 5].map((star, index) => (
          <Tooltip key={star}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => !readOnly && onChange(star)}
                disabled={readOnly}
                className={cn(
                  "p-0 m-0 border-none bg-transparent transition-all duration-100",
                  readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
                )}
              >
                <Star
                  size={16}
                  className={cn(
                    "stroke-[1.5px]",
                    star <= (value || 0)
                      ? "text-[#FFB800] fill-[#FFB800]"
                      : "text-[#E5E7EB] fill-[#E5E7EB]"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="bg-black text-white text-[11px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200"
            >
              <p>{tooltips[index] || ""}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
