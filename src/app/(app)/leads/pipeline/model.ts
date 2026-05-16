// SimpleCRM — model.ts
import { 
  Sparkles, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Star, 
  User, 
  List, 
  Calendar 
} from "lucide-react";
import { LeadWithRelations } from "@/modules/leads/leads.types";
import { 
  PipelineLead, 
  FigmaLead, 
  ColumnId, 
  ColumnDef 
} from "./model.types";

export * from "./model.types";
export * from "./model.utils";

// Adapters
export function prismaLeadToPipelineLead(prismaLead: LeadWithRelations): PipelineLead {
  return {
    id: prismaLead.id,
    name: prismaLead.name,
    phone: prismaLead.phone,
    location: prismaLead.location,
    status: prismaLead.status,
    rating: prismaLead.rating,
    assignedToId: prismaLead.assignedToId,
    assignedTo: prismaLead.assignedTo ? {
      id: prismaLead.assignedTo.id,
      name: prismaLead.assignedTo.name,
      avatarInitials: prismaLead.assignedTo.avatarInitials,
    } : null,
    sources: prismaLead.sources.map(s => ({ source: s.source })),
    lastContacted: prismaLead.lastContacted,
    createdAt: prismaLead.createdAt,
    reminders: prismaLead.reminders.map(r => ({
      id: r.id,
      dueAt: r.dueAt,
      status: r.status,
    })),
    notes: prismaLead.notes.map(n => ({ body: n.body })),
    customFields: prismaLead.customFields as Record<string, unknown> | null,
    order: prismaLead.order,
    updatedAt: prismaLead.updatedAt,
  };
}

export function pipelineLeadToFigmaLead(lead: PipelineLead): FigmaLead {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone || "",
    location: lead.location || "",
    assignedTo: lead.assignedTo?.name || "",
    status: lead.status,
    rating: lead.rating || 0,
    sources: lead.sources.map(s => s.source),
    lastContacted: lead.lastContacted,
    createdAt: lead.createdAt,
    manualOrder: lead.order,
  };
}

export function prismaLeadToFigmaLead(prismaLead: LeadWithRelations): FigmaLead {
  return pipelineLeadToFigmaLead(prismaLeadToPipelineLead(prismaLead));
}

// Constants
export const COLUMN_DEFS: ColumnDef[] = [
  { id: "name", label: "Name", icon: Sparkles, width: "min-w-[220px]" },
  { id: "phone", label: "Phone", icon: Phone, width: "min-w-[160px]" },
  { id: "location", label: "Location", icon: MapPin, width: "min-w-[140px]" },
  { id: "status", label: "Status", icon: MessageSquare, width: "min-w-[140px]" },
  { id: "rating", label: "Rating", icon: Star, width: "min-w-[120px]" },
  { id: "assignedTo", label: "Assigned To", icon: User, width: "min-w-[140px]" },
  { id: "sources", label: "Sources", icon: List, width: "min-w-[160px]" },
  { id: "lastContacted", label: "Last Contacted", icon: Calendar, width: "min-w-[160px]" },
  { id: "createdAt", label: "Created At", icon: Calendar, width: "min-w-[160px]" },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = [
  "name",
  "phone",
  "location",
  "status",
  "rating",
  "assignedTo",
  "sources",
  "lastContacted",
  "createdAt",
];

export async function checkResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Request failed");
  }
  return response;
}
