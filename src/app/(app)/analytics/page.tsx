// SimpleCRM — AnalyticsPage
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AnalyticsWorkspace } from "./analytics-workspace";
import { getAnalytics } from "@/modules/analytics/analytics.service";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const analytics = await getAnalytics(session.userId, session.role);

  return <AnalyticsWorkspace analytics={analytics} />;
}
