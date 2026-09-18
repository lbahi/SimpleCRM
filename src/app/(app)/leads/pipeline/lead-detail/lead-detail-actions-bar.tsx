// SimpleCRM — lead-detail-actions-bar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Bell, Clock, Loader2 } from "lucide-react";

interface LeadDetailActionsBarProps {
  hasReminder: boolean;
  loggingContact: boolean;
  isSample?: boolean;
  onLogContact: () => void;
  onOpenReminderDialog: () => void;
}

export function LeadDetailActionsBar({
  hasReminder,
  loggingContact,
  isSample,
  onLogContact,
  onOpenReminderDialog,
}: LeadDetailActionsBarProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-200">
      <button
        onClick={onLogContact}
        disabled={loggingContact || isSample}
        className="flex-shrink-0 h-9 px-4 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loggingContact ? (
          <>
            <Loader2 size={14} className="animate-spin text-neutral-400" />
            Logging...
          </>
        ) : (
          <>
            <Clock size={14} className="text-neutral-400" />
            Log Contact
          </>
        )}
      </button>
      <button
        onClick={onOpenReminderDialog}
        className={cn(
          "flex-shrink-0 h-9 px-4 rounded-lg border text-[13px] font-medium transition-all flex items-center gap-2",
          hasReminder
            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        )}
      >
        <Bell
          size={14}
          className={cn(
            hasReminder ? "text-amber-500 fill-amber-500" : "text-neutral-400"
          )}
        />
        Set Reminder
      </button>
    </div>
  );
}
