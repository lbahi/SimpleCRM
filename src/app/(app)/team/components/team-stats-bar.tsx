// SimpleCRM — team-stats-bar
import { MemberWithStats } from "@/modules/users/users.types";
import { designTokens, StatCard } from "@/lib/design-system/tokens";

interface TeamStatsBarProps {
  members: MemberWithStats[];
}

export function TeamStatsBar({ members }: TeamStatsBarProps) {
  const stats = [
    { label: "Total members", value: members.length },
    { label: "Active", value: members.filter(m => m.isActive).length },
    { label: "Open leads", value: members.reduce((sum, m) => sum + m.openLeads, 0) },
    { label: "Closed leads", value: members.reduce((sum, m) => sum + m.closedLeads, 0) },
  ];

  return (
    <div className={designTokens.grid.stats}>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
