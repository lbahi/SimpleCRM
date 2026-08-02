// SimpleCRM — integrations page
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getIntegrationAgentByKey, toPublicShape } from "@/modules/integrations/integrations.service";
import { IntegrationsWorkspace } from "./integrations-workspace";

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const agentRow = await getIntegrationAgentByKey("facebook-messenger-primary");
  const agent = agentRow ? toPublicShape(agentRow) : null;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-50">
      <div className="mx-auto max-w-4xl">
        <IntegrationsWorkspace agent={agent} />
      </div>
    </div>
  );
}
