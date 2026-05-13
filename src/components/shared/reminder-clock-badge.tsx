// SimpleCRM — reminder-clock-badge
"use client";

import { Clock } from "lucide-react";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { Reminder } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ReminderClockBadgeProps {
  reminders: { dueAt: Date | string }[];
}

export function ReminderClockBadge({ reminders }: ReminderClockBadgeProps) {
  if (!reminders || reminders.length === 0) return null;

  const soonest = [...reminders].sort((a, b) => 
    new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  )[0];

  const dueAt = new Date(soonest.dueAt);
  const now = new Date();
  const isOverdue = dueAt < now;

  const getLabel = () => {
    const hours = Math.abs(differenceInHours(dueAt, now));
    const days = Math.abs(differenceInDays(dueAt, now));

    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return format(dueAt, "MMM d");
  };

  const labelPrefix = isOverdue ? "" : "in ";
  const labelSuffix = isOverdue ? " ago" : "";

  return (
    <div 
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium",
        isOverdue ? "text-red-500" : "text-neutral-400"
      )}
      title={format(dueAt, "PPP 'at' p")}
    >
      <Clock size={12} className={isOverdue ? "text-red-500" : "text-neutral-400"} />
      <span>{labelPrefix}{getLabel()}{labelSuffix}</span>
    </div>
  );
}
