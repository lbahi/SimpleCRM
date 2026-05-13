export interface ColumnDef {
  id: string;
  label: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'rating' | 'url' | 'status' | 'member' | 'sources';
  visible: boolean;
  width: number;
  pinned: boolean;
  order: number;
  editable: boolean;
}

export interface TableState {
  columns: ColumnDef[];
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  groupBy: string | null;
  filters: {
    search: string;
    name: string;
    phone: string;
    location: string;
    assignedTo: string;
    status: string;
    rating: number | null;
  };
}

export interface Activity {
  id: string;
  type: 'status_change' | 'contact_log' | 'note' | 'reminder';
  timestamp: Date;
  description: string;
  oldValue?: string;
  newValue?: string;
}

export interface Reminder {
  id: string;
  leadId: string;
  timestamp: Date;
  note: string;
}
