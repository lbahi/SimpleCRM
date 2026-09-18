// SimpleCRM — lead-detail-tab-panel.tsx
"use client";

import { cn } from "@/lib/utils";
import { LeadAttributesList } from "./lead-attributes-list";
import { LeadNotesSection } from "./lead-notes-section";
import { LeadActivityLog } from "./lead-activity-log";
import { LeadDetailReminders } from "./lead-detail-reminders";
import type { PipelineLead } from "../model";
import type { NoteItem, ActivityItem, ReminderItem } from "./hooks/use-lead-detail";

// ─── Tab config ──────────────────────────────────────────────

export type TabId = "info" | "activity" | "notes" | "reminders";

export const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "Lead Information" },
  { id: "activity", label: "Activity Log" },
  { id: "notes", label: "Notes" },
  { id: "reminders", label: "Reminders" },
];

// ─── Component ───────────────────────────────────────────────

interface LeadDetailTabPanelProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  pendingCount: number;
  lead: PipelineLead;
  onUpdate: (field: string, value: unknown) => void;
  notes: NoteItem[];
  activityLogs: ActivityItem[];
  reminders: ReminderItem[];
  onRefreshReminders: () => void;
  onAddNote: (body: string) => Promise<void>;
  isSample?: boolean;
}

export function LeadDetailTabPanel({
  activeTab,
  setActiveTab,
  pendingCount,
  lead,
  onUpdate,
  notes,
  activityLogs,
  reminders,
  onRefreshReminders,
  onAddNote,
  isSample,
}: LeadDetailTabPanelProps) {
  return (
    <>
      {/* ── Tab Bar ── */}
      <div className="flex border-b border-neutral-200 px-6 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-3 text-[13px] font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab.label}
            {tab.id === "reminders" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-700">
                {pendingCount}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content (scrollable) ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "info" && (
          <div className="p-6">
            <LeadAttributesList lead={lead} onUpdate={onUpdate} />
          </div>
        )}

        {activeTab === "activity" && (
          <div className="p-6">
            <LeadActivityLog activityLogs={activityLogs} />
          </div>
        )}

        {activeTab === "notes" && (
          <LeadNotesSection
            leadId={lead.id}
            notes={notes}
            onAddNote={onAddNote}
            isSample={isSample}
          />
        )}

        {activeTab === "reminders" && (
          <div className="p-6">
            <LeadDetailReminders
              reminders={reminders}
              onRefresh={onRefreshReminders}
              leadId={lead.id}
            />
          </div>
        )}
      </div>
    </>
  );
}
