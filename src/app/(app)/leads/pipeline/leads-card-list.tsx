// SimpleCRM — leads-card-list.tsx
"use client";

import { Phone, Star } from "lucide-react";
import type { PipelineLead } from "./model";
import { STATUS_CONFIG } from "./cells/status-cell";

interface LeadsCardListProps {
  leads: PipelineLead[];
  onExpand: (id: string) => void;
  currentUserRole: string;
}

function LeadCard({ lead, onExpand }: { lead: PipelineLead; onExpand: (id: string) => void }) {
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onExpand(lead.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onExpand(lead.id);
      }}
      className="mb-3 w-full cursor-pointer rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition-colors active:bg-neutral-50"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="truncate font-semibold text-neutral-900">{lead.name}</span>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusConfig.dot }} />
          {statusConfig.label}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {lead.phone && (
          <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
            <Phone size={13} className="text-neutral-400" />
            {lead.phone}
          </div>
        )}
        <div className="flex items-center gap-2 text-[13px]">
          {lead.assignedTo ? (
            <>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[8px] font-bold text-blue-600">
                {lead.assignedTo.avatarInitials}
              </div>
              <span className="text-neutral-700">{lead.assignedTo.name}</span>
            </>
          ) : (
            <span className="italic text-neutral-400">Unassigned</span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {lead.rating != null ? (
          <span className="flex items-center gap-1 text-[13px] text-amber-500">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {lead.rating}/5
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand(lead.id);
          }}
          className="text-sm font-medium text-blue-600"
        >
          View
        </button>
      </div>
    </div>
  );
}

export function LeadsCardList({ leads, onExpand }: LeadsCardListProps) {
  return (
    <div className="lg:hidden flex-1 overflow-y-auto">
      {leads.length === 0 ? (
        <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-400">
          No leads found
        </div>
      ) : (
        <div className="p-4 pb-24">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onExpand={onExpand} />
          ))}
        </div>
      )}
    </div>
  );
}
