// SimpleCRM — use-table-state.ts
import { useState } from "react";
import { GroupByField, ColumnId } from "../model";

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
  const [groupBy, setGroupBy] = useState<GroupByField>(null);
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
