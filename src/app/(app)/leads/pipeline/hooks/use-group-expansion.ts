// SimpleCRM — use-group-expansion.ts
import { useEffect, useState } from "react";

export function useGroupExpansion(groupSignature: string) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const keys = groupSignature === "ungrouped" ? [] : groupSignature.split("|").filter(Boolean);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.add(key));
      return next;
    });
  }, [groupSignature]);

  return { expandedGroups, setExpandedGroups };
}