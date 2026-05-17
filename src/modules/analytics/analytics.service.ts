// SimpleCRM — analytics.service.ts
import { prisma } from "@/lib/prisma";
import { ReminderStatus, LeadStatus } from "@prisma/client";
import { subDays, format } from "date-fns";

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

export interface MemberStat {
  memberId: string;
  memberName: string;
  avatarInitials: string;
  total: number;
  open: number;
  closed: number;
  conversionRate: number;
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
  leadsOverTime: Array<{
    date: string;
    count: number;
  }>;
  teamPerformance: MemberStat[];
}

export async function getAnalytics(userId: string, role: string): Promise<AnalyticsData> {
  const now = new Date();

  // Role-based where clause
  const whereScope = role === "MEMBER" ? { assignedToId: userId } : {};

  // Get basic lead counts
  const [totalLeads, freshLeads, closedLeads] = await Promise.all([
    prisma.lead.count({ where: whereScope }),
    role === "MEMBER" ? 0 : prisma.lead.count({ where: { assignedToId: null } }),
    prisma.lead.count({ where: { ...whereScope, status: LeadStatus.CONVERTED } })
  ]);

  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  // Get recent leads (last 5)
  const recentLeads = await prisma.lead.findMany({
    take: 5,
    where: whereScope,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  // Get overdue reminders for current user
  const overdueRemindersCount = await prisma.reminder.count({
    where: {
      status: ReminderStatus.PENDING,
      dueAt: { lt: now },
      ...(userId && { createdById: userId })
    }
  });

  // Get leads by status
  const leadsByStatusRaw = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true }
  });

  const leadsByStatus = leadsByStatusRaw.map(item => ({
    status: item.status,
    count: item._count.status,
    percentage: totalLeads > 0 ? (item._count.status / totalLeads) * 100 : 0
  }));

  // Get leads by source
  const bySource = await prisma.leadSource.groupBy({
    by: ["source"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } }
  });

  const leadsBySource = bySource
    .filter(item => item._count.id > 0)
    .map(item => ({
      source: item.source,
      count: item._count.id,
      label: SOURCE_LABELS[item.source] ?? item.source,
      percentage: totalLeads > 0 ? (item._count.id / totalLeads) * 100 : 0
    }));

  // Get all leads created in the last 30 days
  const thirtyDaysAgo = subDays(now, 30);
  
  const recentLeadsForTime = await prisma.lead.findMany({
    where: { ...whereScope, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  // Build a map of date → count
  const countByDate = new Map<string, number>();
  
  // Initialize all 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(now, i), "yyyy-MM-dd");
    countByDate.set(date, 0);
  }
  
  // Fill in actual counts
  recentLeadsForTime.forEach(lead => {
    const date = format(new Date(lead.createdAt), "yyyy-MM-dd");
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  });
  
  // Convert to array
  const leadsOverTime = Array.from(countByDate.entries())
    .map(([date, count]) => ({ date, count }));

  // Get team performance
  const members = await prisma.user.findMany({
    where: { role: "MEMBER", isActive: true },
    select: {
      id: true,
      name: true,
      avatarInitials: true,
      assignedLeads: {
        select: { status: true }
      }
    }
  });

  const byMember: MemberStat[] = members.map(member => {
    const total = member.assignedLeads.length;
    const closed = member.assignedLeads.filter(
      l => l.status === "CONVERTED" || (l.status as string) === "CLOSED"
    ).length;
    const open = total - closed;
    const conversionRate = total > 0
      ? Number(((closed / total) * 100).toFixed(1))
      : 0;

    return {
      memberId: member.id,
      memberName: member.name,
      avatarInitials: member.avatarInitials,
      total,
      open,
      closed,
      conversionRate,
    };
  }).sort((a, b) => b.total - a.total);

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
    teamPerformance: byMember
  };
}
