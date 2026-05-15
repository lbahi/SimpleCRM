// SimpleCRM — lead-detail-modal.tsx
"use client";

import { X } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadAttributesList } from "./lead-attributes-list";
import { LeadNotesSection } from "./lead-notes-section";
import { LeadActivityLog } from "./lead-activity-log";
import { LeadReminderSection } from "./lead-reminder-section";
import { useLeadDetail } from "./hooks/use-lead-detail";
import { useLeadMutations } from "./hooks/use-lead-mutations";
import { cn } from "@/lib/utils";

interface LeadDetailModalProps {
  open: boolean;
  lead: any; // Initial lead data from table
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
  const { lead, notes, activityLogs, reminders, mutate, isLoading } = 
    useLeadDetail(initialLead?.id, isSample);

  const { updateStatus, updateRating, addNote } = 
    useLeadMutations(initialLead?.id, mutate, isSample);

  if (!open || !initialLead) return null;

  // Use either fresh data or initial prop data
  const currentLead = lead || initialLead;

  const handleUpdate = async (field: string, value: any) => {
    if (isSample) return;
    
    // Call the provided onUpdateField for table sync
    if (onUpdateField) {
      onUpdateField(currentLead, field, value);
    }

    // For specific fields, use mutations for detailed logging/UI feedback
    if (field === "status") await updateStatus(value);
    else if (field === "rating") await updateRating(value);
    else {
      // General PATCH for other fields
      try {
        const body = field === "assignedTo" 
          ? { assignedToId: (value as any)?.id ?? null }
          : { [field]: value };

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex h-full max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <LeadDetailHeader lead={currentLead} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Main Content — Tabs */}
        <div className="flex flex-1 overflow-hidden">
          <Tabs.Root defaultValue="info" className="flex w-full overflow-hidden">
            {/* Sidebar Tabs Trigger */}
            <Tabs.List className="flex w-[200px] flex-col border-r border-border bg-neutral-50/50 p-4 pt-6">
              {[
                { id: "info", label: "Information" },
                { id: "activity", label: "Activity Log" },
                { id: "notes", label: "Notes" },
              ].map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "mb-1 flex h-10 items-center rounded-lg px-3 text-[13px] font-semibold transition-all duration-100",
                    "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
                    "data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-black/5"
                  )}
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Tab Panels */}
            <div className="flex-1 overflow-hidden bg-white">
              <Tabs.Content value="info" className="flex h-full flex-col outline-none overflow-y-auto custom-scrollbar">
                <LeadAttributesList lead={currentLead} onUpdate={handleUpdate} />
                <div className="mt-auto">
                  <LeadReminderSection leadId={currentLead.id} reminders={reminders} onRefresh={mutate.refresh} />
                </div>
              </Tabs.Content>

              <Tabs.Content value="activity" className="h-full outline-none">
                <LeadActivityLog activityLogs={activityLogs} />
              </Tabs.Content>

              <Tabs.Content value="notes" className="h-full outline-none">
                <LeadNotesSection 
                  notes={notes} 
                  onAddNote={addNote} 
                  isSample={isSample} 
                />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
