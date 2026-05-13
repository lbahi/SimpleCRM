// SimpleCRM — inbox-row
"use client";

import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import type { PipelineLead } from "@/app/(app)/leads/pipeline/model";
import { SourceCell } from "@/app/(app)/leads/pipeline/cells/source-cell";
import { cn } from "@/lib/utils";

interface InboxRowProps {
  lead: PipelineLead;
  isSelected: boolean;
  onToggle: () => void;
  onExpand: () => void;
}

export function InboxRow({ lead, isSelected, onToggle, onExpand }: InboxRowProps) {
  const location = (lead as any).location;

  return (
    <tr
      onClick={onToggle}
      className={cn(
        "group h-[64px] cursor-pointer transition-colors hover:bg-neutral-50/50",
        isSelected && "bg-neutral-50"
      )}
    >
      <td className={cn("px-4 py-3 relative", isSelected && "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-neutral-900 before:rounded-r-full")}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e: any) => e.stopPropagation()}
          className="rounded-md border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
        />
      </td>
      <td className="px-3 py-2">
        <span className="text-[13px] font-medium text-neutral-900 truncate block">
          {lead.name}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className="text-[13px] text-neutral-500 truncate block">
          {lead.phone || "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className="text-[13px] text-neutral-500 truncate block">
          {location || "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        <SourceCell sources={(lead as any).sources} />
      </td>
      <td className="px-3 py-2">
        <span className="text-[12px] text-neutral-400">
          {format(new Date(lead.createdAt), "MMM d, yyyy · HH:mm")}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="rounded p-1 text-neutral-400 opacity-0 transition-all hover:bg-neutral-200 hover:text-neutral-900 group-hover:opacity-100"
          title="Open detail view"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
