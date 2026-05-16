// SimpleCRM — filter-rating-section.tsx
"use client";

import { cn } from "@/lib/utils";

interface FilterRatingSectionProps {
  rating: number;
  onChange: (rating: number) => void;
}

export function FilterRatingSection({ rating, onChange }: FilterRatingSectionProps) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Minimum Rating</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star === rating ? 0 : star)}
            className={cn(
              "flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 transition-all",
              rating >= star ? "bg-amber-50 border-amber-200 text-amber-500" : "bg-white border-neutral-100 text-neutral-300"
            )}
          >
            <span className="text-[13px] font-bold">{star}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={rating >= star ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
