// SimpleCRM — lead-reminder-section.tsx
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { SetReminderDialog } from "./dialogs/set-reminder-dialog";
import type { ReminderItem } from "./hooks/use-lead-detail";

interface LeadReminderSectionProps {
  leadId: string;
  reminders: ReminderItem[];
  onRefresh: () => void;
}

export function LeadReminderSection({ leadId, reminders, onRefresh }: LeadReminderSectionProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [activeReminderId, setActiveReminderId] = useState<string | null>(null);

  const pendingReminders = reminders.filter((r) => r.status === "PENDING");
  if (pendingReminders.length === 0) return null;

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISMISSED" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reminder dismissed");
      onRefresh();
    } catch {
      toast.error("Failed to dismiss reminder");
    }
  };

  return (
    <div className="w-full shrink-0 border-t border-border bg-card p-6">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Upcoming reminders
      </h3>
      <div className="space-y-2">
        {pendingReminders.map((reminder) => {
          const isOverdue = new Date(reminder.dueAt) < new Date();
          return (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell className={`h-4 w-4 shrink-0 ${isOverdue ? "text-amber-500" : "text-neutral-400"}`} />
                <div className="flex flex-col min-w-0">
                  <span className={`text-[13px] font-medium ${isOverdue ? "text-amber-700" : "text-neutral-800"}`}>
                    {format(new Date(reminder.dueAt), "MMM d, yyyy 'at' HH:mm")}
                  </span>
                  {reminder.note && (
                    <span className="text-[12px] text-neutral-500 truncate">{reminder.note}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => handleDismiss(reminder.id)}
                  className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setActiveReminderId(reminder.id);
                    setRescheduleOpen(true);
                  }}
                  className="text-[12px] font-medium text-blue-600 hover:text-blue-800"
                >
                  Reschedule
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SetReminderDialog
        leadId={leadId}
        open={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false);
          setActiveReminderId(null);
        }}
        onReminderSet={() => {
          if (activeReminderId) handleDismiss(activeReminderId);
          onRefresh();
        }}
      />
    </div>
  );
}
