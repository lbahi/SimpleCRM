// SimpleCRM — analytics-workspace.tsx
"use client";

import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import type { AnalyticsData } from '@/modules/analytics/analytics.service';

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

interface TooltipPayloadItem {
  payload: {
    date: string;
    count: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  FRESH: "Fresh",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  NO_RESPOND: "No Respond",
  LOST: "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  FRESH: "#10b981",
  CONTACTED: "#a855f7",
  QUALIFIED: "#f59e0b",
  CONVERTED: "#059669",
  NO_RESPOND: "#6b7280",
  LOST: "#ef4444",
};

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
  const statusData = analytics.leadsByStatus.map(s => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#8884d8'
  }));

  const nonZeroStatusData = statusData.filter(item => item.value > 0);

  const sourceData = analytics.leadsBySource;

  const leadsOverTimeData = analytics.leadsOverTime;

  const byMember = analytics.teamPerformance;
  const hasMemberData = byMember.length > 0 && byMember.some(m => m.total > 0);

  const teamChartData = byMember.map(t => ({
    name: t.memberName?.split(' ')[0] || 'Unassigned',
    total: t.total,
    closed: t.closed,
  }));

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 font-normal text-neutral-900">Analytics & Reports</h1>
          <p className="text-gray-600">Deep dive into your sales performance and lead distribution.</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Leads by Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">Leads by Status</h2>
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
            <h2 className="text-lg mb-4 font-semibold">Leads by Source</h2>
            {sourceData.length === 0 ? (
              <div className="flex items-center justify-center h-[320px] text-sm text-neutral-400 font-medium">
                No source data yet
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
          {/* Leads Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">New leads — last 30 days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={leadsOverTimeData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#378ADD" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickFormatter={(dateStr, index) => 
                    index % 5 === 0 ? format(new Date(dateStr), "MMM d") : ""
                  }
                />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const { date, count } = (payload as unknown as TooltipPayloadItem[])[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-sm text-[13px]">
                        <span className="text-neutral-500">
                          {format(new Date(date), "MMM d, yyyy")}:
                        </span>
                        <span className="font-medium text-neutral-900 ml-1">
                          {count} {count === 1 ? "lead" : "leads"}
                        </span>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#378ADD" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">Team Performance</h2>
            {!hasMemberData ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-center">
                <Users size={40} className="text-neutral-300 mb-2" />
                <p className="text-sm font-medium text-neutral-600">No member data yet</p>
                <p className="text-xs text-neutral-400 mt-1">Assign leads to team members to see performance.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar name="Total Assigned" dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar name="Closed" dataKey="closed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team Performance Summary Table */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-neutral-900">Member Breakdown</h2>
            <p className="text-sm text-neutral-500 mt-1">Detailed performance metrics across all active team members.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50/75 border-b border-gray-100 text-neutral-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6 text-center">Total</th>
                  <th className="py-3.5 px-6 text-center">Open</th>
                  <th className="py-3.5 px-6 text-center">Closed</th>
                  <th className="py-3.5 px-6 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-neutral-700 font-medium">
                {byMember.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-400 text-sm">
                      No active team members found.
                    </td>
                  </tr>
                ) : (
                  byMember.map(member => {
                    const convColor = member.conversionRate > 30 
                      ? "text-green-600 font-semibold" 
                      : member.conversionRate < 10 
                      ? "text-red-500 font-semibold" 
                      : "text-neutral-700 font-medium";
                    return (
                      <tr key={member.memberId} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3.5 font-semibold text-neutral-900">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {member.avatarInitials || member.memberName[0]?.toUpperCase() || "?"}
                          </div>
                          {member.memberName}
                        </td>
                        <td className="py-4 px-6 text-center text-neutral-600">{member.total}</td>
                        <td className="py-4 px-6 text-center text-neutral-600">{member.open}</td>
                        <td className="py-4 px-6 text-center text-neutral-600">{member.closed}</td>
                        <td className={`py-4 px-6 text-right ${convColor}`}>
                          {member.conversionRate}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
