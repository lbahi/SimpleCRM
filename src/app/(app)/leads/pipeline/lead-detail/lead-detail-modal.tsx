// SimpleCRM — lead-detail-modal.tsx
"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadDetailReminderDialogController } from "./lead-detail-reminder-dialog-controller";
import { LeadDetailTabPanel, type TabId } from "./lead-detail-tab-panel";
import { LeadDetailActionsBar } from "./lead-detail-actions-bar";

import { useLeadDetail } from "./hooks/use-lead-detail";
import { useLeadMutations } from "./hooks/use-lead-mutations";
import { cn } from "@/lib/utils";
import { applyFieldChange } from "../model";
import { toast } from "sonner";

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

  const handleUpdate = useCallback(async (field: string, value: any) => {
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
  }, [isSample, mutate, onUpdateField, currentLead, updateStatus, updateRating]);

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

  const handleDialogChange = useCallback((v: boolean) => {
    if (!v) onClose();
  }, [onClose]);


  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent
          showCloseButton
          className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
        >
          <DialogTitle className="sr-only">
            Lead Details — {currentLead.name}
          </DialogTitle>

          {/* ── Header ── */}
          <LeadDetailHeader lead={currentLead} />

          <LeadDetailActionsBar
            hasReminder={hasReminder}
            loggingContact={loggingContact}
            isSample={isSample}
            onLogContact={handleLogContact}
            onOpenReminderDialog={() => setReminderDialogOpen(true)}
          />

          <LeadDetailTabPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingCount={pendingCount}
            lead={currentLead}
            onUpdate={handleUpdate}
            notes={notes}
            activityLogs={activityLogs}
            reminders={reminders || []}
            onRefreshReminders={mutate.refresh}
            onAddNote={addNote}
            isSample={isSample}
          />
        </DialogContent>
      </Dialog>

      <LeadDetailReminderDialogController
        open={reminderDialogOpen}
        setOpen={setReminderDialogOpen}
        leadId={currentLead.id}
        mutate={mutate}
      />
    </>
  );
}
