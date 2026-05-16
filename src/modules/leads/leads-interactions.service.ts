// SimpleCRM — leads-interactions.service.ts
import { prisma } from "@/lib/prisma";
import { logActivity } from "../activity/activity.service";

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

export async function listUnassignedLeads() {
  return prisma.lead.findMany({
    where: { assignedToId: null },
    orderBy: { createdAt: "desc" },
    include: { sources: { select: { source: true, form: { select: { name: true } } } } },
  });
}
