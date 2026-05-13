// SimpleCRM — reference-cells
"use client";

import { LeadStatus } from "@prisma/client";
import { Star } from "lucide-react";

export function StatusCell({ status }: { status: LeadStatus | string }) {
  const statusStyles: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    FRESH: 'bg-green-100 text-green-700',
    CONTACTED: 'bg-purple-100 text-purple-700',
    QUALIFIED: 'bg-amber-100 text-amber-700',
    CONVERTED: 'bg-emerald-100 text-emerald-700',
    LOST: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function RatingCell({ rating, onChange }: { rating: number, onChange: (val: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => {
            e.stopPropagation();
            onChange(star);
          }}
          className="p-0.5 transition-colors"
        >
          <Star
            size={14}
            className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}
