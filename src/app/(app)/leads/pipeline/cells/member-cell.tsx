// SimpleCRM — member-cell.tsx
"use client";

import { Check, UserPlus, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MEMBERS = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
  { name: "Bob Wilson", email: "bob@example.com" },
];

interface MemberCellProps {
  value: string | { id: string; name: string; avatarInitials: string } | null;
  onChange: (value: string | null) => void;
  isAdmin?: boolean;
}

function Avatar({ initials, name, size }: { initials: string; name: string; size: string }) {
  const sizeClasses = size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs";
  return (
    <div className={`${sizeClasses} rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

export function MemberCell({ value, onChange, isAdmin = false }: MemberCellProps) {
  const memberName = typeof value === 'string' ? value : value?.name || null;
  const initials = typeof value === 'string' ? value.slice(0, 2).toUpperCase() : value?.avatarInitials || '??';

  const content = (
    <div className="flex items-center gap-1.5 w-full text-left group">
      {memberName ? (
        <>
          <Avatar initials={initials} name={memberName} size="sm" />
          <span className="truncate text-xs font-medium text-blue-700">{memberName}</span>
        </>
      ) : (
        <div className="flex items-center gap-2 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded-full border border-dashed border-neutral-300 flex items-center justify-center">
            <UserPlus className="w-3 h-3" />
          </div>
          <span className="text-xs">Assign</span>
        </div>
      )}
      {!isAdmin && memberName && (
        <Lock className="w-3 h-3 text-neutral-300 ml-auto opacity-0 group-hover:opacity-100" />
      )}
    </div>
  );

  if (!isAdmin) {
    return <div className="px-1">{content}</div>;
  }

  return (
    <Popover>
      <PopoverTrigger className="w-full text-left rounded-md outline-none">
        {content}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[220px] p-1 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <div className="p-2 border-b border-neutral-100">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">Assign Member</p>
        </div>
        <div className="flex flex-col mt-1">
          {MEMBERS.map((member) => (
            <button
              key={member.email}
              onClick={() => onChange(member.name)}
              className={cn(
                "h-10 px-2 rounded-lg flex items-center gap-3 text-[13px] font-medium transition-colors",
                member.name === memberName ? "bg-neutral-50 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <Avatar 
                initials={member.name.slice(0, 2).toUpperCase()} 
                name={member.name} 
                size="sm" 
              />
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate leading-tight">{member.name}</span>
                <span className="text-[11px] text-neutral-400 truncate leading-tight">{member.email}</span>
              </div>
              {member.name === memberName && <Check className="ml-auto w-3.5 h-3.5 text-neutral-400" />}
            </button>
          ))}
          <button
            onClick={() => onChange(null)}
            className="h-9 px-2 rounded-lg flex items-center gap-3 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
          >
            <div className="w-6 h-6 rounded-full border border-red-100 flex items-center justify-center">
              <span className="text-lg leading-none">×</span>
            </div>
            Unassign
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
