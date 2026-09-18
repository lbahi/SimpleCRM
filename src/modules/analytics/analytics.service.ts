// SimpleCRM — analytics.service.ts
import { prisma } from "@/lib/prisma";
import { ReminderStatus, LeadStatus } from "@prisma/client";
import { getLeadsOverTime, type LeadOverTimeEntry } from "./leads-over-time";

const SOURCE_LABELS: Record<string, string> = {
  FACEBOOK_AD: "Facebook Ad",
  INSTAGRAM: "Instagram",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_OUTREACH: "Cold Outreach",
  WALK_IN: "Walk-in",
  MANUAL: "Manual",
  OTHER: "Other",
};

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface MemberStat {
  memberId: string;
  memberName: string;
  avatarInitials: string;
  total: number;
  open: number;
  closed: number;
  conversionRate: number;
  statusCounts: Record<LeadStatus, number>;
}

export interface AnalyticsData {
  totalLeads: number;
  freshLeads: number;
  closedLeads: number;
  conversionRate: number;
  recentLeads: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  overdueRemindersCount: number;
  leadsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
    label: string;
  }>;
  leadsOverTime: LeadOverTimeEntry[];
  teamPerformance: MemberStat[];
}

export async function getAnalytics(
  userId: string,
  role: string,
  range?: DateRange
): Promise<AnalyticsData> {
  const now = new Date();
  const whereScope = role === "MEMBER" ? { assignedToId: userId } : {};

  const from = range?.from;
  const to = range?.to;
  const dateFilter = from && to ? { createdAt: { gte: from, lte: to } } : {};

  const [totalLeads, freshLeads, closedLeads] = await Promise.all([
    prisma.lead.count({ where: { ...whereScope, ...dateFilter } }),
    role === "MEMBER" ? 0 : prisma.lead.count({ where: { assignedToId: null, ...dateFilter } }),
    prisma.lead.count({ where: { ...whereScope, status: LeadStatus.CONVERTED, ...dateFilter } }),
  ]);

  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    where: whereScope,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, status: true, createdAt: true, updatedAt: true },
  });

  const overdueRemindersCount = await prisma.reminder.count({
    where: {
      status: ReminderStatus.PENDING,
      dueAt: { lt: now },
      ...(userId && { createdById: userId }),
    },
  });

  const leadsByStatusRaw = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true },
    where: from && to ? { createdAt: { gte: from, lte: to } } : undefined,
  });

  const leadsByStatus = leadsByStatusRaw.map((item) => ({
    status: item.status,
    count: item._count.status,
    percentage: totalLeads > 0 ? (item._count.status / totalLeads) * 100 : 0,
  }));

  const bySource = await prisma.leadSource.groupBy({
    by: ["source"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    where: from && to ? { createdAt: { gte: from, lte: to } } : undefined,
  });

  const leadsBySource = bySource
    .filter((item) => item._count.id > 0)
    .map((item) => ({
      source: item.source,
      count: item._count.id,
      label: SOURCE_LABELS[item.source] ?? item.source,
      percentage: totalLeads > 0 ? (item._count.id / totalLeads) * 100 : 0,
    }));

  const leadsOverTime = await getLeadsOverTime(range, whereScope);

  const [members, statusGroupBy] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MEMBER", isActive: true },
      select: {
        id: true,
        name: true,
        avatarInitials: true,
        assignedLeads: {
          where: from && to ? { createdAt: { gte: from, lte: to } } : undefined,
          select: { status: true },
        },
      },
    }),
    prisma.lead.groupBy({
      by: ["assignedToId", "status"],
      where: {
        assignedToId: { not: null },
        ...(from && to ? { createdAt: { gte: from, lte: to } } : {}),
      },
      _count: { status: true },
    }),
  ]);

  const statusCountMap = new Map<string, number>();
  for (const item of statusGroupBy) {
    if (item.assignedToId) {
      statusCountMap.set(`${item.assignedToId}:${item.status}`, item._count.status);
    }
  }

  const byMember: MemberStat[] = members
    .map((member) => {
      const statusCounts: Record<LeadStatus, number> = {
        [LeadStatus.NEW]: statusCountMap.get(`${member.id}:${LeadStatus.NEW}`) ?? 0,
        [LeadStatus.CONTACTED]: statusCountMap.get(`${member.id}:${LeadStatus.CONTACTED}`) ?? 0,
        [LeadStatus.NO_RESPOND]: statusCountMap.get(`${member.id}:${LeadStatus.NO_RESPOND}`) ?? 0,
        [LeadStatus.CONVERTED]: statusCountMap.get(`${member.id}:${LeadStatus.CONVERTED}`) ?? 0,
        [LeadStatus.LOST]: statusCountMap.get(`${member.id}:${LeadStatus.LOST}`) ?? 0,
      };

      const total = Object.values(statusCounts).reduce((acc, count) => acc + count, 0);
      const closed = statusCounts[LeadStatus.CONVERTED];
      const open = total - closed;
      const conversionRate = total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0;

      return {
        memberId: member.id,
        memberName: member.name,
        avatarInitials: member.avatarInitials,
        total,
        open,
        closed,
        conversionRate,
        statusCounts,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    totalLeads,
    freshLeads,
    closedLeads,
    conversionRate,
    recentLeads,
    overdueRemindersCount,
    leadsByStatus,
    leadsBySource,
    leadsOverTime,
    teamPerformance: byMember,
  };
}
