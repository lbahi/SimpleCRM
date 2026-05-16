// SimpleCRM — analytics-workspace.tsx
"use client";

import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend 
} from 'recharts';

interface LeadItem {
  id?: string;
  status?: string;
  source?: string | null;
  createdAt: string | Date;
  assignedTo?: string | null;
}

interface AnalyticsWorkspaceProps {
  leads: LeadItem[];
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
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AnalyticsWorkspace({ leads }: AnalyticsWorkspaceProps) {
  const statusData = [
    { name: 'New', value: leads.filter(l => l.status === 'NEW').length, color: '#3b82f6' },
    { name: 'Fresh', value: leads.filter(l => l.status === 'FRESH').length, color: '#10b981' },
    { name: 'Contacted', value: leads.filter(l => l.status === 'CONTACTED').length, color: '#a855f7' },
    { name: 'Qualified', value: leads.filter(l => l.status === 'QUALIFIED').length, color: '#f59e0b' },
    { name: 'Converted', value: leads.filter(l => l.status === 'CONVERTED').length, color: '#059669' },
  ];

  const nonZeroStatusData = statusData.filter(item => item.value > 0);

  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || 'Unknown';
    const existing = acc.find((s) => s.name === source);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: source, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const monthData = [
    { month: '2026-05', count: leads.filter(l => new Date(l.createdAt).getMonth() === 4).length },
  ];

  const teamMembers = Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))) as string[];
  const teamData = teamMembers.length > 0 ? teamMembers.map(member => ({
    name: member?.split(' ')[0] || 'Unassigned',
    total: leads.filter(l => l.assignedTo === member).length,
    converted: leads.filter(l => l.assignedTo === member && l.status === 'CONVERTED').length,
  })) : [
    { name: 'Sarah', total: 10, converted: 4 },
    { name: 'Mike', total: 15, converted: 7 },
    { name: 'Alex', total: 8, converted: 3 }
  ];

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
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
