// SimpleCRM — inbox-table
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { PipelineLead } from "@/app/(app)/leads/pipeline/model";
import { InboxRow } from "./inbox-row";
import { LeadDetailModal } from "@/app/(app)/leads/pipeline/lead-detail/lead-detail-modal";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { designTokens } from "@/lib/design-system/tokens";

interface InboxTableProps {
  leads: PipelineLead[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onRefresh: () => void;
}

export function InboxTable({ leads, selectedIds, onToggle, onToggleAll, onRefresh }: InboxTableProps) {
  const [detailId, setDetailId] = useState<string | null>(null);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length;

  return (
    <>
      <DataTableWrapper>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="w-[48px] px-4 py-4 text-left">
                <Checkbox
                  checked={allSelected ? true : someSelected ? ("indeterminate" as any) : false}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all"
                  className="rounded-md border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
                />
              </th>
              <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Lead Details</th>
              <th className="w-[160px] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Phone</th>
              <th className="w-[140px] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Location</th>
              <th className="w-[180px] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Sources</th>
              <th className="w-[140px] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-neutral-400">Received At</th>
              <th className="w-[40px] px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {leads.map((lead) => (
              <InboxRow
                key={lead.id}
                lead={lead}
                isSelected={selectedIds.has(lead.id)}
                onToggle={() => onToggle(lead.id)}
                onExpand={() => setDetailId(lead.id)}
              />
            ))}
          </tbody>
        </table>
      </DataTableWrapper>
      
      {detailId && (
        <LeadDetailModal
          open={!!detailId}
          lead={leads.find(l => l.id === detailId) || null}
          onClose={() => setDetailId(null)}
          onUpdateField={async () => {}}
        />
      )}
    </>
  );
}
