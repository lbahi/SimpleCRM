// SimpleCRM — team-view-table (read-only leads table for member team tab)
"use client";

import { useEffect, useState, useCallback } from "react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusCell } from "./pipeline/cells/status-cell";
import { RatingCell } from "./pipeline/cells/rating-cell";
import type { PipelineLead } from "./pipeline/model";

export function TeamViewTable() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads?view=team&limit=100");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeamLeads(); }, [fetchTeamLeads]);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Users className="h-8 w-8 opacity-20" />
        <span className="text-sm">No assigned leads yet</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assignee</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr key={lead.id} className="transition-colors hover:bg-muted/20">
              <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
              <td className="px-4 py-3">
                <StatusCell value={lead.status} onChange={() => {}} readOnly />
              </td>
              <td className="px-4 py-3">
                {lead.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {lead.assignedTo.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] text-foreground">{lead.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-[13px] text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <RatingCell value={lead.rating || 0} onChange={() => {}} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
