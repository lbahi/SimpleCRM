// SimpleCRM — leads page (server) with Pipeline Workspace
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listLeads } from "@/modules/leads/leads.service";
import { PipelineWorkspace } from "./pipeline/pipeline-workspace";

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch leads using the modular service
  const initialData = await listLeads({
    userId: session.userId,
    role: session.role,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortDir: "desc"
  });

  return <PipelineWorkspace initialData={initialData} currentUserRole={session.role} currentUserId={session.userId} />;
}
