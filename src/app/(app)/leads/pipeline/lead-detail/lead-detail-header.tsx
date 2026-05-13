// SimpleCRM — lead-detail-header.tsx
import { MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SourceCell } from "../cells/source-cell";
import { STATUS_CONFIG } from "../cells/status-cell";
import type { PipelineLead } from "../model";

interface LeadDetailHeaderProps {
  lead: PipelineLead;
}

export function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const initials = lead.name.slice(0, 2).toUpperCase();

  const sources = lead.sources;
  const location = lead.location;

  return (
    <div className="flex shrink-0 flex-col border-b border-border bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 px-6 pb-5 pt-4 pr-14">
      <div className="flex items-start gap-4">
        <Avatar className="mt-1 h-12 w-12 border-2 border-white/50 shadow-lg bg-gradient-to-br from-blue-100 to-purple-100">
          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {lead.name}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium transition-colors hover:text-blue-700 bg-blue-50/50 px-2 py-1 rounded-full"
              >
                <Phone className="h-3.5 w-3.5" />
                {lead.phone}
              </a>
            )}
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-purple-600 font-medium bg-purple-50/50 px-2 py-1 rounded-full">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </div>
            )}
            {sources && (
              <div className="flex items-center">
                <SourceCell sources={sources} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-6 border-t border-dashed border-purple-200/50 pt-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70">Created</span>
          <span className="mt-0.5 text-[12px] font-semibold text-foreground">
            {format(new Date(lead.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70">Assigned to</span>
          {lead.assignedTo ? (
            <div className="mt-0.5 flex items-center gap-1.5">
              <Avatar className="h-5 w-5 border-2 border-white/50 shadow-sm bg-gradient-to-br from-blue-100 to-purple-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-[8px] font-bold">
                  {lead.assignedTo.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12px] font-semibold text-foreground">{lead.assignedTo.name}</span>
            </div>
          ) : (
            <span className="mt-0.5 text-[12px] italic text-muted-foreground">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
