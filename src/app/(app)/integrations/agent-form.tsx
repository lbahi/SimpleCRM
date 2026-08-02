// SimpleCRM — integrations agent-form
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import type { IntegrationAgentPublic } from "@/modules/integrations/integrations.types";

interface AgentFormProps {
  agentKey: string;
  initial: IntegrationAgentPublic;
  onSaved: (updated: IntegrationAgentPublic) => void;
}

export function AgentForm({ agentKey, initial, onSaved }: AgentFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [agentName, setAgentName] = useState(initial.agentName);
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [serviceDescription, setServiceDescription] = useState(initial.serviceDescription);
  const [toneInstructions, setToneInstructions] = useState(initial.toneInstructions);
  const [requiredFields, setRequiredFields] = useState(initial.requiredFields.join(", "));
  const [niceToHaveFields, setNiceToHaveFields] = useState(initial.niceToHaveFields.join(", "));

  const parseCommaSeparated = (raw: string): string[] =>
    raw.split(",").map((s) => s.trim()).filter(Boolean);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/integrations/${agentKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName,
          businessName,
          serviceDescription,
          toneInstructions,
          requiredFields: parseCommaSeparated(requiredFields),
          niceToHaveFields: parseCommaSeparated(niceToHaveFields),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated: IntegrationAgentPublic = await res.json();
      onSaved(updated);
      toast.success("Integration settings saved.");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
      <CardHeader className="border-b border-neutral-100 pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">Agent Configuration</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Agent Name</Label>
            <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="h-10 rounded-lg border-neutral-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Business Name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-10 rounded-lg border-neutral-200" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Service Description</Label>
          <Textarea
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            rows={4}
            className="rounded-lg border-neutral-200 resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tone & Style Instructions</Label>
          <Textarea
            value={toneInstructions}
            onChange={(e) => setToneInstructions(e.target.value)}
            rows={4}
            className="rounded-lg border-neutral-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Required Fields</Label>
            <Input
              value={requiredFields}
              onChange={(e) => setRequiredFields(e.target.value)}
              placeholder="phone, businessLocation"
              className="h-10 rounded-lg border-neutral-200"
            />
            <p className="text-[11px] text-neutral-400">Comma-separated field keys</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Nice-to-Have Fields</Label>
            <Input
              value={niceToHaveFields}
              onChange={(e) => setNiceToHaveFields(e.target.value)}
              placeholder="businessName, leadVolume"
              className="h-10 rounded-lg border-neutral-200"
            />
            <p className="text-[11px] text-neutral-400">Comma-separated field keys</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 bg-neutral-900 text-white rounded-lg px-5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
