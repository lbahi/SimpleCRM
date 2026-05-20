// SimpleCRM — member-row
"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MemberWithStats } from "@/modules/users/users.types";
import { cn } from "@/lib/utils";
import { designTokens } from "@/lib/design-system/tokens";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemberRowProps {
  member: MemberWithStats;
  onEdit: (member: MemberWithStats) => void;
  onDeactivate: (member: MemberWithStats) => void;
  onRefresh: () => void;
}

export function MemberRow({ member, onEdit, onDeactivate, onRefresh }: MemberRowProps) {
  const t = useTranslations("team");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/users/${member.id}/reactivate`, {
        method: "POST"
      });

      if (!res.ok) throw new Error();

      toast.success(t("reactivated", { name: member.name }));
      onRefresh();
    } catch {
      toast.error(t("reactivateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="group hover:bg-neutral-50/50 transition-colors h-[72px]">
      <td className="px-6 py-4">
        <div className={cn("flex items-center gap-3", !member.isActive && "opacity-50")}>
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs font-bold">
              {member.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className={designTokens.typography.body + " font-semibold text-neutral-900"}>{member.name}</span>
            <span className={designTokens.typography.caption + " font-mono"}>{member.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-[13px] text-neutral-600 tabular-nums">{member.openLeads}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[13px] text-neutral-600 tabular-nums">{member.closedLeads}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-[13px] font-bold text-neutral-900 tabular-nums">
          {member._count.assignedLeads}
        </span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={member.isActive ? t("active") : t("inactive")} />
      </td>
      <td className="px-6 py-4 text-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 flex items-center justify-center transition-colors outline-none focus:ring-0">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-neutral-100">
            {member.isActive ? (
              <>
                <DropdownMenuItem onClick={() => onEdit(member)} className="gap-2 rounded-lg">
                  <Edit2 className="h-3.5 w-3.5 text-neutral-400" />
                  {t("editProfile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeactivate(member)} 
                  className="gap-2 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {t("deactivateMember")}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem 
                onClick={handleReactivate} 
                disabled={isUpdating}
                className="gap-2 rounded-lg text-green-600 focus:text-green-600 focus:bg-green-50"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("reactivateMember")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
