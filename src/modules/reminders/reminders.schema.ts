// SimpleCRM — reminders.schema.ts
import { z } from "zod";

export const reminderSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  dueAt: z.string().datetime(),
  note: z.string().max(200).optional().nullable(),
});

export const rescheduleSchema = z.object({
  dueAt: z.string().datetime(),
  note: z.string().max(200).optional(),
});

export const patchReminderSchema = z.union([
  z.object({ action: z.literal("dismiss") }),
  z.object({ 
    action: z.literal("reschedule"), 
    dueAt: z.string().datetime(),
    note: z.string().max(200).optional() 
  }),
]);

export type ReminderInput = z.infer<typeof reminderSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
export type PatchReminderInput = z.infer<typeof patchReminderSchema>;
