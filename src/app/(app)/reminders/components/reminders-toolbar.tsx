// SimpleCRM — reminders-toolbar
"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TabId = "all" | "upcoming" | "overdue";

const TABS: TabId[] = ["all", "upcoming", "overdue"];

interface RemindersToolbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export function RemindersToolbar({ activeTab, onTabChange, search, onSearchChange }: RemindersToolbarProps) {
  const t = useTranslations("reminders");

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-lg font-semibold text-neutral-900 shrink-0">{t("title")}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                "rounded-full px-3 py-1 text-[13px] font-medium transition-all",
                activeTab === tab
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-[200px] rounded-md border border-neutral-200 bg-white ps-8 pe-3 text-[13px] outline-none focus:border-neutral-300"
          />
        </div>
      </div>
    </div>
  );
}
