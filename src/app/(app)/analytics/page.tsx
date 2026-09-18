// SimpleCRM — AnalyticsPage
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AnalyticsWorkspace } from "./analytics-workspace";
import { getAnalytics, DateRange } from "@/modules/analytics/analytics.service";

interface AnalyticsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

function parseDateRange(fromStr?: string, toStr?: string): DateRange | undefined {
  if (!fromStr || !toStr) return undefined;

  // Expected YYYY-MM-DD format (or standard ISO date)
  const from = new Date(fromStr.includes("T") ? fromStr : `${fromStr}T00:00:00.000Z`);
  const to = new Date(toStr.includes("T") ? toStr : `${toStr}T23:59:59.999Z`);

  // Fall back safely if invalid or malformed
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return undefined;
  }

  // Fall back safely if inverted range
  if (from > to) {
    return undefined;
  }

  return { from, to };
}

export default async function AnalyticsPage(props: AnalyticsPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const searchParams = props.searchParams ? await props.searchParams : {};
  const fromParam = typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toParam = typeof searchParams.to === "string" ? searchParams.to : undefined;

  const range = parseDateRange(fromParam, toParam);
  const analytics = await getAnalytics(session.userId, session.role, range);

  return <AnalyticsWorkspace analytics={analytics} />;
}
