// SimpleCRM — filter-leads.ts
import { PipelineLead, matchesText } from "../model";
import type { FilterState } from "./use-table-state";

export function filterLeads(leads: PipelineLead[], filters: FilterState): PipelineLead[] {
  return leads.filter((lead) => {
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

    // Last Contacted (date range)
    if (filters.lastContactedFrom && lead.lastContacted) {
      if (new Date(lead.lastContacted) < new Date(filters.lastContactedFrom + "T00:00:00.000Z")) {
        return false;
      }
    }
    if (filters.lastContactedTo && lead.lastContacted) {
      if (new Date(lead.lastContacted) > new Date(filters.lastContactedTo + "T23:59:59.999Z")) {
        return false;
      }
    }

    return true;
  });
}
