// SimpleCRM — members-table
"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MemberWithStats } from "@/modules/users/users.types";
import { MemberRow } from "./member-row";
import { designTokens } from "@/lib/design-system/tokens";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";

interface MembersTableProps {
  members: MemberWithStats[];
  onInviteClick: () => void;
  onEdit: (member: MemberWithStats) => void;
  onDeactivate: (member: MemberWithStats) => void;
  onRefresh: () => void;
}

export function MembersTable({ 
  members, 
  onInviteClick, 
  onEdit, 
  onDeactivate, 
  onRefresh 
}: MembersTableProps) {
  const t = useTranslations("team");
  const headerActions = (
    <Button onClick={onInviteClick} size="sm" className="bg-black hover:bg-neutral-800 text-white gap-2">
      <Plus className="h-4 w-4" />
      {t("inviteMember")}
    </Button>
  );

  return (
    <DataTableWrapper title={t("members")} headerActions={headerActions}>
      <table className="w-full text-start border-collapse">
        <thead>
          <tr className="bg-neutral-50/50">
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("member")}</th>
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("openLeads")}</th>
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("closedLeads")}</th>
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("total")}</th>
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{t("status")}</th>
            <th className="px-6 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest text-end">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {members.map((member) => (
            <MemberRow 
              key={member.id} 
              member={member} 
              onEdit={onEdit} 
              onDeactivate={onDeactivate}
              onRefresh={onRefresh}
            />
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  );
}
