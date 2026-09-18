import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CLOSED_STATUSES: LeadStatus[] = [LeadStatus.CONVERTED, LeadStatus.LOST];
export async function deleteMember(id: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true, deletedAt: true },
  });

  if (!user) throw new Error("Member not found");
  if (user.isActive) throw new Error("Deactivate this member before deleting.");
  if (user.deletedAt) throw new Error("Already deleted");

  const openLeadCount = await prisma.lead.count({
    where: { assignedToId: id, status: { notIn: CLOSED_STATUSES } },
  });
  if (openLeadCount > 0) {
    throw new Error("Reassign or return all open leads before deleting.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        name: "Deleted Member",
        email: `deleted-${id}@deleted.simplecrm.local`,
        passwordHash: bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 12),
        avatarInitials: "DM",
        deletedAt: new Date(),
      },
    });
  });
}

