// SimpleCRM — leads-bulk.service.ts
import { prisma } from "@/lib/prisma";
import { ActivityAction, Prisma } from "@prisma/client";
import type { ImportResult } from "./leads.types";
import type { ImportRowInput } from "./leads.schema";

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
