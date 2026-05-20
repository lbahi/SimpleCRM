// SimpleCRM — team-stats-bar
"use client";

import { useTranslations } from "next-intl";
import { MemberWithStats } from "@/modules/users/users.types";
import { designTokens, StatCard } from "@/lib/design-system/tokens";

interface TeamStatsBarProps {
  members: MemberWithStats[];
}

export function TeamStatsBar({ members }: TeamStatsBarProps) {
  const t = useTranslations("team");
  const stats = [
    { label: t("totalMembers"), value: members.length },
    { label: t("activeMembers"), value: members.filter((m) => m.isActive).length },
    { label: t("openLeads"), value: members.reduce((sum, m) => sum + m.openLeads, 0) },
    { label: t("closedLeads"), value: members.reduce((sum, m) => sum + m.closedLeads, 0) },
  ];

  return (
    <div className={designTokens.grid.stats}>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
