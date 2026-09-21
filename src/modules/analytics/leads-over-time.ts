// SimpleCRM — leads-over-time.ts
import { prisma } from "@/lib/prisma";
import { subDays, format, addDays } from "date-fns";
import { ActivityAction } from "@prisma/client";
import type { DateRange } from "./analytics.service";

export type LeadOverTimeEntry = {
  date: string;
  count: number;
  NEW: number;
  CONTACTED: number;
  NO_RESPOND: number;
  CONVERTED: number;
  LOST: number;
};

type StatusCountMap = Omit<LeadOverTimeEntry, "date">;

const createZeroEntry = (): StatusCountMap => ({
  count: 0,
  NEW: 0,
  CONTACTED: 0,
  NO_RESPOND: 0,
  CONVERTED: 0,
  LOST: 0,
});

export async function getLeadsOverTime(
  range?: DateRange,
  whereScope: { assignedToId?: string } = {}
): Promise<LeadOverTimeEntry[]> {
  const now = new Date();
  const from = range?.from;
  const to = range?.to;
  const thirtyDaysAgo = subDays(now, 30);

  const statusChanges = await prisma.activityLog.findMany({
    where: {
      action: ActivityAction.STATUS_CHANGED,
      ...(from && to
        ? { createdAt: { gte: from, lte: to } }
        : { createdAt: { gte: thirtyDaysAgo } }),
      ...(whereScope.assignedToId
        ? { lead: { assignedToId: whereScope.assignedToId } }
        : {}),
    },
    select: { createdAt: true, toValue: true },
    orderBy: { createdAt: "asc" },
  });

  const countByDate = new Map<string, StatusCountMap>();

  if (from && to) {
    let current = new Date(from);
    const end = new Date(to);
    while (current <= end) {
      countByDate.set(format(current, "yyyy-MM-dd"), createZeroEntry());
      current = addDays(current, 1);
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(now, i), "yyyy-MM-dd");
      countByDate.set(date, createZeroEntry());
    }
  }

  statusChanges.forEach((log) => {
    const date = format(new Date(log.createdAt), "yyyy-MM-dd");
    const status = log.toValue;
    let entry = countByDate.get(date);
    if (!entry) {
      entry = createZeroEntry();
      countByDate.set(date, entry);
    }
    entry.count += 1;
    if (status && status in entry) {
      entry[status as keyof Omit<StatusCountMap, "count">] += 1;
    }
  });

  return Array.from(countByDate.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}
