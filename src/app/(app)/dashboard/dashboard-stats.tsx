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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard 
        label="Total Leads" 
        value={analytics.totalLeads.toLocaleString()} 
        description="vs last month"
      />
      <StatCard 
        label="Fresh Leads" 
        value={analytics.freshLeads.toLocaleString()} 
        description="Awaiting contact"
      />
      <StatCard 
        label="Closed Leads" 
        value={analytics.closedLeads.toLocaleString()} 
        description="Deals won"
      />
      <StatCard 
        label="Conversion Rate" 
        value={`${analytics.conversionRate.toFixed(1)}%`} 
        description="Lead to customer"
      />
    </div>
  );
}
