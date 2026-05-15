// SimpleCRM — lead-detail-reminders.tsx
"use client";

import { useState } from "react";
import { format, isPast, formatDistanceToNow } from "date-fns";
import { Bell, Check, Calendar, MoreHorizontal } from "lucide-react";
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
  leadId 
}: LeadDetailRemindersProps) {
  const pendingReminders = (reminders || []).filter(r => r.status === "PENDING");

  if (pendingReminders.length === 0) return null;

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

  return (
    <div className="px-6 py-4 bg-amber-50/50 border-b border-neutral-100">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={14} className="text-amber-500 fill-amber-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-amber-900/60">
          Pending Reminders ({pendingReminders.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {pendingReminders.map((reminder) => {
          const overdue = isPast(new Date(reminder.dueAt));
          const dueAt = new Date(reminder.dueAt);

          return (
            <div 
              key={reminder.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-100 shadow-sm transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  overdue ? "bg-red-50 text-red-500" : "bg-amber-100 text-amber-600"
                )}>
                  <Calendar size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[13px] font-bold",
                      overdue ? "text-red-600" : "text-neutral-900"
                    )}>
                      {overdue ? "Overdue: " : ""}
                      {format(dueAt, "MMM d 'at' HH:mm")}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      ({formatDistanceToNow(dueAt, { addSuffix: true })})
                    </span>
                  </div>
                  {reminder.note && (
                    <p className="text-[12px] text-neutral-500 italic truncate pr-4">
                      {reminder.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-[12px] font-semibold text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg gap-1.5"
                  onClick={() => handleDismiss(reminder.id)}
                >
                  <Check size={14} />
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
