// SimpleCRM — analytics-date-range-picker.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DateRangeState,
  PresetKey,
  PRESETS,
  computePresetRange,
  formatRangeLabel,
  toDateParam,
} from "./date-range-utils";
import { TwoMonthCalendar } from "./two-month-calendar";

export function AnalyticsDateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  // Initialize from URL search params
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const initialRange: DateRangeState = {
    from: fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : undefined,
    to: toParam ? new Date(`${toParam}T23:59:59.999Z`) : undefined,
  };

  const [tempRange, setTempRange] = useState<DateRangeState>(initialRange);

  useEffect(() => {
    const from = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : undefined;
    const to = toParam ? new Date(`${toParam}T23:59:59.999Z`) : undefined;
    setTempRange({ from, to });

    if (from && to) {
      const matched = PRESETS.find((p) => {
        if (p.key === "custom") return false;
        const r = computePresetRange(p.key);
        return (
          r?.from &&
          r?.to &&
          toDateParam(r.from) === fromParam &&
          toDateParam(r.to) === toParam
        );
      });
      setActivePreset(matched ? matched.key : "custom");
    } else {
      setActivePreset(null);
    }
  }, [fromParam, toParam]);

  const commitRange = (range: DateRangeState) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range.from && range.to) {
      params.set("from", toDateParam(range.from));
      params.set("to", toDateParam(range.to));
    } else {
      params.delete("from");
      params.delete("to");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/analytics?${qs}` : "/analytics", { scroll: false });
    });
    setOpen(false);
  };

  const handleSelectPreset = (preset: PresetKey) => {
    setActivePreset(preset);
    if (preset === "custom") {
      return;
    }
    const computed = computePresetRange(preset);
    if (computed?.from && computed?.to) {
      setTempRange(computed);
      commitRange(computed);
    }
  };

  const handleClear = () => {
    setActivePreset(null);
    setTempRange({ from: undefined, to: undefined });
    commitRange({ from: undefined, to: undefined });
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      commitRange(tempRange);
    }
  };

  const currentLabel = formatRangeLabel(initialRange.from, initialRange.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-[#1E293B] shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer"
        aria-label="Filter analytics by date range"
      >
        <CalendarIcon className="h-4 w-4 text-neutral-500" />
        <span className="max-w-[140px] truncate">{currentLabel}</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto max-w-[calc(100vw-2rem)] overflow-x-hidden p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50"
      >
        <div className="flex gap-4">
          {/* Presets Column */}
          <div className="flex flex-col w-36 gap-0.5 border-r border-neutral-100 pr-3">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
              Presets
            </span>
            {PRESETS.map((p) => {
              const isSelected = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSelectPreset(p.key)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-start transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-[#2563EB] font-semibold"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB]" />}
                </button>
              );
            })}
          </div>

          {/* Calendar Column (shown when Custom is active or default) */}
          <div className="pl-1">
            <TwoMonthCalendar
              range={tempRange}
              onRangeChange={(next) => {
                setActivePreset("custom");
                setTempRange(next);
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500 font-medium">
            {formatRangeLabel(tempRange.from, tempRange.to)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!tempRange.from || !tempRange.to}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              Apply Range
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
