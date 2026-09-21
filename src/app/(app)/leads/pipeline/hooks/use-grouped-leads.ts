// SimpleCRM — use-grouped-leads.ts
import { useMemo } from "react";
import { ColumnId, PipelineLead } from "../model";
import { getFieldValue, valueToString } from "../model.utils";

export function useGroupedLeads(leads: PipelineLead[], groupBy: string | null) {
  const groupedLeads = useMemo(() => {
    if (!groupBy) return { ungrouped: leads };
    const groups: Record<string, PipelineLead[]> = {};
    leads.forEach((lead: PipelineLead) => {
      const val = getFieldValue(lead, groupBy as ColumnId);
      const groupKey = valueToString(val) || 'Unassigned';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(lead);
    });
    return groups;
  }, [leads, groupBy]);

  const groupSignature = useMemo(() => {
    if (!groupBy) return "ungrouped";
    return Object.keys(groupedLeads).sort().join("|");
  }, [groupedLeads, groupBy]);

  return { groupedLeads, groupSignature };
}