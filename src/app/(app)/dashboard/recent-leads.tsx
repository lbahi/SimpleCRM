import { designTokens } from "@/lib/design-system/tokens";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { format } from "date-fns";

interface RecentLeadsProps {
  leads: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: Date;
  }>;
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <div className={designTokens.card.base + " " + designTokens.card.padding}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={designTokens.typography.sectionTitle}>Recent Leads</h3>
        <Link 
          href="/leads" 
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          View All
        </Link>
      </div>
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
          <p className="text-sm">No recent leads found</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between py-4 group hover:bg-neutral-50/50 -mx-6 px-6 transition-colors first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-semibold text-xs">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={designTokens.typography.body + ' font-semibold text-neutral-900'}>{lead.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
