// SimpleCRM — reminders.service.ts
import { prisma } from "@/lib/prisma";
import { ActivityAction, ReminderStatus } from "@prisma/client";
import type { ReminderWithLead } from "./reminders.types";

type UserRole = "ADMIN" | "MEMBER";

export async function listReminders(
  userId: string,
  role: UserRole
): Promise<ReminderWithLead[]> {
  const where = {
    status: ReminderStatus.PENDING,
    ...(role !== "ADMIN" && { createdById: userId }),
  };

  return prisma.reminder.findMany({
    where,
    include: {
      lead: { select: { id: true, name: true, phone: true, status: true } },
      createdBy: { select: { id: true, name: true, avatarInitials: true } },
    },
    orderBy: { dueAt: "asc" },
  }) as Promise<ReminderWithLead[]>;
}

export async function countOverdueReminders(
  userId: string,
  role: UserRole
): Promise<number> {
  return prisma.reminder.count({
    where: {
      status: ReminderStatus.PENDING,
      dueAt: { lt: new Date() },
      ...(role !== "ADMIN" && { createdById: userId }),
    },
  });
}

/** @deprecated use countOverdueReminders. Kept for backward compat with count route. */
export async function listOverdueReminders(userId: string, role: UserRole) {
  return prisma.reminder.findMany({
    where: {
      status: ReminderStatus.PENDING,
      dueAt: { lt: new Date() },
      ...(role !== "ADMIN" && { createdById: userId }),
    },
    include: {
      lead: { select: { id: true, name: true, phone: true, status: true } },
      createdBy: { select: { id: true, name: true, avatarInitials: true } },
    },
    orderBy: { dueAt: "asc" },
  });
}

export async function dismissReminder(id: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const reminder = await tx.reminder.update({
      where: { id },
      data: { status: ReminderStatus.DISMISSED },
    });

    if (reminder.leadId) {
      await tx.activityLog.create({
        data: {
          action: ActivityAction.REMINDER_DISMISSED,
          leadId: reminder.leadId,
          actorId,
        },
      });
    }

    return reminder;
  });
}

export async function rescheduleReminder(
  id: string,
  dueAt: Date,
  note: string | undefined,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const old = await tx.reminder.update({
      where: { id },
      data: { status: ReminderStatus.RESCHEDULED },
    });

    const next = await tx.reminder.create({
      data: {
        leadId: old.leadId,
        dueAt,
        note: note ?? old.note,
        status: ReminderStatus.PENDING,
        createdById: actorId,
      },
    });

    if (old.leadId) {
      await tx.activityLog.create({
        data: {
          action: ActivityAction.REMINDER_SET,
          toValue: dueAt.toLocaleString(),
          leadId: old.leadId,
          actorId,
        },
      });
    }

    return next;
  });
}
