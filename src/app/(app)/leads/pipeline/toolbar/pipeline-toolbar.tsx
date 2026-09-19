// SimpleCRM — pipeline-toolbar
"use client";

import { Search, Filter, Settings, RefreshCw, Sparkles, Plus } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { useTranslations } from "next-intl";

interface PipelineToolbarProps {
  tableState: any;
  columnState: any;
  onShowCreate: () => void;
  onShowFilter: () => void;
  onShowCustomize: () => void;
  onRefreshLeads: () => void;
}

export function PipelineToolbar({
  tableState,
  columnState,
  onShowCreate,
  onShowFilter,
  onShowCustomize,
  onRefreshLeads,
}: PipelineToolbarProps) {
  const t = useTranslations("leads");
  const activeFiltersCount = [
    tableState.filters.status?.length > 0,
    tableState.filters.sources?.length > 0,
    !!tableState.filters.assignedTo,
    !!tableState.filters.location,
    tableState.filters.rating > 0,
    !!tableState.filters.lastContactedFrom,
    !!tableState.filters.lastContactedTo,
  ].filter(Boolean).length;

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 -mx-6 -mt-6 mb-6 overflow-x-auto shrink-0">
      <div className="flex items-center justify-between gap-4 min-w-max">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-64 shrink-0">
            <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={tableState.quickSearch}
              onChange={(e) => tableState.setQuickSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-9 pe-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black shrink-0"
            />
          </div>

          {/* Filters */}
          <button
            onClick={onShowFilter}
            className="relative px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2 shrink-0"
          >
            <Filter size={16} />
            {t("filters")} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -end-1 size-5 bg-black text-white rounded-full text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Group By */}
          <CustomDropdown
            value={tableState.groupBy || ''}
            onChange={(val) => tableState.setGroupBy(val || null)}
            options={[
              { value: '', label: t("groupBy") },
              { value: 'status', label: t("groupByStatus") },
              { value: 'rating', label: t("groupByRating") },
              { value: 'location', label: t("groupByLocation") },
              { value: 'sources', label: t("groupBySource") },
              { value: 'assignedTo', label: t("groupByAssignedTo") },
            ]}
            className="w-48 shrink-0"
          />

          {/* Customize */}
          <button
            onClick={onShowCustomize}
            className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2 shrink-0"
          >
            <Settings size={16} />
            {t("customize")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Lead (Desktop) */}
          <button
            onClick={onShowCreate}
            className="hidden lg:flex px-3 py-2 bg-black text-white rounded text-sm hover:bg-neutral-800 items-center gap-2 font-medium transition-colors shrink-0"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefreshLeads}
            className="p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 shrink-0"
            title={t("refresh")}
          >
            <RefreshCw size={16} />
          </button>

          {/* AI Button */}
          <button className="p-2 border border-gray-300 rounded text-sm hover:bg-gray-50 shrink-0" title={t("aiFeatures")}>
            <Sparkles size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
