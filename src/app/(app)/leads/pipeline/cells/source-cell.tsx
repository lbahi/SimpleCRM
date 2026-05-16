// SimpleCRM — source-cell.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Built-in sources ────────────────────────────────────────
const BUILT_IN_SOURCES = [
  "FACEBOOK_AD",
  "WEBSITE",
  "INSTAGRAM",
  "REFERRAL",
  "COLD_OUTREACH",
  "WALK_IN",
  "MANUAL",
  "GOOGLE",
];

// ─── Source display labels ────────────────────────────────────
const SOURCE_LABELS: Record<string, string> = {
  FACEBOOK_AD: "Facebook Ad",
  WEBSITE: "Website",
  INSTAGRAM: "Instagram",
  REFERRAL: "Referral",
  COLD_OUTREACH: "Cold Outreach",
  WALK_IN: "Walk-in",
  MANUAL: "Manual",
  GOOGLE: "Google",
};

// ─── Source pill colors ───────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  FACEBOOK_AD: "bg-blue-100 text-blue-700 border-blue-200",
  WEBSITE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INSTAGRAM: "bg-pink-100 text-pink-700 border-pink-200",
  REFERRAL: "bg-violet-100 text-violet-700 border-violet-200",
  COLD_OUTREACH: "bg-orange-100 text-orange-700 border-orange-200",
  WALK_IN: "bg-teal-100 text-teal-700 border-teal-200",
  MANUAL: "bg-neutral-100 text-neutral-700 border-neutral-200",
  GOOGLE: "bg-amber-100 text-amber-700 border-amber-200",
};

const CUSTOM_DEFAULT = "bg-neutral-100 text-neutral-700 border-neutral-200";
const LS_KEY = "simpleCRM_customSources";

function getPillColor(source: string): string {
  return SOURCE_COLORS[source] ?? CUSTOM_DEFAULT;
}

function getLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

function loadCustomSources(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCustomSource(source: string) {
  if (typeof window === "undefined") return;
  const current = loadCustomSources();
  if (!current.includes(source)) {
    localStorage.setItem(LS_KEY, JSON.stringify([...current, source]));
  }
}

// ─── Props ───────────────────────────────────────────────────
interface SourceCellProps {
  sources: { source: string }[] | string[] | any;
  onChange?: (sources: string[]) => void;
  readOnly?: boolean;
  usePortal?: boolean;
}

// ─── Pill badge ──────────────────────────────────────────────
function SourcePill({
  source,
  onRemove,
}: {
  source: string;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border",
        getPillColor(source)
      )}
    >
      {getLabel(source)}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────
export function SourceCell({ sources, onChange, readOnly = false, usePortal = true }: SourceCellProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customSources, setCustomSources] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize sources to string array
  const currentSources: string[] = Array.isArray(sources)
    ? sources.map((s: any) => (typeof s === "string" ? s : s.source)).filter(Boolean)
    : [];

  // Load custom sources from localStorage on open
  useEffect(() => {
    if (open) {
      setCustomSources(loadCustomSources());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const allOptions = [...BUILT_IN_SOURCES, ...customSources.filter(
    (c) => !BUILT_IN_SOURCES.includes(c)
  )];

  const filtered = query.trim()
    ? allOptions.filter((s) =>
        getLabel(s).toLowerCase().includes(query.toLowerCase()) ||
        s.toLowerCase().includes(query.toLowerCase())
      )
    : allOptions;

  const queryIsNew =
    query.trim().length > 0 &&
    !allOptions.some(
      (s) =>
        s.toLowerCase() === query.trim().toLowerCase() ||
        getLabel(s).toLowerCase() === query.trim().toLowerCase()
    );

  const toggle = useCallback(
    (source: string) => {
      if (!onChange) return;
      const next = currentSources.includes(source)
        ? currentSources.filter((s) => s !== source)
        : [...currentSources, source];
      onChange(next);
    },
    [currentSources, onChange]
  );

  const addCustom = useCallback(() => {
    const name = query.trim().toUpperCase().replace(/\s+/g, "_");
    if (!name) return;
    saveCustomSource(name);
    setCustomSources(loadCustomSources());
    if (!currentSources.includes(name)) {
      onChange?.([...currentSources, name]);
    }
    setQuery("");
  }, [query, currentSources, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && queryIsNew) {
      e.preventDefault();
      addCustom();
    }
  };

  // Display-only (read-only or no onChange)
  if (readOnly || !onChange) {
    return (
      <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
        {currentSources.length === 0 ? (
          <span className="text-neutral-400 text-[12px]">—</span>
        ) : (
          currentSources.map((s) => <SourcePill key={s} source={s} />)
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex flex-wrap items-center gap-1 min-h-[32px] w-full group cursor-pointer text-left outline-none">
        {currentSources.length === 0 ? (
          <span className="text-neutral-300 text-[12px] group-hover:text-neutral-400 italic">
            Add source...
          </span>
        ) : (
          currentSources.map((s) => <SourcePill key={s} source={s} />)
        )}
        <div className="flex items-center justify-center w-5 h-5 rounded-md border border-dashed border-neutral-300 text-neutral-400 opacity-0 group-hover:opacity-100 hover:border-neutral-400 hover:text-neutral-600 transition-all ml-0.5">
          <Plus size={12} />
        </div>
      </PopoverTrigger>

      <PopoverContent
        usePortal={usePortal}
        className="w-[280px] rounded-xl border border-neutral-200 bg-white p-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[200]"
        align="start"
        side="bottom"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Selected pills */}
        {currentSources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-3 pb-0">
            {currentSources.map((s) => (
              <SourcePill
                key={s}
                source={s}
                onRemove={() => toggle(s)}
              />
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or add source..."
            className="flex-1 bg-transparent text-[13px] text-neutral-700 placeholder:text-neutral-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Options list */}
        <div className="max-h-[200px] overflow-y-auto py-1">
          {filtered.length === 0 && !queryIsNew && (
            <p className="px-3 py-4 text-center text-[12px] text-neutral-400">
              No sources found
            </p>
          )}
          {filtered.map((source) => {
            const isSelected = currentSources.includes(source);
            return (
              <button
                key={source}
                type="button"
                onClick={() => toggle(source)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-[13px] transition-colors",
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 rounded border items-center justify-center transition-colors",
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-neutral-300"
                  )}
                >
                  {isSelected && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className={cn("h-2 w-2 rounded-full shrink-0", getPillColor(source).split(" ")[0])} />
                {getLabel(source)}
              </button>
            );
          })}

          {/* Add custom source button */}
          {queryIsNew && (
            <button
              type="button"
              onClick={addCustom}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              Add &ldquo;{query.trim()}&rdquo; as source
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
