// SimpleCRM — leads.service.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logActivity } from "../activity/activity.service";
import type { CreateLeadInput, ListLeadsInput } from "./leads.schema";
import type { LeadListItem, LeadWithRelations, PaginatedLeads } from "./leads.types";

const listSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, name: true, avatarInitials: true } },
  customData: true,
  customFields: true,
  rating: true,
  order: true,
  assignedToId: true,
  location: true,
  lastContacted: true,
  sources: { select: { source: true } },
  reminders: { where: { status: "PENDING" }, orderBy: { dueAt: "asc" }, take: 1 },
} satisfies Prisma.LeadSelect;

const detailSelect = {
  ...listSelect,
  sources: { select: { source: true, form: { select: { name: true } } } },
  notes: {
    include: { author: { select: { id: true, name: true, avatarInitials: true } } },
    orderBy: { createdAt: "desc" },
  },
  reminders: { where: { status: "PENDING" }, orderBy: { dueAt: "asc" } },
} satisfies Prisma.LeadSelect;

export async function listLeads(input: ListLeadsInput): Promise<PaginatedLeads> {
  const { page, limit, search, status, assignedToId, sortBy, sortDir, view, userId, role } = input;
  const roleWhere: Prisma.LeadWhereInput = view === "team" ? { assignedToId: { not: null } } : role === "MEMBER" && userId ? { assignedToId: userId } : {};
  const where: Prisma.LeadWhereInput = {
    ...roleWhere,
    ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { email: { contains: search, mode: "insensitive" } }] }),
    ...(status && { status: status as any }),
    ...(assignedToId && { assignedToId }),
  };
  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where, select: listSelect, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * limit, take: limit }),
    prisma.lead.count({ where }),
  ]);
  return { leads: leads as any, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLeadById(id: string): Promise<LeadWithRelations | null> {
  return prisma.lead.findUnique({ where: { id }, select: detailSelect }) as any;
}

export async function createLead(input: CreateLeadInput, createdById: string): Promise<LeadWithRelations> {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      location: input.location || null,
      rating: input.rating || 0,
      assignedToId: input.assignedToId,
      status: (input.status as any) || "NEW",
      sources: input.sources && input.sources.length > 0 ? { create: input.sources.map(s => ({ source: s as any, formId: input.formId })) } : undefined,
    },
    select: detailSelect,
  });
  await logActivity({ leadId: lead.id, action: "CREATED", toValue: `Lead created via ${input.source?.toLowerCase() || "manual"}`, actorId: createdById });
  return lead as any;
}
