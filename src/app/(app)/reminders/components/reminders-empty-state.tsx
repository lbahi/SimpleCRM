// SimpleCRM — reminders-empty-state
import { Bell } from "lucide-react";

const EMPTY_CONTENT: Record<"all" | "upcoming" | "overdue", { title: string; subtitle: string }> = {
  all: {
    title: "No reminders",
    subtitle: "Set a reminder from any lead's detail panel.",
  },
  upcoming: {
    title: "No upcoming reminders",
    subtitle: "You're all caught up.",
  },
  overdue: {
    title: "No overdue reminders",
    subtitle: "Great work staying on top of follow-ups.",
  },
};

interface RemindersEmptyStateProps {
  variant: "all" | "upcoming" | "overdue";
}

export function RemindersEmptyState({ variant }: RemindersEmptyStateProps) {
  const { title, subtitle } = EMPTY_CONTENT[variant];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Bell className="h-12 w-12 text-neutral-300 mb-6" />
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-500 max-w-xs">{subtitle}</p>
    </div>
  );
}
