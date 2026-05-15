import { MapPin, Phone, User as UserIcon, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SourceCell } from "../cells/source-cell";
import { STATUS_CONFIG } from "../cells/status-cell";
import type { PipelineLead } from "../model";
import { cn } from "@/lib/utils";

interface LeadDetailHeaderProps {
  lead: PipelineLead;
}

export function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const initials = lead.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex shrink-0 flex-col bg-white px-6 py-5 border-b border-neutral-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center text-[15px] font-bold shadow-sm"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
          >
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="truncate text-xl font-bold text-neutral-900 tracking-tight">
              {lead.name}
            </h2>
            <div className="mt-1 flex items-center gap-3">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-blue-600 transition-colors"
                >
                  <Phone size={13} className="text-neutral-400" />
                  {lead.phone}
                </a>
              )}
              {lead.location && (
                <div className="flex items-center gap-1.5 text-[13px] text-neutral-400">
                  <MapPin size={13} className="text-neutral-300" />
                  {lead.location}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <SourceCell sources={lead.sources} readOnly />
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Created</span>
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={12} className="text-neutral-300" />
            <span className="text-[13px] font-semibold text-neutral-700">
              {format(new Date(lead.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Assigned to</span>
          {lead.assignedTo ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                {lead.assignedTo.avatarInitials}
              </div>
              <span className="text-[13px] font-semibold text-neutral-700">{lead.assignedTo.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <UserIcon size={12} className="text-neutral-300" />
              <span className="text-[13px] italic text-neutral-400">Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
