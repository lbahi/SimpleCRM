// SimpleCRM — model.utils.ts
import { LeadStatus } from "@prisma/client";
import { PipelineLead, ColumnId } from "./model.types";

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
    case "assignedTo": {
      const val = value as { id: string; name: string; avatarInitials: string } | null;
      return { 
        ...lead, 
        assignedToId: val?.id ?? null,
        assignedTo: val
      };
    }
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
