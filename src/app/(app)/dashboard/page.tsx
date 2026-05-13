// SimpleCRM — DashboardPage
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAnalytics } from "@/modules/analytics/analytics.service";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { LeadStatus } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const analytics = await getAnalytics(session.userId);
  const leads = analytics.recentLeads; // For the "Recent Leads" section

  // Calculations based on reference logic
  const totalLeads = analytics.totalLeads;
  const freshLeads = analytics.freshLeads;
  const closedLeads = analytics.closedLeads;
  const conversionRate = analytics.conversionRate.toFixed(1);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 font-normal text-neutral-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back. Here's what's happening with your leads today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Leads</span>
              <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                <TrendingUp size={14} />
                +12%
              </span>
            </div>
            <div className="text-3xl mb-1 font-semibold">{totalLeads}</div>
            <div className="text-xs text-gray-500">vs last month</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Fresh Leads</span>
              <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                <TrendingUp size={14} />
                +8%
              </span>
            </div>
            <div className="text-3xl mb-1 font-semibold">{freshLeads}</div>
            <div className="text-xs text-gray-500">Awaiting contact</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Closed Leads</span>
              <span className="text-sm text-red-600 flex items-center gap-1 font-medium">
                <TrendingDown size={14} />
                -5%
              </span>
            </div>
            <div className="text-3xl mb-1 font-semibold">{closedLeads}</div>
            <div className="text-xs text-gray-500">Deals won</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                <TrendingUp size={14} />
                +2%
              </span>
            </div>
            <div className="text-3xl mb-1 font-semibold">{conversionRate}%</div>
            <div className="text-xs text-gray-500">Lead to customer</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Lead Activity */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg mb-4 font-semibold">Lead Activity</h2>
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Activity Chart coming soon</p>
                <p className="text-xs mt-1">We're building a powerful visualization for your data.</p>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Leads</h2>
              <button className="text-sm text-gray-600 hover:text-black font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {leads.map((lead) => {
                const initials = lead.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);

                return (
                  <div key={lead.id} className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate font-medium text-neutral-900">{lead.name}</div>
                      <div className="text-xs text-gray-500">{format(new Date(lead.createdAt), "MMM d, yyyy")}</div>
                    </div>
                    <div className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                      {lead.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

