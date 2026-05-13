// SimpleCRM — inbox-workspace
"use client";

import { useState } from "react";
import type { PipelineLead } from "@/app/(app)/leads/pipeline/model";
import { InboxToolbar } from "./inbox-toolbar";
import { InboxTable } from "./inbox-table";
import { InboxEmptyState } from "./inbox-empty-state";
import { AssignDialog } from "./dialogs/assign-dialog";

export function InboxWorkspace({ initialData }: { initialData: PipelineLead[] }) {
  const [leads, setLeads] = useState<PipelineLead[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filteredLeads = leads
    .filter((l) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || (l.phone && l.phone.includes(q));
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDir === "desc" ? bTime - aTime : aTime - bTime;
    });

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleAssignSuccess = (assignedIds: string[]) => {
    setLeads((prev) => prev.filter((l) => !assignedIds.includes(l.id)));
    setSelectedIds(new Set());
    setIsAssignOpen(false);
  };

  const hasLeads = leads.length > 0;
  const hasResults = filteredLeads.length > 0;

  return (
    <div className="space-y-6">
      <InboxToolbar
        count={leads.length}
        selectedCount={selectedIds.size}
        search={search}
        onSearchChange={setSearch}
        sortDir={sortDir}
        onToggleSort={() => setSortDir((p) => (p === "desc" ? "asc" : "desc"))}
        onClearSelection={() => setSelectedIds(new Set())}
        onAssignClick={() => setIsAssignOpen(true)}
      />

      {!hasLeads ? (
        <InboxEmptyState variant="empty" />
      ) : !hasResults ? (
        <InboxEmptyState variant="no_results" />
      ) : (
        <InboxTable
          leads={filteredLeads}
          selectedIds={selectedIds}
          onToggle={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onRefresh={() => {}}
        />
      )}

      <AssignDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        selectedIds={Array.from(selectedIds)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}
