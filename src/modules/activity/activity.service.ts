import { prisma } from "@/lib/prisma";
import type { ActivityAction } from "@prisma/client";

export async function logActivity(params: {
  leadId: string;
  action: ActivityAction;
  fromValue?: string;
  toValue?: string;
  actorId?: string;
}) {
  // If no actorId is provided, we assign it to the first Admin (for system actions like public forms)
  let finalActorId = params.actorId;
  if (!finalActorId) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return; // Cannot log without an actor
    finalActorId = admin.id;
  }

  return prisma.activityLog.create({
    data: {
      leadId: params.leadId,
      action: params.action,
      fromValue: params.fromValue,
      toValue: params.toValue,
      actorId: finalActorId,
    },
  });
}

export async function getLeadTimeline(leadId: string) {
  return prisma.activityLog.findMany({
    where: { leadId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          avatarInitials: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
