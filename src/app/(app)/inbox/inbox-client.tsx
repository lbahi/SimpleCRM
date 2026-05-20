// SimpleCRM — inbox-client
"use client";

import type { PipelineLead } from "@/app/(app)/leads/pipeline/model";
import { InboxWorkspace } from "./components/inbox-workspace";
import { ColumnStateProvider } from "@/app/(app)/leads/pipeline/context/column-state-context";
import { designTokens } from "@/lib/design-system/tokens";
import { useTranslations } from "next-intl";

interface InboxClientProps {
  initialData: PipelineLead[];
}

export function InboxClient({ initialData }: InboxClientProps) {
  const t = useTranslations("inbox");
  return (
    <div className={designTokens.spacing.pageTop}>
      <div className={designTokens.spacing.section}>
        <div className="mb-8">
          <h1 className={designTokens.typography.pageTitle}>{t("title")}</h1>
          <p className={designTokens.typography.body}>{t("workspaceSubtitle")}</p>
        </div>
        
        <ColumnStateProvider>
          <InboxWorkspace initialData={initialData} />
        </ColumnStateProvider>
      </div>
    </div>
  );
}
