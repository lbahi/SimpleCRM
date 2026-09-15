// SimpleCRM — lead-detail-reminder-dialog-controller.tsx
"use client";

import React, { useCallback } from "react";
import { SetReminderDialog } from "./dialogs/set-reminder-dialog";

interface LeadDetailReminderDialogControllerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  leadId: string;
  mutate: { refresh: () => Promise<void> };
}

export function LeadDetailReminderDialogController({
  open,
  setOpen,
  leadId,
  mutate,
}: LeadDetailReminderDialogControllerProps) {
  const handleReminderDialogClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleReminderSet = useCallback(() => {
    mutate.refresh();
  }, [mutate]);

  return (
    <SetReminderDialog
      open={open}
      onClose={handleReminderDialogClose}
      leadId={leadId}
      onReminderSet={handleReminderSet}
    />
  );
}
