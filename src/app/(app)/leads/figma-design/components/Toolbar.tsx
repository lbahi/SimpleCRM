import { Search, Filter, Settings, Plus, RefreshCw, Trash2 } from 'lucide-react';

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFiltersCount: number;
  onOpenFilters: () => void;
  groupBy: string | null;
  onGroupByChange: (value: string | null) => void;
  onOpenCustomize: () => void;
  onCreateLead: () => void;
  onRefresh: () => void;
  onAddColumn: () => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
}

export function Toolbar({
  searchValue,
  onSearchChange,
  activeFiltersCount,
  onOpenFilters,
  groupBy,
  onGroupByChange,
  onOpenCustomize,
  onCreateLead,
  onRefresh,
  onAddColumn,
  selectedCount = 0,
  onDeleteSelected,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search leads..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {selectedCount > 0 && (
        <button
          onClick={onDeleteSelected}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} />
          Delete ({selectedCount})
        </button>
      )}

      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 relative transition-colors"
      >
        <Filter size={16} />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 size-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <select
        value={groupBy || ''}
        onChange={(e) => onGroupByChange(e.target.value || null)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">No grouping</option>
        <option value="status">Group by Status</option>
        <option value="assignedTo">Group by Assignee</option>
      </select>

      <button
        onClick={onOpenCustomize}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        <Settings size={16} />
        Customize
      </button>

      <div className="h-8 w-px bg-gray-200 mx-1" />

      <button
        onClick={onRefresh}
        className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        title="Refresh"
      >
        <RefreshCw size={16} />
      </button>

      <button
        onClick={onCreateLead}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
      >
        <Plus size={16} />
        Create Lead
      </button>
    </div>
  );
}
