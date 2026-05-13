// SimpleCRM — model.ts
import type { ComponentType } from "react";
import {
  Calendar,
  Phone,
  Sparkles,
  User,
  Star,
  MapPin,
  List,
  MessageSquare
} from "lucide-react";
import { LeadListItem, LeadWithRelations } from "@/modules/leads/leads.types";
import { LeadStatus } from "@prisma/client";
import type { Lead as PrismaLead } from "@prisma/client";

export type SortDirection = "asc" | "desc";
export type GroupByField =
  | "status"
  | "rating"
  | "location"
  | null;

export type ColumnId =
  | "name"
  | "phone"
  | "location"
  | "status"
  | "rating"
  | "assignedTo"
  | "sources"
  | "lastContacted"
  | "createdAt"
  | "notePreview";

export type PipelineLead = {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  status: LeadStatus;
  rating: number | null;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; avatarInitials: string } | null;
  sources: { source: string }[];
  lastContacted: Date | null;
  createdAt: Date;
  reminders: { id: string; dueAt: Date; status: string }[];
  notes: { body: string }[];
  order: number;
  updatedAt: Date;
};

// Figma-compatible Lead type (from reference/types.ts)
export type FigmaLead = {
  id: string;
  name: string;
  phone: string;
  location: string;
  assignedTo: string;
  status: LeadStatus;
  rating: number;
  sources: string[];
  lastContacted: Date | null;
  createdAt: Date;
  manualOrder?: number;
  customFields?: Record<string, any>;
};

// Adapter: Convert Prisma Lead to PipelineLead
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
    order: prismaLead.order,
    updatedAt: prismaLead.updatedAt,
  };
}

// Adapter: Convert PipelineLead to Figma-compatible Lead
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

// Adapter: Convert Prisma Lead to Figma-compatible Lead
export function prismaLeadToFigmaLead(prismaLead: LeadWithRelations): FigmaLead {
  const pipelineLead = prismaLeadToPipelineLead(prismaLead);
  return pipelineLeadToFigmaLead(pipelineLead);
}

export const COLUMN_DEFS: {
  id: ColumnId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  width: string;
}[] = [
  { id: "name", label: "Name", icon: Sparkles, width: "min-w-[220px]" },
  { id: "phone", label: "Phone", icon: Phone, width: "min-w-[160px]" },
  { id: "location", label: "Location", icon: MapPin, width: "min-w-[140px]" },
  { id: "status", label: "Status", icon: MessageSquare, width: "min-w-[140px]" },
  { id: "rating", label: "Rating", icon: Star, width: "min-w-[120px]" },
  { id: "assignedTo", label: "Assigned To", icon: User, width: "min-w-[140px]" },
  { id: "sources", label: "Sources", icon: List, width: "min-w-[160px]" },
  { id: "lastContacted", label: "Last Contacted", icon: Calendar, width: "min-w-[160px]" },
  { id: "createdAt", label: "Created At", icon: Calendar, width: "min-w-[160px]" },
  { id: "notePreview", label: "Note Preview", icon: MessageSquare, width: "min-w-[200px]" },
];

export const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = [
  "name",
  "status",
  "assignedTo",
  "rating",
  "phone",
  "location",
  "lastContacted",
  "createdAt",
];

export function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return "";
}

export function formatDateTime(value: unknown): string {
  const text = valueToString(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function getFieldValue(lead: PipelineLead, column: ColumnId): unknown {
  switch (column) {
    case "name":
      return lead.name;
    case "phone":
      return lead.phone;
    case "location":
      return lead.location;
    case "status":
      return lead.status;
    case "rating":
      return lead.rating;
    case "assignedTo":
      return lead.assignedTo?.name ?? "";
    case "sources":
      return lead.sources;
    case "lastContacted":
      return lead.lastContacted;
    case "createdAt":
      return lead.createdAt;
    case "notePreview":
      return lead.notes?.[0]?.body ?? "";
    default:
      return "";
  }
}

export function getGroupLabel(lead: PipelineLead, groupBy: GroupByField): string {
  if (!groupBy) return "All";
  const value = getFieldValue(lead, groupBy as ColumnId);
  return valueToString(value) || "Unspecified";
}

export function checkResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    return response
      .json()
      .catch(() => null)
      .then((payload) => {
        throw new Error(payload?.error || "Request failed");
      });
  }
  return Promise.resolve(response);
}

export function applyFieldChange(lead: PipelineLead, column: ColumnId, value: unknown): PipelineLead {
  switch (column) {
    case "name":
      return { ...lead, name: value as string };
    case "phone":
      return { ...lead, phone: value as string };
    case "location":
      return { ...lead, location: value as string };
    case "status":
      return { ...lead, status: value as LeadStatus };
    case "rating":
      return { ...lead, rating: value as number | null };
    default:
      return lead;
  }
}

export function matchesText(value: unknown, query: string): boolean {
  if (!query) return true;
  const text = valueToString(value).toLowerCase();
  return text.includes(query.toLowerCase());
}

export function compareValues(a: unknown, b: unknown, direction: "asc" | "desc"): number {
  const valA = valueToString(a).toLowerCase();
  const valB = valueToString(b).toLowerCase();
  if (valA === valB) return 0;
  const result = valA < valB ? -1 : 1;
  return direction === "asc" ? result : -result;
}
