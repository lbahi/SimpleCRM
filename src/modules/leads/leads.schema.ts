import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────

export const LeadStatus = z.enum([
  "NEW",
  "NO_RESPOND",
  "CONTACTED",
  "CONVERTED",
  "LOST",
]);


// ─── Create ──────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  phone: z.string().min(1, "Phone is required").max(30),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  rating: z.number().int().min(0).max(5).default(0),
  sources: z.array(z.string().max(50)).max(10).default([]),
  source: z.string().default("Website"),
  notes: z.string().max(2000).optional(),
  assignedToId: z.string().optional(),
  formId: z.string().optional(),
  status: LeadStatus.default("NEW"),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

// ─── Update ──────────────────────────────────────────────────

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  phone: z.string().min(1).max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  status: LeadStatus.optional(),
  sources: z.array(z.string().max(50)).max(10).optional(),
  customData: z.record(z.string(), z.unknown()).nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  lastContacted: z.string().datetime().optional(),
});

// ─── Assign ──────────────────────────────────────────────────

export const assignLeadSchema = z.object({
  assignedToId: z.string().nullable(),
});

export const bulkAssignSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1),
  assignedToId: z.string().cuid(),
});

// ─── List / Filter ───────────────────────────────────────────

export const listLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: LeadStatus.optional(),
  assignedToId: z.string().optional(),
  source: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "name", "status", "updatedAt"])
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  // Role-scoping — passed by server, not exposed to client
  view: z.enum(["default", "team"]).optional(),
  userId: z.string().optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

// ─── CSV Import row ──────────────────────────────────────────

export const importRowSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")).or(z.undefined()),
  notes: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type ListLeadsInput = z.infer<typeof listLeadsSchema>;
export type ImportRowInput = z.infer<typeof importRowSchema>;
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
