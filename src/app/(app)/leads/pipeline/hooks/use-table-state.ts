// SimpleCRM — use-table-state.ts
import { useCallback, useState } from "react";
import { GroupByField, ColumnId } from "../model";

const GROUP_BY_STORAGE_KEY = "crm_groupBy";
const GROUP_BY_VALUES: GroupByField[] = ["status", "rating", "location", "assignedTo", "sources"];

export interface FilterState {
  status: string[];
  assignedTo: string;
  sources: string[];
  location: string;
  rating: number;
  lastContactedFrom?: string;
  lastContactedTo?: string;
  [key: string]: string | string[] | number | null | undefined;
}

const INITIAL_FILTERS: FilterState = {
  status: [],
  assignedTo: "",
  sources: [],
  location: "",
  rating: 0,
  lastContactedFrom: undefined,
  lastContactedTo: undefined,
};

export function useTableState() {
  const [quickSearch, setQuickSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [groupBy, setGroupByState] = useState<GroupByField>(() => {
    try {
      const saved = localStorage.getItem(GROUP_BY_STORAGE_KEY);
      if (saved && (GROUP_BY_VALUES as string[]).includes(saved)) {
        return saved as GroupByField;
      }
      return null;
    } catch {
      return null;
    }
  });

  const setGroupBy = useCallback((value: GroupByField) => {
    setGroupByState(value);
    try {
      if (value) localStorage.setItem(GROUP_BY_STORAGE_KEY, value);
      else localStorage.removeItem(GROUP_BY_STORAGE_KEY);
    } catch {}
  }, []);
  const [sortField, setSortField] = useState<ColumnId>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const setSort = (field: ColumnId, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  return {
    quickSearch,
    setQuickSearch,
    filters,
    setFilters,
    draftFilters,
    setDraftFilters,
    groupBy,
    setGroupBy,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setSort,
  };
}

export type TableState = ReturnType<typeof useTableState>;
