// SimpleCRM — lead-detail-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadAttributesList } from "./lead-attributes-list";
import { LeadNotesSection } from "./lead-notes-section";
import { LeadActivityLog } from "./lead-activity-log";
import { LeadDetailReminders } from "./lead-detail-reminders";
import { SetReminderDialog } from "./dialogs/set-reminder-dialog";
import { useLeadDetail } from "./hooks/use-lead-detail";
import { useLeadMutations } from "./hooks/use-lead-mutations";
import { cn } from "@/lib/utils";
import { applyFieldChange } from "../model";
import { Bell, MessageSquare, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Tab config ──────────────────────────────────────────────

type TabId = "info" | "activity" | "notes" | "reminders";

const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "Lead Information" },
  { id: "activity", label: "Activity Log" },
  { id: "notes", label: "Notes" },
  { id: "reminders", label: "Reminders" },
];

// ─── Component ───────────────────────────────────────────────

interface LeadDetailModalProps {
  open: boolean;
  lead: any;
  onClose: () => void;
  onUpdateField?: (lead: any, field: string, value: any) => void;
  isSample?: boolean;
}

export function LeadDetailModal({
  open,
  lead: initialLead,
  onClose,
  onUpdateField,
  isSample,
}: LeadDetailModalProps) {
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [loggingContact, setLoggingContact] = useState(false);

  const { lead, notes, activityLogs, reminders, mutate } =
    useLeadDetail(initialLead?.id, isSample);

  const { updateStatus, updateRating, addNote } =
    useLeadMutations(initialLead?.id, mutate, isSample);

  if (!initialLead) return null;

  const currentLead = lead || initialLead;

  const handleUpdate = async (field: string, value: any) => {
    if (isSample) return;

    // Optimistically update popup state
    mutate.setLead((prev: any) => prev ? applyFieldChange(prev, field as any, value) : prev);

    if (onUpdateField) {
      await onUpdateField(currentLead, field as any, value);
      mutate.refresh();
      return;
    }

    if (field === "status") await updateStatus(value);
    else if (field === "rating") await updateRating(value);
    else {
      try {
        let body: any = {};
        if (field === "assignedTo") {
          body = { assignedToId: (value as any)?.id ?? null };
        } else if (field.startsWith("custom_")) {
          body = {
            customFields: {
              ...(currentLead.customFields || {}),
              [field]: value,
            },
          };
        } else {
          body = { [field]: value };
        }

        await fetch(`/api/leads/${currentLead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        mutate.refresh();
      } catch (error) {
        console.error("Update failed", error);
      }
    }
  };

  const handleLogContact = async () => {
    if (isSample || loggingContact) return;
    setLoggingContact(true);
    try {
      const now = new Date().toISOString();

      // Optimistically update popup state
      mutate.setLead((prev: any) =>
        prev ? applyFieldChange(prev, "lastContacted" as any, now) : prev
      );

      // 1. PATCH lastContacted on lead
      await fetch(`/api/leads/${currentLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContacted: now }),
      });

      // 2. POST activity log
      await fetch(`/api/leads/${currentLead.id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONTACTED" }),
      });

      if (onUpdateField) {
        await onUpdateField(currentLead, "lastContacted" as any, now);
      }

      mutate.refresh();
      toast.success("Contact logged");
    } catch (error) {
      console.error("Log contact failed", error);
      toast.error("Failed to log contact");
    } finally {
      setLoggingContact(false);
    }
  };

  const hasReminder = (reminders || []).some((r) => r.status === "PENDING");
  const pendingCount = (reminders || []).filter(
    (r) => r.status === "PENDING"
  ).length;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          showCloseButton
          className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
        >
          <DialogTitle className="sr-only">
            Lead Details — {currentLead.name}
          </DialogTitle>

          {/* ── Header ── */}
          <LeadDetailHeader lead={currentLead} />

          {/* ── Actions Bar ── */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-200">
            <button
              onClick={handleLogContact}
              disabled={loggingContact || isSample}
              className="flex-shrink-0 h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingContact ? (
                <>
                  <Loader2 size={14} className="animate-spin text-neutral-400" />
                  Logging...
                </>
              ) : (
                <>
                  <Clock size={14} className="text-neutral-400" />
                  Log Contact
                </>
              )}
            </button>
            <button
              onClick={() => setReminderDialogOpen(true)}
              className={cn(
                "flex-shrink-0 h-9 px-4 rounded-lg border text-[13px] font-medium transition-all flex items-center gap-2",
                hasReminder
                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <Bell
                size={14}
                className={cn(
                  hasReminder
                    ? "text-amber-500 fill-amber-500"
                    : "text-neutral-400"
                )}
              />
              Set Reminder
            </button>
          </div>

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
            {/* Lead Information */}
            {activeTab === "info" && (
              <div className="p-6">
                <LeadAttributesList
                  lead={currentLead}
                  onUpdate={(f, v) => handleUpdate(f as string, v)}
                />
              </div>
            )}

            {/* Activity Log */}
            {activeTab === "activity" && (
              <div className="p-6">
                <LeadActivityLog activityLogs={activityLogs} />
              </div>
            )}

            {/* Notes */}
            {activeTab === "notes" && (
              <LeadNotesSection
                notes={notes}
                onAddNote={addNote}
                isSample={isSample}
              />
            )}

            {/* Reminders */}
            {activeTab === "reminders" && (
              <div className="p-6">
                <LeadDetailReminders
                  reminders={reminders || []}
                  onRefresh={mutate.refresh}
                  leadId={currentLead.id}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SetReminderDialog
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        leadId={currentLead.id}
        onReminderSet={() => mutate.refresh()}
      />
    </>
  );
}
