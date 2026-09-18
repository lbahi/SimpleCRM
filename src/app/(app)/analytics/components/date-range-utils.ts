// SimpleCRM — date-range-utils.ts
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

export interface DateRangeState {
  from?: Date;
  to?: Date;
}

export type PresetKey =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export interface PresetItem {
  key: PresetKey;
  label: string;
}

export const PRESETS: PresetItem[] = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "custom", label: "Custom range" },
];

export function computePresetRange(key: PresetKey, now = new Date()): DateRangeState | null {
  switch (key) {
    case "today":
      return { from: now, to: now };
    case "last7":
      return { from: subDays(now, 6), to: now };
    case "last30":
      return { from: subDays(now, 29), to: now };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "custom":
    default:
      return null;
  }
}

export function formatRangeLabel(from?: Date, to?: Date): string {
  if (!from || !to) return "All time";
  const sameYear = from.getFullYear() === to.getFullYear();
  if (format(from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")) {
    return format(from, "MMM d, yyyy");
  }
  const fromStr = format(from, sameYear ? "MMM d" : "MMM d, yyyy");
  const toStr = format(to, "MMM d, yyyy");
  return `${fromStr} – ${toStr}`;
}

export function toDateParam(d: Date): string {
  return format(d, "yyyy-MM-dd");
}
