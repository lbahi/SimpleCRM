// SimpleCRM — column-header-dropdown.tsx
"use client";

import { 
  Pencil, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Pin, 
  Columns3 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ColumnId } from "../model";

interface ColumnHeaderDropdownProps {
  columnId: ColumnId;
  onAction: (action: string) => void;
  trigger: React.ReactNode;
}

export function ColumnHeaderDropdown({
  columnId,
  onAction,
  trigger,
}: ColumnHeaderDropdownProps) {
  const items = [
    { id: "rename", label: "Rename", icon: Pencil },
    { id: "hide", label: "Hide", icon: EyeOff, destructive: true },
    { type: "divider" },
    { id: "sort-asc", label: "Sort A → Z", icon: ArrowUp },
    { id: "sort-desc", label: "Sort Z → A", icon: ArrowDown },
    { type: "divider" },
    { id: "pin", label: "Pin column", icon: Pin },
    { id: "group", label: "Group by", icon: Columns3 },
  ];

  return (
    <Popover>
      <PopoverTrigger className="w-full text-left rounded-md outline-none">
        {trigger}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[200px] p-1 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <div className="flex flex-col">
          {items.map((item, idx) => {
            if (item.type === "divider") {
              return <div key={`div-${idx}`} className="my-1 h-px bg-neutral-100" />;
            }

            const Icon = item.icon!;
            return (
              <button
                key={item.id}
                onClick={() => onAction(item.id!)}
                className={cn(
                  "h-8 px-3 rounded-lg flex items-center gap-2.5 text-[13px] font-medium transition-colors duration-100",
                  item.destructive 
                    ? "text-neutral-700 hover:text-red-500 hover:bg-neutral-100" 
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5",
                  item.destructive ? "text-neutral-400 group-hover:text-red-400" : "text-neutral-400"
                )} />
                {item.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
