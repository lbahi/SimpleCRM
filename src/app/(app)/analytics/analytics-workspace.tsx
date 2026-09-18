// SimpleCRM — analytics-workspace.tsx
"use client";

import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users } from 'lucide-react';
import { useTranslations } from "next-intl";
import type { AnalyticsData } from '@/modules/analytics/analytics.service';
import { AnalyticsDateRangePicker } from "./components/analytics-date-range-picker";
import { LeadsTrendChart, STATUS_COLORS } from "./components/leads-trend-chart";
import { MemberBreakdownTable } from "./components/member-breakdown-table";

interface AnalyticsWorkspaceProps {
  analytics: AnalyticsData;
}

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name
}: PieLabelProps) => {
  if (
    percent === undefined || percent < 0.05 ||
    cx === undefined || cy === undefined ||
    midAngle === undefined ||
    innerRadius === undefined || outerRadius === undefined ||
    !name
  ) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={500}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AnalyticsWorkspace({ analytics }: AnalyticsWorkspaceProps) {
  const t = useTranslations("analytics");
  const status = useTranslations("status");
  const common = useTranslations("common");

  const statusData = analytics.leadsByStatus.map(s => ({
    name: status.has(s.status) ? status(s.status) : s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#8884d8'
  }));

  const nonZeroStatusData = statusData.filter(item => item.value > 0);
  const sourceData = analytics.leadsBySource;
  const byMember = analytics.teamPerformance;
  const hasMemberData = byMember.length > 0 && byMember.some(m => m.total > 0);

  const teamChartData = byMember.map(t => ({
    name: t.memberName?.split(' ')[0] || common("unassigned"),
    total: t.total,
    closed: t.closed,
  }));

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2 font-normal text-neutral-900">{t("title")}</h1>
            <p className="text-gray-600">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <AnalyticsDateRangePicker />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Leads by Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">{t("leadsByStatus")}</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={nonZeroStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nonZeroStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  content={() => (
                    <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 pt-4">
                      {statusData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                          <span>{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Source */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">{t("leadsBySource")}</h2>
            {sourceData.length === 0 ? (
              <div className="flex items-center justify-center h-[320px] text-sm text-neutral-400 font-medium">
                {t("noSourceData")}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Leads Over Time by Status */}
          <LeadsTrendChart data={analytics.leadsOverTime} />

          {/* Team Performance Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">{t("teamPerformance")}</h2>
            {!hasMemberData ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-center">
                <Users size={40} className="text-neutral-300 mb-2" />
                <p className="text-sm font-medium text-neutral-600">{t("noMemberData")}</p>
                <p className="text-xs text-neutral-400 mt-1">{t("assignForPerformance")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar name={t("totalAssigned")} dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar name={t("closed")} dataKey="closed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team Performance Summary Table */}
        <MemberBreakdownTable byMember={byMember} />
      </div>
    </div>
  );
}
