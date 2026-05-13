// SimpleCRM — inbox-client
"use client";

import type { PipelineLead } from "@/app/(app)/leads/pipeline/model";
import { InboxWorkspace } from "./components/inbox-workspace";
import { ColumnStateProvider } from "@/app/(app)/leads/pipeline/context/column-state-context";
import { designTokens } from "@/lib/design-system/tokens";

interface InboxClientProps {
  initialData: PipelineLead[];
}

export function InboxClient({ initialData }: InboxClientProps) {
  return (
    <div className={designTokens.spacing.pageTop}>
      <div className={designTokens.spacing.section}>
        <div className="mb-8">
          <h1 className={designTokens.typography.pageTitle}>Inbox</h1>
          <p className={designTokens.typography.body}>Manage unassigned leads and incoming inquiries.</p>
        </div>
        
        <ColumnStateProvider>
          <InboxWorkspace initialData={initialData} />
        </ColumnStateProvider>
      </div>
    </div>
  );
}
