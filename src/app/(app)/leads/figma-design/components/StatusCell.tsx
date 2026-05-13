import { LeadStatus } from '@/lib/adapters/leads.adapter';

interface StatusCellProps {
  status: LeadStatus;
}

const statusColors: Record<LeadStatus, string> = {
  'NEW': 'bg-blue-100 text-blue-700',
  'NO_RESPOND': 'bg-orange-100 text-orange-700',
  'CONTACTED': 'bg-yellow-100 text-yellow-700',
  'CONVERTED': 'bg-emerald-100 text-emerald-700',
  'LOST': 'bg-red-100 text-red-700',
};

export function StatusCell({ status }: StatusCellProps) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
}
