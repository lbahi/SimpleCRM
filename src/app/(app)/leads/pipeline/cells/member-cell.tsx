// SimpleCRM — member-cell.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, UserPlus, Lock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MemberWithStats } from "@/modules/users/users.types";

interface MemberValue {
  id: string;
  name: string;
  avatarInitials: string;
}

interface MemberCellProps {
  value: MemberValue | null | string; // string is allowed for ID
  onChange: (value: MemberValue | null) => void;
  isAdmin?: boolean;
}

function Avatar({ initials, size }: { initials: string; size: string }) {
  const sizeClasses = size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs";
  return (
    <div className={cn(
      sizeClasses,
      "rounded-full bg-neutral-800 text-white flex items-center justify-center flex-shrink-0 font-medium"
    )}>
      {initials}
    </div>
  );
}

export function MemberCell({ value, onChange, isAdmin = false }: MemberCellProps) {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMembers(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const memberId = typeof value === 'string' ? value : value?.id;
  const currentMember = typeof value === 'object' ? value : members.find(m => m.id === memberId);
  const memberName = currentMember?.name || null;
  const initials = currentMember?.avatarInitials || "??";

  const content = (
    <div className="flex items-center gap-1.5 w-full text-left group">
      {memberName ? (
        <>
          <Avatar initials={initials} size="sm" />
          <span className="truncate text-xs font-medium text-neutral-900 group-hover:text-primary transition-colors">
            {memberName}
          </span>
        </>
      ) : (
        <div className="flex items-center gap-2 text-neutral-400 opacity-40 group-hover:opacity-100 transition-opacity">
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
      <PopoverTrigger className="w-full text-left rounded-md outline-none focus:ring-1 focus:ring-primary/20">
        <div className="px-1 py-0.5 rounded transition-colors hover:bg-neutral-100/50">
          {content}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-[240px] p-1 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[100]"
        sideOffset={4}
      >
        <div className="px-2 py-1.5 border-b border-neutral-100 mb-1">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Assign Lead</p>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {/* Unassign Option */}
          <button
            onClick={() => onChange(null)}
            className="w-full h-10 px-2 rounded-lg flex items-center gap-3 text-[13px] font-medium text-neutral-400 hover:bg-neutral-50 transition-colors border-b border-dashed border-neutral-100 mb-1"
          >
            <div className="w-7 h-7 rounded-full border border-dashed border-neutral-200 flex items-center justify-center bg-white">
              <span className="text-lg leading-none">×</span>
            </div>
            Unassign
          </button>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-400 italic">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 italic">No active members found</div>
          ) : (
            members.map((member) => (
              <button
                key={member.id}
                onClick={() => onChange({ 
                  id: member.id, 
                  name: member.name, 
                  avatarInitials: member.avatarInitials 
                })}
                className={cn(
                  "w-full h-12 px-2 rounded-lg flex items-center gap-3 text-[13px] font-medium transition-all group",
                  member.id === memberId ? "bg-neutral-50 text-primary" : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <Avatar initials={member.avatarInitials} size="md" />
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="truncate leading-tight font-semibold">{member.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-neutral-400 truncate max-w-[100px]">{member.email}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                    {member.openLeads} leads
                  </span>
                  {member.id === memberId && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
