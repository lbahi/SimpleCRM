// SimpleCRM — leads-mutations.service.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logActivity } from "../activity/activity.service";
import type { UpdateLeadInput, AssignLeadInput } from "./leads.schema";
import type { LeadWithRelations } from "./leads.types";

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
  customFields: true,
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

export async function updateLead(
  id: string,
  input: UpdateLeadInput
): Promise<LeadWithRelations> {
  const oldLead = await prisma.lead.findUnique({ where: { id }, select: { status: true, rating: true } });

  const updateData: Prisma.LeadUpdateInput = {
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
    ...(input.customFields !== undefined && {
      customFields:
        input.customFields === null
          ? Prisma.JsonNull
          : (input.customFields as Prisma.InputJsonValue),
    }),
    ...(input.lastContacted !== undefined && { 
      lastContacted: input.lastContacted ? new Date(input.lastContacted) : null 
    }),
  };

  const lead = await prisma.$transaction(async (tx) => {
    if (input.sources !== undefined) {
      await tx.leadSource.deleteMany({ where: { leadId: id } });
      if (input.sources.length > 0) {
        await tx.leadSource.createMany({
          data: input.sources.map(s => ({
            leadId: id,
            source: s,
          }))
        });
      }
    }

    return tx.lead.update({
      where: { id },
      data: updateData,
      select: detailSelect,
    });
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

export async function deleteLead(id: string): Promise<void> {
  await prisma.lead.delete({ where: { id } });
}
