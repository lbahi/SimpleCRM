import { AnalyticsData } from "@/modules/analytics/analytics.service";
import { Skeleton } from "@/components/ui/skeleton";
import { designTokens } from "@/lib/design-system/tokens";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardStatsProps {
  analytics?: AnalyticsData;
  isLoading?: boolean;
}

export function DashboardStats({ analytics, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className={designTokens.grid.stats}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={designTokens.statCard.base}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className={designTokens.grid.stats}>
      <StatCard 
        label="Total Leads" 
        value={analytics.totalLeads.toLocaleString()} 
        trend={{ value: 12, isUp: true }}
        description="vs last month"
      />
      <StatCard 
        label="Fresh Leads" 
        value={analytics.freshLeads.toLocaleString()} 
        trend={{ value: 8, isUp: true }}
        description="Awaiting contact"
      />
      <StatCard 
        label="Closed Leads" 
        value={analytics.closedLeads.toLocaleString()} 
        trend={{ value: 5, isUp: false }}
        description="Deals won"
      />
      <StatCard 
        label="Conversion Rate" 
        value={`${analytics.conversionRate.toFixed(1)}%`} 
        trend={{ value: 2, isUp: true }}
        description="Lead to customer"
      />
    </div>
  );
}
