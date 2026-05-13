// SimpleCRM — leads-client
"use client";

import { useState } from "react";
import type { PaginatedLeads } from "@/modules/leads/leads.types";
import { PipelineWorkspace } from "./pipeline/pipeline-workspace";
import { TeamViewTable } from "./team-view-table";
import { cn } from "@/lib/utils";

interface LeadsClientProps {
  initialData: PaginatedLeads;
  role: "ADMIN" | "MEMBER";
}

type Tab = "mine" | "team";

export function LeadsClient({ initialData, role }: LeadsClientProps) {
  const [tab, setTab] = useState<Tab>("mine");

  // Admins see the full pipeline with no tabs
  if (role === "ADMIN") {
    return <PipelineWorkspace initialData={initialData} />;
  }

  // Members get My Leads + Team View tabs
  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {(["mine", "team"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "mine" ? "My Leads" : "Team View"}
          </button>
        ))}
      </div>

      {tab === "mine" ? (
        <PipelineWorkspace initialData={initialData} />
      ) : (
        <TeamViewTable />
      )}
    </div>
  );
}
