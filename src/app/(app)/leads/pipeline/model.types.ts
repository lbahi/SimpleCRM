// SimpleCRM — model.types.ts
import { LeadStatus } from "@prisma/client";
import type { ComponentType } from "react";

export type SortDirection = "asc" | "desc";
export type GroupByField =
  | "status"
  | "rating"
  | "location"
  | "assignedTo"
  | "sources"
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
  customFields?: Record<string, unknown>;
};

export interface ColumnDef {
  id: ColumnId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  width: string;
}
