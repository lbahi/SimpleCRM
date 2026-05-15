// SimpleCRM — source-cell.tsx
"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceColors = [
  'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  'bg-amber-100 text-amber-700 hover:bg-amber-200',
  'bg-violet-100 text-violet-700 hover:bg-violet-200',
];

interface SourceCellProps {
  sources: any;
  onChange?: (sources: string[]) => void;
  readOnly?: boolean;
}

export function SourceCell({ sources, onChange, readOnly = true }: SourceCellProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSource, setNewSource] = useState("");

  let normalizedSources: string[] = [];

  if (Array.isArray(sources)) {
    normalizedSources = sources.map((s: any) => {
      if (typeof s === 'string') return s;
      return s.source || s.name || 'Unknown';
    });
  } else if (typeof sources === 'string' && sources.trim().length > 0) {
    normalizedSources = [sources];
  }

  // Deduplicate
  const uniqueSources = Array.from(new Set(normalizedSources));

  const handleAdd = () => {
    if (newSource.trim() && onChange) {
      onChange([...uniqueSources, newSource.trim()]);
      setNewSource("");
      setIsAdding(false);
    }
  };

  const handleRemove = (sourceToRemove: string) => {
    if (onChange) {
      onChange(uniqueSources.filter(s => s !== sourceToRemove));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
      {uniqueSources.map((source, idx) => (
        <span
          key={`${source}-${idx}`}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors",
            sourceColors[idx % sourceColors.length]
          )}
        >
          {source}
          {!readOnly && onChange && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(source);
              }}
              className="hover:text-black transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </span>
      ))}

      {!readOnly && onChange && (
        <div className="flex items-center">
          {isAdding ? (
            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded px-1 py-0.5">
              <input
                autoFocus
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  } else if (e.key === "Escape") {
                    setIsAdding(false);
                  }
                }}
                className="w-16 bg-transparent text-[11px] outline-none"
                placeholder="Source..."
              />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                className="text-neutral-400 hover:text-black"
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdding(true);
              }}
              className="flex items-center justify-center w-5 h-5 rounded-md border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-all"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      )}

      {uniqueSources.length === 0 && readOnly && <span className="text-neutral-400">-</span>}
    </div>
  );
}
