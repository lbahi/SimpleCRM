import { prisma } from "@/lib/prisma";
import type {
  CreateLeadInput,
  UpdateLeadInput,
  AssignLeadInput,
  ListLeadsInput,
  ImportRowInput,
} from "./leads.schema";
import type {
  LeadListItem,
  LeadWithRelations,
  PaginatedLeads,
  ImportResult,
} from "./leads.types";
import { Prisma, ActivityAction } from "@prisma/client";
import { logActivity } from "../activity/activity.service";

// ─── Selects ─────────────────────────────────────────────────

const listSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
    select: { id: true, name: true, avatarInitials: true },
  },
  customData: true,
  rating: true,
  order: true,
  assignedToId: true,
  location: true,
  lastContacted: true,
  sources: {
    select: { source: true },
  },
  reminders: {
    where: { status: "PENDING" },
    orderBy: { dueAt: "asc" },
    take: 1,
  },
} satisfies Prisma.LeadSelect;

const detailSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
    select: { id: true, name: true, avatarInitials: true },
  },
  sources: {
    select: { source: true, form: { select: { name: true } } }
  },
  assignedToId: true,
  customData: true,
  notes: {
    include: {
      author: {
        select: { id: true, name: true, avatarInitials: true },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  reminders: {
    where: { status: "PENDING" },
    orderBy: { dueAt: "asc" },
  },
} satisfies Prisma.LeadSelect;

// ─── List ────────────────────────────────────────────────────

export async function listLeads(input: ListLeadsInput): Promise<PaginatedLeads> {
  const {
    page,
    limit,
    search,
    status,
    assignedToId,
    sortBy,
    sortDir,
    view,
    userId,
    role,
  } = input;

  // ── Role-scoping ───────────────────────────────────────────
  // team view: all assigned leads (member read-only tab)
  // member default: only their own leads
  // admin: no scope restriction (unassigned leads live in Inbox)
  const roleWhere: Prisma.LeadWhereInput =
    view === "team"
      ? { assignedToId: { not: null } }
      : role === "MEMBER" && userId
      ? { assignedToId: userId }
      : {};

  const where: Prisma.LeadWhereInput = {
    ...roleWhere,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status && { status: status as any }),
    ...(assignedToId && { assignedToId }),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: listSelect,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads: leads as unknown as LeadListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Get by ID ───────────────────────────────────────────────

export async function getLeadById(
  id: string
): Promise<LeadWithRelations | null> {
  return prisma.lead.findUnique({
    where: { id },
    select: detailSelect,
  }) as any;
}

// ─── Create ──────────────────────────────────────────────────

export async function createLead(
  input: CreateLeadInput,
  createdById: string
): Promise<LeadWithRelations> {
  console.log("[LeadsService] Creating lead:", JSON.stringify(input, null, 2));
  try {
    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        location: input.location || null,
        rating: input.rating || 0,
        assignedToId: input.assignedToId,
        status: (input.status as any) || "NEW",
        sources: input.sources && input.sources.length > 0
          ? {
              create: input.sources.map(source => ({
                source: source as any,
                formId: input.formId,
              })),
            }
          : undefined,
      },
      select: detailSelect,
    });
    console.log("[LeadsService] Lead created successfully:", lead.id);

    await logActivity({
      leadId: lead.id,
      action: "CREATED",
      toValue: `Lead created via ${input.source.toLowerCase()}`,
      actorId: createdById,
    });

    return lead as any;
  } catch (error) {
    console.error("[LeadsService] Error creating lead:", error);
    throw error;
  }
}

// ─── Update ──────────────────────────────────────────────────

export async function updateLead(
  id: string,
  input: UpdateLeadInput
): Promise<LeadWithRelations> {
  const oldLead = await prisma.lead.findUnique({ where: { id }, select: { status: true, rating: true } });

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.status !== undefined && { status: input.status as any }),
      ...(input.customData !== undefined && {
        customData:
          input.customData === null
            ? Prisma.JsonNull
            : (input.customData as Prisma.InputJsonValue),
      }),
    },
    select: detailSelect,
  });

  if (input.status && (oldLead?.status as any) !== input.status) {
    await logActivity({
      leadId: id,
      action: "STATUS_CHANGED",
      fromValue: oldLead?.status,
      toValue: input.status,
    });
  }

  if (input.rating !== undefined && oldLead?.rating !== input.rating) {
    await logActivity({
      leadId: id,
      action: "RATING_CHANGED",
      fromValue: oldLead?.rating?.toString(),
      toValue: input.rating.toString(),
    });
  }

  return lead as any;
}

// ─── Assign ──────────────────────────────────────────────────

export async function assignLead(
  id: string,
  input: AssignLeadInput
): Promise<LeadWithRelations> {
  const lead = await prisma.lead.update({
    where: { id },
    data: { assignedToId: input.assignedToId },
    select: detailSelect,
  });

  await logActivity({
    leadId: id,
    action: "ASSIGNED",
    toValue: input.assignedToId 
      ? `Assigned to ${lead.assignedTo?.name}`
      : "Lead unassigned",
  });

  return lead as any;
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteLead(id: string): Promise<void> {
  await prisma.lead.delete({ where: { id } });
}

// ─── CSV Import ──────────────────────────────────────────────

export async function importLeads(
  rows: ImportRowInput[],
  createdById: string
): Promise<ImportResult> {
  const result: ImportResult = {
    created: 0,
    merged: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Duplicate-phone merge: update existing instead of creating
      const existing = await prisma.lead.findFirst({
        where: { phone: row.phone },
      });

      if (existing) {
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            name: row.name,
            email: row.email || existing.email,
          },
        });
        result.merged++;
      } else {
        await prisma.lead.create({
          data: {
            name: row.name,
            phone: row.phone,
            email: row.email || null,
          },
        });
        result.created++;
      }
    } catch (err) {
      result.errors.push({
        row: i + 1,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return result;
}

// ─── Notes ───────────────────────────────────────────────────

export async function addNote(params: {
  leadId: string;
  authorId: string;
  content: string;
}) {
  const note = await prisma.note.create({
    data: {
      leadId: params.leadId,
      authorId: params.authorId,
      body: params.content,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarInitials: true },
      },
    },
  });

  await logActivity({
    leadId: params.leadId,
    action: "NOTE_ADDED",
    toValue: "New note added",
    actorId: params.authorId,
  });

  return note;
}

// ─── Inbox / Bulk Assign ─────────────────────────────────────

export async function listUnassignedLeads() {
  return prisma.lead.findMany({
    where: { assignedToId: null },
    orderBy: { createdAt: "desc" },
    include: { sources: { select: { source: true, form: { select: { name: true } } } } },
  });
}

export async function bulkAssignLeads(leadIds: string[], assignedToId: string, actorId: string) {
  const member = await prisma.user.findUnique({ where: { id: assignedToId } });
  const memberName = member?.name || "Member";

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { assignedToId },
    });

    await Promise.all(
      leadIds.map((leadId) =>
        tx.activityLog.create({
          data: {
            action: ActivityAction.ASSIGNED,
            toValue: `Assigned to ${memberName}`,
            leadId,
            actorId,
          },
        })
      )
    );

    return { count: updateResult.count };
  });
}
