// SimpleCRM — reminders.types.ts
import { Reminder, LeadStatus } from "@prisma/client";

export type ReminderWithLead = Reminder & {
  lead: {
    id: string;
    name: string;
    phone: string;
    status: LeadStatus;
  };
  createdBy: {
    id: string;
    name: string;
    avatarInitials: string;
  };
};
