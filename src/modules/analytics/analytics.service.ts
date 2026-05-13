import { prisma } from "@/lib/prisma";
import { ReminderStatus, LeadStatus } from "@prisma/client";

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
  }>;
  leadsByMonth: Array<{
    month: string;
    count: number;
  }>;
  teamPerformance: Array<{
    memberName: string;
    leadsAssigned: number;
    leadsClosed: number;
    conversionRate: number;
  }>;
}

export async function getAnalytics(userId?: string): Promise<AnalyticsData> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get basic lead counts
  const [totalLeads, freshLeads, closedLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { assignedToId: null } }),
    prisma.lead.count({ where: { status: LeadStatus.CONVERTED } })
  ]);

  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  // Get recent leads (last 5)
  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true
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
  const leadsBySourceRaw = await prisma.leadSource.groupBy({
    by: ["source"],
    _count: { source: true }
  });

  const leadsBySource = leadsBySourceRaw.map(item => ({
    source: item.source,
    count: item._count.source,
    percentage: totalLeads > 0 ? (item._count.source / totalLeads) * 100 : 0
  }));

  // Get leads by month (last 6 months)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const leadsByMonthRaw = await prisma.lead.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo
      }
    },
    select: {
      createdAt: true
    }
  });

  // Group by month manually
  const leadsByMonthMap = new Map<string, number>();
  leadsByMonthRaw.forEach(lead => {
    const monthKey = new Date(lead.createdAt).toISOString().slice(0, 7); // YYYY-MM format
    leadsByMonthMap.set(monthKey, (leadsByMonthMap.get(monthKey) || 0) + 1);
  });

  const leadsByMonth = Array.from(leadsByMonthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Get team performance
  const teamPerformanceRaw = await prisma.user.findMany({
    where: { role: "MEMBER" },
    include: {
      assignedLeads: {
        select: { status: true }
      }
    }
  });

  const teamPerformanceData = teamPerformanceRaw.map(member => {
    const leadsAssigned = member.assignedLeads.length;
    const leadsClosed = member.assignedLeads.filter(lead => lead.status === LeadStatus.CONVERTED).length;
    const conversionRate = leadsAssigned > 0 ? (leadsClosed / leadsAssigned) * 100 : 0;

    return {
      memberName: member.name,
      leadsAssigned,
      leadsClosed,
      conversionRate
    };
  });

  return {
    totalLeads,
    freshLeads,
    closedLeads,
    conversionRate,
    recentLeads,
    overdueRemindersCount,
    leadsByStatus,
    leadsBySource,
    leadsByMonth,
    teamPerformance: teamPerformanceData
  };
}
