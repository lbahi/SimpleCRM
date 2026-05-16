// SimpleCRM — lead-detail-reminders.tsx
"use client";

import { format, isPast, formatDistanceToNow } from "date-fns";
import { Bell, Check, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReminderItem } from "./hooks/use-lead-detail";
import { Button } from "@/components/ui/button";

interface LeadDetailRemindersProps {
  reminders: ReminderItem[];
  onRefresh: () => void;
  leadId: string;
}

export function LeadDetailReminders({
  reminders,
  onRefresh,
  leadId,
}: LeadDetailRemindersProps) {
  const pendingReminders = (reminders || []).filter((r) => r.status === "PENDING");
  const dismissedReminders = (reminders || []).filter((r) => r.status !== "PENDING");

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to dismiss reminder", error);
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
        <Clock className="h-10 w-10 mb-3 opacity-30" />
        <span className="text-[13px] font-medium text-neutral-400">
          No reminders set
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      {pendingReminders.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
            <Bell size={12} className="fill-amber-500 text-amber-500" />
            Pending ({pendingReminders.length})
          </h4>
          <div className="space-y-2">
            {pendingReminders.map((reminder) => {
              const overdue = isPast(new Date(reminder.dueAt));
              const dueAt = new Date(reminder.dueAt);

              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100 transition-all hover:shadow-sm group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        overdue
                          ? "bg-red-50 text-red-500"
                          : "bg-amber-100 text-amber-600"
                      )}
                    >
                      <Calendar size={14} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[13px] font-semibold",
                            overdue ? "text-red-600" : "text-neutral-900"
                          )}
                        >
                          {overdue ? "Overdue: " : ""}
                          {format(dueAt, "MMM d 'at' HH:mm")}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          (
                          {formatDistanceToNow(dueAt, {
                            addSuffix: true,
                          })}
                          )
                        </span>
                      </div>
                      {reminder.note && (
                        <p className="text-[12px] text-neutral-500 italic truncate pr-4">
                          {reminder.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-[12px] font-semibold text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDismiss(reminder.id)}
                  >
                    <Check size={14} />
                    Dismiss
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dismissed */}
      {dismissedReminders.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Dismissed ({dismissedReminders.length})
          </h4>
          <div className="space-y-2">
            {dismissedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 text-neutral-400"
              >
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-neutral-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] line-through">
                    {format(new Date(reminder.dueAt), "MMM d 'at' HH:mm")}
                  </span>
                  {reminder.note && (
                    <p className="text-[12px] italic truncate">{reminder.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
