// SimpleCRM — inbox page
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listUnassignedLeads } from "@/modules/leads/leads-interactions.service";
import { InboxClient } from "./inbox-client";

export default async function InboxPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/leads");
  }

  const leads = await listUnassignedLeads();

  return <InboxClient initialData={leads as any} />;
}
