// SimpleCRM — inbox-empty-state
import { Inbox, Search } from "lucide-react";

interface InboxEmptyStateProps {
  variant: "empty" | "no_results";
}

export function InboxEmptyState({ variant }: InboxEmptyStateProps) {
  const isSearch = variant === "no_results";
  const Icon = isSearch ? Search : Inbox;
  const title = isSearch ? "No leads match your search" : "Inbox is clear";
  const subtitle = isSearch
    ? "Try a different name or phone number."
    : "All leads have been assigned. New submissions will appear here.";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="h-12 w-12 text-neutral-300 mb-4" />
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500 max-w-xs">{subtitle}</p>
    </div>
  );
}
