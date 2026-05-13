import type { Lead, User, Reminder, ReminderStatus, LeadStatus } from "@prisma/client";

/** Lead with assignee info — used in list view */
export type LeadListItem = Pick<
  Lead,
  | "id"
  | "name"
  | "phone"
  | "email"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "customData"
  | "rating"
  | "order"
  | "assignedToId"
  | "location"
  | "lastContacted"
> & {
  assignedTo: Pick<User, "id" | "name" | "avatarInitials"> | null;
  sources: { source: string }[];
  reminders: {
    id: string;
    dueAt: Date;
    status: ReminderStatus;
  }[];
};

/** Full lead with relations — used in detail view */
export type LeadWithRelations = Lead & {
  assignedTo: Pick<User, "id" | "name" | "avatarInitials"> | null;
  notes: {
    id: string;
    body: string;
    createdAt: Date;
    author: Pick<User, "id" | "name" | "avatarInitials">;
  }[];
  reminders: Reminder[];
  sources: { source: string; form?: { name: string } | null }[];
};

/** Paginated list response */
export interface PaginatedLeads {
  leads: LeadListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** CSV import result */
export interface ImportResult {
  created: number;
  merged: number;
  skipped: number;
  errors: { row: number; message: string }[];
}
