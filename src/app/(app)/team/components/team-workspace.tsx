// SimpleCRM — team-workspace
"use client";

import { useState } from "react";
import { MemberWithStats } from "@/modules/users/users.types";
import { TeamStatsBar } from "./team-stats-bar";
import { MembersTable } from "./members-table";
import { InviteMemberDialog } from "./dialogs/invite-member-dialog";
import { EditMemberDialog } from "./dialogs/edit-member-dialog";
import { DeactivateMemberDialog } from "./dialogs/deactivate-member-dialog";
import { toast } from "sonner";
import { designTokens } from "@/lib/design-system/tokens";
import { useTranslations } from "next-intl";

interface TeamWorkspaceProps {
  initialData: MemberWithStats[];
}

export function TeamWorkspace({ initialData }: TeamWorkspaceProps) {
  const t = useTranslations("team");
  const [members, setMembers] = useState<MemberWithStats[]>(initialData);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MemberWithStats | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<MemberWithStats | null>(null);

  const refetch = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      toast.error(t("refreshFailed"));
    }
  };

  return (
    <div className={designTokens.spacing.pageTop}>
      <div className={designTokens.spacing.section}>
        <div>
          <h1 className={designTokens.typography.pageTitle}>{t("management")}</h1>
          <p className={designTokens.typography.body + ' mt-1'}>{t("subtitle")}</p>
        </div>

        <TeamStatsBar members={members} />

        <MembersTable 
          members={members} 
          onInviteClick={() => setInviteOpen(true)}
          onEdit={(m) => setEditTarget(m)}
          onDeactivate={(m) => setDeactivateTarget(m)}
          onRefresh={refetch}
        />

        <InviteMemberDialog 
          open={inviteOpen} 
          onClose={() => setInviteOpen(false)} 
          onCreated={refetch} 
        />

        {editTarget && (
          <EditMemberDialog 
            member={editTarget} 
            open={!!editTarget} 
            onClose={() => setEditTarget(null)} 
            onUpdated={refetch} 
          />
        )}

        {deactivateTarget && (
          <DeactivateMemberDialog 
            member={deactivateTarget} 
            open={!!deactivateTarget} 
            onClose={() => setDeactivateTarget(null)} 
            onDeactivated={refetch} 
          />
        )}
      </div>
    </div>
  );
}
