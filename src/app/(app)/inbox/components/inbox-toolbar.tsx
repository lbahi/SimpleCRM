// SimpleCRM — inbox-toolbar
"use client";

import { Search, ArrowUpDown, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface InboxToolbarProps {
  count: number;
  selectedCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  sortDir: "desc" | "asc";
  onToggleSort: () => void;
  onClearSelection: () => void;
  onAssignClick: () => void;
}

export function InboxToolbar({
  count,
  selectedCount,
  search,
  onSearchChange,
  sortDir,
  onToggleSort,
  onClearSelection,
  onAssignClick,
}: InboxToolbarProps) {
  const t = useTranslations("inbox");
  const leads = useTranslations("leads");
  const isSelectionMode = selectedCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={leads("searchPlaceholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full sm:w-64 rounded-xl border border-neutral-200 bg-white ps-10 pe-4 text-sm outline-none transition-all focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 placeholder:text-neutral-400"
            />
          </div>
          <Button
            variant="outline"
            onClick={onToggleSort}
            className="h-10 gap-2 rounded-xl border-neutral-200 px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDir === "desc" ? t("newest") : t("oldest")}
          </Button>
        </div>
      </div>

      {/* Selection Mode Bar */}
      <div 
        className={`relative h-14 overflow-hidden rounded-2xl border transition-all duration-300 ${
          isSelectionMode 
            ? "border-neutral-900 bg-neutral-900 shadow-lg translate-y-0 opacity-100" 
            : "border-transparent bg-transparent -translate-y-2 opacity-0 pointer-events-none h-0"
        }`}
      >
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-900">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <span className="text-sm font-semibold text-white">
              {t("selected", { count: selectedCount })}
            </span>
            <div className="h-4 w-[1px] bg-white/20" />
            <button
              onClick={onClearSelection}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {t("clearSelection")}
            </button>
          </div>
          <Button 
            onClick={onAssignClick} 
            className="h-9 rounded-lg bg-white px-5 text-sm font-bold text-neutral-900 hover:bg-neutral-100"
          >
            {t("assignLeads")}
          </Button>
        </div>
      </div>
    </div>
  );
}
