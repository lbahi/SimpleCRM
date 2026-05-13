// SimpleCRM — rating-cell.tsx
"use client";

import { Star } from "lucide-react";

interface RatingCellProps {
  value: number | null; // 0 to 5 or null
  onChange: (value: number) => void;
  readOnly?: boolean;
}

export function RatingCell({ value, onChange, readOnly = false }: RatingCellProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange(star)}
          disabled={readOnly}
          className={`transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
        >
          <Star
            className={`h-4 w-4 ${star <= (value || 0) ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}
