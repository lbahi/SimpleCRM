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
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [column]: rawValue }),
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
      const searchBlob = [
        lead.name,
        lead.phone,
        lead.location,
        lead.assignedTo?.name,
      ]
        .join(" ")
        .toLowerCase();

      if (quickSearch.trim() && !searchBlob.includes(quickSearch.trim().toLowerCase())) {
        return false;
      }

      if (!matchesText(lead.name, filters.name)) return false;
      if (!matchesText(lead.phone, filters.phone)) return false;
      if (!matchesText(lead.location, filters.location)) return false;
      if (!matchesText(lead.assignedTo?.name, filters.assignedTo)) return false;

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
