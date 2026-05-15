import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { LeadDetailHeader } from "./lead-detail-header";
import { LeadAttributesList } from "./lead-attributes-list";
import { LeadNotesSection } from "./lead-notes-section";
import { LeadActivityLog } from "./lead-activity-log";
import { LeadDetailReminders } from "./lead-detail-reminders";
import { SetReminderDialog } from "./dialogs/set-reminder-dialog";
import { useLeadDetail, type ReminderItem } from "./hooks/use-lead-detail";
import { useLeadMutations } from "./hooks/use-lead-mutations";
import { cn } from "@/lib/utils";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { Bell, MessageSquare } from "lucide-react";
import { useState } from "react";

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
  const { lead, notes, activityLogs, reminders, mutate, isLoading } = 
    useLeadDetail(initialLead?.id, isSample);

  const { updateStatus, updateRating, addNote } = 
    useLeadMutations(initialLead?.id, mutate, isSample);

  if (!initialLead) return null;

  const currentLead = lead || initialLead;

  const handleUpdate = async (field: string, value: any) => {
    if (isSample) return;
    if (onUpdateField) onUpdateField(currentLead, field, value);

    if (field === "status") await updateStatus(value);
    else if (field === "rating") await updateRating(value);
    else {
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

  const hasReminder = (reminders || []).some(r => r.status === "PENDING");

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent 
          className="w-full sm:max-w-[640px] p-0 flex flex-col gap-0 border-l border-neutral-100 shadow-[-20px_0_50px_rgba(0,0,0,0.1)]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Lead Details - {currentLead.name}</SheetTitle>
          </SheetHeader>

          {/* Fixed Header Section */}
          <LeadDetailHeader lead={currentLead} />

          {/* Fixed Action Bar */}
          <div className="flex items-center gap-3 bg-neutral-50 px-6 py-3 border-b border-neutral-100 overflow-x-auto no-scrollbar">
            <div className="flex-shrink-0 h-9 flex items-center px-1">
              <StatusCell value={currentLead.status} onChange={(v) => handleUpdate("status", v)} />
            </div>
            <div className="flex-shrink-0 h-9 flex items-center px-3 border-x border-neutral-200">
              <RatingCell value={currentLead.rating || 0} onChange={(v) => handleUpdate("rating", v)} />
            </div>
            <button className="flex-shrink-0 h-9 px-4 rounded-xl border border-neutral-200 bg-white text-[13px] font-bold text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2">
              <MessageSquare size={14} className="text-neutral-400" />
              Log contact
            </button>
            <button 
              onClick={() => setReminderDialogOpen(true)}
              className={cn(
                "flex-shrink-0 h-9 px-4 rounded-xl border text-[13px] font-bold transition-all flex items-center gap-2",
                hasReminder 
                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" 
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <Bell size={14} className={cn(hasReminder ? "text-amber-500 fill-amber-500" : "text-neutral-400")} />
              Set reminder
            </button>
          </div>

          {/* Reminders Section (if pending) */}
          <LeadDetailReminders 
            reminders={reminders || []} 
            onRefresh={mutate.refresh} 
            leadId={currentLead.id} 
          />

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex min-h-full flex-col">
              <div className="flex flex-1">
                {/* Left Column: Attributes (55%) */}
                <div className="w-[55%] border-r border-neutral-100 py-4">
                  <div className="px-6 mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Attributes</h3>
                  </div>
                  <LeadAttributesList 
                    lead={currentLead} 
                    onUpdate={(f, v) => handleUpdate(f as string, v)} 
                  />
                </div>

                {/* Right Column: Activity Log (45%) */}
                <div className="w-[45%] py-4 bg-white/50">
                  <div className="px-6 mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Activity</h3>
                  </div>
                  <LeadActivityLog activityLogs={activityLogs} />
                </div>
              </div>

              {/* Bottom: Notes (Full Width) */}
              <div className="border-t border-neutral-100 bg-neutral-50/30">
                <LeadNotesSection 
                  notes={notes} 
                  onAddNote={addNote} 
                  isSample={isSample} 
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <SetReminderDialog 
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        leadId={currentLead.id}
        onReminderSet={() => mutate.refresh()}
      />
    </>
  );
}
