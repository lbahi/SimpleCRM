// SimpleCRM — use-leads.ts
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  PipelineLead, 
  applyFieldChange, 
  checkResponse, 
  ColumnId,
  getFieldValue,
  matchesText,
  compareValues
} from "../model";
import type { PaginatedLeads } from "@/modules/leads/leads.types";
import { TableState } from "./use-table-state";

export function useLeads(initialData: PaginatedLeads, tableState: TableState) {
  const initialLeads = useMemo<PipelineLead[]>(() => {
    if (initialData.leads.length === 0) return [];
    return initialData.leads as unknown as PipelineLead[];
  }, [initialData.leads]);

  const [allLeads, setAllLeads] = useState<PipelineLead[]>(initialLeads);
  const [manualOrder, setManualOrder] = useState<string[] | null>(null);

  const updateLocalLead = (
    leadId: string,
    updater: (lead: PipelineLead) => PipelineLead
  ) => {
    setAllLeads((prev) => prev.map((lead) => (lead.id === leadId ? updater(lead) : lead)));
  };

  const persistFieldChange = async (
    lead: PipelineLead,
    column: ColumnId,
    rawValue: unknown
  ) => {
    const optimistic = applyFieldChange(lead, column, rawValue);
    updateLocalLead(lead.id, () => optimistic);

    try {
      const body = column === "assignedTo" 
        ? { assignedToId: (rawValue as any)?.id ?? null }
        : column.startsWith("custom_")
          ? { customFields: { ...(lead.customFields || {}), [column]: rawValue } }
          : { [column]: rawValue };

      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(checkResponse);
    } catch (error) {
      updateLocalLead(lead.id, () => lead);
      toast.error(error instanceof Error ? error.message : "Failed to update lead");
    }
  };

  const refreshLeads = async () => {
    try {
      const res = await fetch("/api/leads?page=1&limit=100&sortBy=createdAt&sortDir=desc");
      if (!res.ok) throw new Error("Failed to refresh leads");
      const payload: PaginatedLeads = await res.json();
      if (payload.leads.length === 0) {
        setAllLeads([]);
      } else {
        setAllLeads(payload.leads as unknown as PipelineLead[]);
      }
      setManualOrder(null); // Clear manual order on refresh
    } catch {
      toast.error("Failed to refresh leads");
    }
  };

  const filteredLeads = useMemo(() => {
    const { quickSearch, filters } = tableState;
    return allLeads.filter((lead) => {
      // Quick search
      const searchBlob = [
        lead.name,
        lead.phone,
        lead.location,
        lead.assignedTo?.name,
      ].join(" ").toLowerCase();

      if (quickSearch.trim() && !searchBlob.includes(quickSearch.trim().toLowerCase())) {
        return false;
      }

      // Advanced Filters
      // Status (multi-select)
      if (filters.status && filters.status.length > 0 && !filters.status.includes(lead.status)) {
        return false;
      }
      
      // Assigned To
      if (filters.assignedTo) {
        if (filters.assignedTo === "UNASSIGNED") {
          if (lead.assignedToId) return false;
        } else if (lead.assignedToId !== filters.assignedTo) {
          return false;
        }
      }
      
      // Source (multi-select)
      if (filters.sources && filters.sources.length > 0) {
        const leadSources = lead.sources.map(s => s.source.toUpperCase());
        const filterSources = filters.sources.map((s: string) => s.toUpperCase());
        if (!filterSources.some(s => leadSources.includes(s))) {
          return false;
        }
      }
      
      // Location (text input)
      if (filters.location && !matchesText(lead.location, (filters.location as string))) {
        return false;
      }

      // Rating (star rating)
      if (filters.rating && filters.rating > 0 && (lead.rating ?? 0) < (filters.rating as number)) {
        return false;
      }

      return true;
    });
  }, [allLeads, tableState.quickSearch, tableState.filters]);

  const sortedLeads = useMemo(() => {
    // If manual order is set, use that instead of sorting
    if (manualOrder) {
      const orderMap = new Map(manualOrder.map((id, index) => [id, index]));
      return [...filteredLeads].sort((a, b) => {
        const aIdx = orderMap.get(a.id) ?? 9999;
        const bIdx = orderMap.get(b.id) ?? 9999;
        return aIdx - bIdx;
      });
    }

    const { sortField, sortDirection } = tableState;
    return [...filteredLeads].sort((a, b) =>
      compareValues(getFieldValue(a, sortField), getFieldValue(b, sortField), sortDirection)
    );
  }, [filteredLeads, tableState.sortField, tableState.sortDirection, manualOrder]);

  const reorderLeads = async (orderedIds: string[]) => {
    // Set manual order to prevent automatic sorting from overriding
    setManualOrder(orderedIds);
    
    // Optimistic update
    const idMap = new Map(orderedIds.map((id, index) => [id, index]));
    setAllLeads((prev) => {
      const next = [...prev].sort((a, b) => {
        const aIdx = idMap.get(a.id) ?? 9999;
        const bIdx = idMap.get(b.id) ?? 9999;
        return aIdx - bIdx;
      });
      return next;
    });

    try {
      await fetch("/api/leads/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      }).then(checkResponse);
    } catch (error) {
      toast.error("Failed to persist new order");
      setManualOrder(null); // Clear manual order on error
      refreshLeads();
    }
  };

  return {
    allLeads,
    setAllLeads,
    sortedLeads,
    persistFieldChange,
    refreshLeads,
    updateLocalLead,
    reorderLeads,
    clearManualOrder: () => setManualOrder(null),
  };
}
