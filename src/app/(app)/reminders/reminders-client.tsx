// SimpleCRM — reminders-client
"use client";

import { ReminderWithLead } from "@/modules/reminders/reminders.types";
import { RemindersWorkspace } from "./components/reminders-workspace";

interface RemindersClientProps {
  initialReminders: ReminderWithLead[];
  isAdmin: boolean;
}

export function RemindersClient({ initialReminders, isAdmin }: RemindersClientProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mx-auto max-w-4xl">
        <RemindersWorkspace initialReminders={initialReminders} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
