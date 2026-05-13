import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AnalyticsWorkspace } from "./analytics-workspace";
import { getAnalytics } from "@/modules/analytics/analytics.service";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const analytics = await getAnalytics(session.userId);

  return <AnalyticsWorkspace leads={analytics.recentLeads} />; // In a real app we'd pass all leads or specialized data
}

