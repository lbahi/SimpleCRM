// SimpleCRM — analytics-workspace.tsx
"use client";

import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend 
} from 'recharts';
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
      {`${name}: ${(percent * 100).toFixed(0)}%`}
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

  const monthData = analytics.leadsByMonth;

  const teamData = analytics.teamPerformance.map(t => ({
    name: t.memberName?.split(' ')[0] || 'Unassigned',
    total: t.leadsAssigned,
    converted: t.leadsClosed,
  }));

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8">
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
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Leads by Month */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">Leads by Month</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">Team Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
