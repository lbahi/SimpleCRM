// SimpleCRM — DashboardPage
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAnalytics } from "@/modules/analytics/analytics.service";
import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { LeadStatus } from "@prisma/client";
import { DashboardStats } from "./dashboard-stats";
import { RecentLeads } from "./recent-leads";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const analytics = await getAnalytics(session.userId, session.role);
  const leads = analytics.recentLeads; // For the "Recent Leads" section
  const t = await getTranslations("dashboard");

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("welcome")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1">
          <DashboardStats analytics={analytics} role={session.role} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-8 pb-10">
          {/* Lead Activity */}
          {session.role === "ADMIN" && (
            <div className="col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-6">{t("leadActivity")}</h2>
              <div className="flex items-center justify-center h-80 text-gray-400">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold text-neutral-500">{t("activityComingSoon")}</p>
                  <p className="text-xs text-neutral-400 mt-2">{t("activityDescription")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Leads */}
          <div className={session.role === "ADMIN" ? "col-span-1" : "col-span-3"}>
            <RecentLeads leads={leads} />
          </div>
        </div>
      </div>
    </div>
  );
}
