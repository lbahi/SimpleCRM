// SimpleCRM — integrations workspace
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles } from "lucide-react";
import { AgentForm } from "./agent-form";
import type { IntegrationAgentPublic } from "@/modules/integrations/integrations.types";

interface IntegrationsWorkspaceProps {
  agent: IntegrationAgentPublic | null;
}

export function IntegrationsWorkspace({ agent: initialAgent }: IntegrationsWorkspaceProps) {
  const [agent, setAgent] = useState<IntegrationAgentPublic | null>(initialAgent);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!agent || isToggling) return;
    const next = !agent.isActive;
    setIsToggling(true);
    try {
      const res = await fetch(`/api/integrations/${agent.key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      const updated: IntegrationAgentPublic = await res.json();
      setAgent(updated);
      toast.success(updated.isActive ? "Agent activated." : "Agent deactivated.");
    } catch {
      toast.error("Failed to update agent status.");
    } finally {
      setIsToggling(false);
    }
  };

  if (!agent) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Integrations</h1>
          <p className="text-sm text-neutral-500 mt-1">No integration agents configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Integrations</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage AI agents connected to your CRM workspace.
        </p>
      </div>

      <div className="space-y-6">
        {/* Agent header card with toggle */}
        <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  {agent.label} AI Agent
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-100">
                    <Sparkles className="h-3 w-3" /> AI
                  </span>
                </CardTitle>
                <CardDescription className="text-neutral-500 mt-0.5">
                  {agent.serviceDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/50 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="agent-toggle" className="text-sm font-semibold text-neutral-900">
                  Agent Status
                </Label>
                <div className="text-xs text-neutral-500 font-medium">
                  Currently:{" "}
                  <span className={agent.isActive ? "text-green-600 font-semibold" : "text-neutral-500"}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-600">
                  {isToggling ? "Saving…" : agent.isActive ? "Active" : "Inactive"}
                </span>
                <Switch
                  id="agent-toggle"
                  checked={agent.isActive}
                  onCheckedChange={handleToggle}
                  disabled={isToggling}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable config form */}
        <AgentForm
          agentKey={agent.key}
          initial={agent}
          onSaved={setAgent}
        />

        {/* Future "Recent Activity" Section structural placeholder */}
        <div className="pt-6 space-y-4 border-t border-dashed border-neutral-200/60">
          <div>
            <h2 className="text-lg font-semibold text-neutral-400">Recent Activity</h2>
            <p className="text-xs text-neutral-400">
              Log of automated responses, incoming webhooks, and agent actions — coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
