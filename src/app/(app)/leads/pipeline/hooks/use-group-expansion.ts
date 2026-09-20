// SimpleCRM — use-group-expansion.ts
import { useEffect, useState } from "react";
import type { PipelineLead } from "../model";

export function useGroupExpansion(groupedLeads: Record<string, PipelineLead[]>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      Object.keys(groupedLeads).forEach((key) => next.add(key));
      return next;
    });
  }, [groupedLeads]);

  return { expandedGroups, setExpandedGroups };
}