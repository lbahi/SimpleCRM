// SimpleCRM — lead-activity-log.tsx
import { formatDistanceToNow } from "date-fns";
import type { ActivityItem } from "../lead-detail/hooks/use-lead-detail";

interface LeadActivityLogProps {
  activityLogs: ActivityItem[];
}

export function LeadActivityLog({ activityLogs }: LeadActivityLogProps) {
  const getActionDetails = (item: ActivityItem) => {
    const actor = item.actor?.name || "System";
    const from = item.fromValue;
    const to = item.toValue;

    switch (item.action) {
      case "CREATED":
        return { color: "bg-teal-500", text: `${actor} created this lead` };
      case "STATUS_CHANGED":
        return { color: "bg-blue-500", text: `${actor} changed status from ${from} → ${to}` };
      case "ASSIGNED":
        return { color: "bg-purple-500", text: `${actor} assigned to ${to}` };
      case "REASSIGNED":
        return { color: "bg-orange-500", text: `${actor} reassigned from ${from} to ${to}` };
      case "RATING_CHANGED":
        return { color: "bg-amber-500", text: `${actor} rated ${to} stars` };
      case "NOTE_ADDED":
        return { color: "bg-neutral-500", text: `${actor} added a note` };
      case "CONTACTED":
        return { color: "bg-green-500", text: `${actor} logged a contact` };
      case "REMINDER_SET":
        return { color: "bg-sky-500", text: `${actor} set a reminder for ${to}` };
      case "REMINDER_DISMISSED":
        return { color: "bg-gray-500", text: `${actor} dismissed a reminder` };
      default:
        return { color: "bg-neutral-300", text: `${actor} performed an action` };
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold mb-4 px-6 pt-6 shrink-0">
        Activity Log
      </h3>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="relative space-y-5 pl-3 before:absolute before:inset-y-2 before:left-[3.5px] before:w-px before:bg-border">
          {activityLogs.slice(0, 50).map((item) => {
            const { color, text } = getActionDetails(item);
            return (
              <div key={item.id} className="relative text-[13px]">
                <div className={`absolute -left-3 top-1.5 h-2 w-2 rounded-full ring-4 ring-card ${color}`} />
                <div className="flex items-start justify-between gap-4 pl-3">
                  <span className="text-neutral-700 leading-snug">{text}</span>
                  <span className="text-[11px] text-neutral-400 shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
          {activityLogs.length === 0 && (
            <div className="text-[13px] text-neutral-400 pl-3">No activity yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
