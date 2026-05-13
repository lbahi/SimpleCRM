// SimpleCRM — lead-detail-actions.tsx
import { Phone, Bell, Palette } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { StatusCell } from "../cells/status-cell";
import { RatingCell } from "../cells/rating-cell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SetReminderDialog } from "./dialogs/set-reminder-dialog";
import { StatusColorCustomizer } from "./dialogs/status-color-customizer";
import type { PipelineLead } from "../model";
import type { ReminderItem } from "./hooks/use-lead-detail";

interface LeadDetailActionsProps {
  lead: PipelineLead;
  reminders: ReminderItem[];
  onStatusChange: (status: string) => void;
  onRatingChange: (rating: number) => void;
  onLogContact: () => void;
  onRefreshReminders: () => void;
}

export function LeadDetailActions({
  lead,
  reminders,
  onStatusChange,
  onRatingChange,
  onLogContact,
  onRefreshReminders,
}: LeadDetailActionsProps) {
  const [reminderOpen, setReminderOpen] = useState(false);

  const pendingReminders = reminders.filter(r => r.status === "PENDING");
  const earliestReminder = pendingReminders.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
  
  const lastContacted = lead.lastContacted;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-y border-border bg-muted/30 px-6 py-3">
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <span className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</span>
        <div className="h-8">
          <StatusCell value={lead.status} onChange={onStatusChange} />
        </div>
        <StatusColorCustomizer
          trigger={
            <button className="text-[11px] text-neutral-400 underline hover:text-neutral-600 transition-colors">
              Customize status colors
            </button>
          }
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <span className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Rating</span>
        <div className="h-8 flex items-center px-1">
          <RatingCell value={lead.rating || 0} onChange={onRatingChange} />
        </div>
      </div>

      <div className="h-10 w-px shrink-0 bg-border max-sm:hidden" />

      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogContact}
          className="h-8 gap-1.5 text-[12px] text-neutral-700 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Phone className="h-3.5 w-3.5 text-neutral-500" />
          Log contact
        </Button>
        {lastContacted && (
          <span className="text-[10px] text-neutral-400 px-1">
            Last: {format(new Date(lastContacted), "MMM d, yyyy")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReminderOpen(true)}
          className="h-8 gap-1.5 text-[12px] text-neutral-700 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Bell className={`h-3.5 w-3.5 ${earliestReminder ? "text-amber-500" : "text-neutral-500"}`} />
          Set reminder
          {earliestReminder && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-medium px-1.5 py-0.5 rounded ml-1 border border-amber-200">
              {formatDistanceToNow(new Date(earliestReminder.dueAt), { addSuffix: true })}
            </span>
          )}
        </Button>
      </div>

      <SetReminderDialog
        leadId={lead.id}
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        onReminderSet={onRefreshReminders}
      />
    </div>
  );
}
