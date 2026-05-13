// SimpleCRM — reminders-list
"use client";

import { ReminderWithLead } from "@/modules/reminders/reminders.types";
import { ReminderCard } from "./reminder-card";
import { isToday, isTomorrow, isThisWeek } from "date-fns";

interface RemindersListProps {
  reminders: ReminderWithLead[];
  isAdmin: boolean;
  onDismiss: (id: string) => void;
  onReschedule: (id: string, dueAt: string, note: string) => void;
}

type GroupKey = "overdue" | "today" | "tomorrow" | "thisWeek" | "later";

const GROUP_LABELS: Record<GroupKey, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  thisWeek: "This Week",
  later: "Later",
};

function getGroup(dueAt: Date, now: Date): GroupKey {
  if (dueAt < now) return "overdue";
  if (isToday(dueAt)) return "today";
  if (isTomorrow(dueAt)) return "tomorrow";
  if (isThisWeek(dueAt, { weekStartsOn: 1 })) return "thisWeek";
  return "later";
}

function Heading({ label }: { label: string }) {
  return (
    <h3 className="text-[11px] uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-1 mb-2 mt-6 first:mt-0">
      {label}
    </h3>
  );
}

export function RemindersList({ reminders, isAdmin, onDismiss, onReschedule }: RemindersListProps) {
  const shouldGroup = reminders.length > 5;

  if (!shouldGroup) {
    return (
      <div className="space-y-1">
        {reminders.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            isAdmin={isAdmin}
            onDismiss={onDismiss}
            onReschedule={onReschedule}
          />
        ))}
      </div>
    );
  }

  const now = new Date();
  const groups = new Map<GroupKey, ReminderWithLead[]>([
    ["overdue", []],
    ["today", []],
    ["tomorrow", []],
    ["thisWeek", []],
    ["later", []],
  ]);

  for (const r of reminders) {
    const key = getGroup(new Date(r.dueAt), now);
    groups.get(key)!.push(r);
  }

  return (
    <div>
      {(["overdue", "today", "tomorrow", "thisWeek", "later"] as GroupKey[]).map((key) => {
        const items = groups.get(key)!;
        if (items.length === 0) return null;
        return (
          <div key={key} className="space-y-1">
            <Heading label={GROUP_LABELS[key]} />
            {items.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                isAdmin={isAdmin}
                onDismiss={onDismiss}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
