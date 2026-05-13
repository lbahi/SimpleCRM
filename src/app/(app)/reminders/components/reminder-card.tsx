// SimpleCRM — reminder-card
"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ReminderWithLead } from "@/modules/reminders/reminders.types";
import { StatusCell } from "../../leads/pipeline/cells/status-cell";
import { SetReminderDialog } from "../../leads/pipeline/lead-detail/dialogs/set-reminder-dialog";
import { LeadDetailModal } from "../../leads/pipeline/lead-detail/lead-detail-modal";
import { PipelineLead } from "../../leads/pipeline/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReminderCardProps {
  reminder: ReminderWithLead;
  isAdmin: boolean;
  onDismiss: (id: string) => void;
  onReschedule: (id: string, dueAt: string, note: string) => void;
}

function getDueLabel(dueAt: Date): string {
  if (formatDistanceToNow && dueAt < new Date()) return formatDistanceToNow(dueAt, { addSuffix: true });
  if (isToday(dueAt)) return `Today at ${format(dueAt, "HH:mm")}`;
  if (isTomorrow(dueAt)) return `Tomorrow at ${format(dueAt, "HH:mm")}`;
  return format(dueAt, "MMM d") + ` at ${format(dueAt, "HH:mm")}`;
}

function getDueLabelColor(dueAt: Date, now: Date): string {
  if (dueAt < now) return "text-red-500";
  if (isToday(dueAt)) return "text-amber-600";
  if (isTomorrow(dueAt)) return "text-neutral-600";
  return "text-neutral-500";
}

export function ReminderCard({ reminder, isAdmin, onDismiss, onReschedule }: ReminderCardProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);

  const dueAt = new Date(reminder.dueAt);
  const now = new Date();
  const overdue = dueAt < now;
  const today = isToday(dueAt) && !overdue;

  const dotColor = overdue ? "bg-red-500" : today ? "bg-amber-500" : "bg-neutral-300";

  return (
    <>
      <div
        className={cn(
          "group flex items-start justify-between gap-4 bg-white rounded-xl border border-neutral-100 px-4 py-3 mb-2 transition-all hover:shadow-sm",
          overdue && "border-red-100 bg-red-50/30",
          today && "border-amber-100 bg-amber-50/40"
        )}
      >
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColor)} />
          <div className="min-w-0">
            {/* Lead name row */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsLeadDetailOpen(true)}
                className="text-[14px] font-medium text-neutral-900 hover:underline truncate"
              >
                {reminder.lead.name}
              </button>
              <StatusCell value={reminder.lead.status} onChange={() => {}} readOnly />
            </div>
            {/* Admin "by" attribution */}
            {isAdmin && (
              <span className="text-[11px] text-neutral-400">
                by {reminder.createdBy.name}
              </span>
            )}
            {/* Phone + note */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[12px] text-neutral-400">{reminder.lead.phone}</span>
              {reminder.note && (
                <>
                  <span className="text-neutral-200">•</span>
                  <span className="text-[12px] text-neutral-400 italic truncate max-w-[260px]">
                    {reminder.note}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-3">
          <span className={cn("text-[12px] font-medium whitespace-nowrap", getDueLabelColor(dueAt, now))}>
            {getDueLabel(dueAt)}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity outline-none"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl">
              <DropdownMenuItem
                className="text-xs text-neutral-600"
                onClick={() => onDismiss(reminder.id)}
              >
                Dismiss
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs text-neutral-600"
                onClick={() => setIsRescheduleOpen(true)}
              >
                Reschedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SetReminderDialog
        leadId={reminder.leadId}
        open={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        onReminderSet={({ dueAt: newDue, note }) => {
          onReschedule(reminder.id, newDue, note ?? "");
          setIsRescheduleOpen(false);
        }}
      />

      <LeadDetailModal
        open={isLeadDetailOpen}
        lead={reminder.lead as unknown as PipelineLead}
        onClose={() => setIsLeadDetailOpen(false)}
        onUpdateField={async () => {}}
      />
    </>
  );
}
