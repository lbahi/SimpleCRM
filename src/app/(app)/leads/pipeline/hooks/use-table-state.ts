// SimpleCRM — use-table-state.ts
import { useState } from "react";
import { GroupByField, ColumnId } from "../model";

interface FilterState {
  name: string;
  phone: string;
  location: string;
  assignedTo: string;
  status: string;
  rating: string;
}

const INITIAL_FILTERS: FilterState = {
  name: "",
  phone: "",
  location: "",
  assignedTo: "",
  status: "",
  rating: "",
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
