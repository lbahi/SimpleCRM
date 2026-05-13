// SimpleCRM — leads client with Figma design
"use client";

import { useState, useEffect, useMemo } from 'react';
import { FigmaLead, LeadStatus } from '@/lib/adapters/leads.adapter';
import { LeadsTable } from './LeadsTable';
import { Toolbar } from './Toolbar';
import { FilterDialog } from './FilterDialog';
import { CustomizeDialog } from './CustomizeDialog';
import { CreateLeadDialog } from './CreateLeadDialog';
import { LeadDetailModal } from './LeadDetailModal';
import { toast, Toaster } from 'sonner';
import { createLead, updateLead, deleteLeads } from '@/app/actions/leads';
import { ColumnDef, TableState, Activity, Reminder } from '../types';

const STORAGE_KEY = 'leads-table-state';

const defaultColumns: ColumnDef[] = [
  { id: 'phone', label: 'Phone', field: 'phone', type: 'text', visible: true, width: 150, pinned: false, order: 0, editable: true },
  { id: 'location', label: 'Location', field: 'location', type: 'text', visible: true, width: 200, pinned: false, order: 1, editable: true },
  { id: 'assignedTo', label: 'Assigned To', field: 'assignedTo', type: 'member', visible: true, width: 180, pinned: false, order: 2, editable: false },
  { id: 'status', label: 'Status', field: 'status', type: 'status', visible: true, width: 120, pinned: false, order: 3, editable: false },
  { id: 'rating', label: 'Rating', field: 'rating', type: 'rating', visible: true, width: 120, pinned: false, order: 4, editable: true },
  { id: 'sources', label: 'Sources', field: 'sources', type: 'sources', visible: true, width: 200, pinned: false, order: 5, editable: false },
  { id: 'lastContacted', label: 'Last Contacted', field: 'lastContacted', type: 'date', visible: true, width: 150, pinned: false, order: 6, editable: false },
];

interface LeadsClientProps {
  initialLeads: FigmaLead[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
  const [leads, setLeads] = useState<FigmaLead[]>(initialLeads);
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns);

  const [tableState, setTableState] = useState<TableState>({
    columns: defaultColumns,
    sortField: null,
    sortDirection: 'asc',
    groupBy: null,
    filters: {
      search: '',
      name: '',
      phone: '',
      location: '',
      assignedTo: '',
      status: '',
      rating: null,
    },
  });

  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [showCreateLeadDialog, setShowCreateLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<FigmaLead | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTableState(parsed.tableState);
        setColumns(parsed.columns);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tableState, columns }));
  }, [tableState, columns]);

  const handleUpdateLead = async (leadId: string, updates: Partial<FigmaLead>) => {
    try {
      // Call server action
      await updateLead(leadId, updates);
      
      // Update local state
      setLeads(leads.map(lead => lead.id === leadId ? { ...lead, ...updates } : lead));

      if (updates.status && updates.status !== leads.find(l => l.id === leadId)?.status) {
        const oldStatus = leads.find(l => l.id === leadId)?.status;
        const newActivity: Activity = {
          id: `a${Date.now()}`,
          type: 'status_change',
          timestamp: new Date(),
          description: 'Status changed',
          oldValue: oldStatus,
          newValue: updates.status,
        };
        setActivities({
          ...activities,
          [leadId]: [...(activities[leadId] || []), newActivity],
        });
      }

      if (updates.lastContacted) {
        const newActivity: Activity = {
          id: `a${Date.now()}`,
          type: 'contact_log',
          timestamp: new Date(),
          description: 'Contact logged',
        };
        setActivities({
          ...activities,
          [leadId]: [...(activities[leadId] || []), newActivity],
        });
      }

      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead');
    }
  };

  const handleReorderLeads = (reorderedLeads: FigmaLead[]) => {
    setLeads(reorderedLeads.map((lead, index) => ({ ...lead, manualOrder: index })));
  };

  const handleSort = (field: string) => {
    if (tableState.sortField === field) {
      setTableState({
        ...tableState,
        sortDirection: tableState.sortDirection === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setTableState({
        ...tableState,
        sortField: field,
        sortDirection: 'asc',
      });
    }
  };

  const handleApplyFilters = (filters: TableState['filters']) => {
    setTableState({ ...tableState, filters });
  };

  const handleApplyColumns = (newColumns: ColumnDef[]) => {
    setColumns(newColumns);
    setTableState({ ...tableState, columns: newColumns });
  };

  const handleCreateLead = async (leadData: Omit<FigmaLead, 'id' | 'createdAt'>) => {
    try {
      // Adapt FigmaLead format to server action format
      const serverActionData = {
        name: leadData.name,
        phone: leadData.phone,
        email: undefined,
        location: leadData.location,
        rating: leadData.rating,
        status: leadData.status,
        sources: leadData.sources,
        source: 'WEBSITE' as any, // Required by server action schema
        tags: [], // Required by server action schema
        assignedToId: undefined, // Will need to map assignedTo name to ID
      };

      // Call server action
      const createdLead = await createLead(serverActionData);
      
      const newLead: FigmaLead = {
        id: createdLead.id,
        name: createdLead.name,
        phone: createdLead.phone,
        location: createdLead.location || '',
        assignedTo: leadData.assignedTo,
        status: createdLead.status as any,
        rating: createdLead.rating,
        sources: leadData.sources,
        lastContacted: null,
        createdAt: createdLead.createdAt,
      };
      setLeads([newLead, ...leads]);

      const newActivity: Activity = {
        id: `a${Date.now()}`,
        type: 'status_change',
        timestamp: new Date(),
        description: 'Lead created',
        newValue: newLead.status,
      };
      setActivities({
        ...activities,
        [newLead.id]: [newActivity],
      });

      toast.success('Lead created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead');
    }
  };

  const handleAddNote = (leadId: string, note: string) => {
    const newActivity: Activity = {
      id: `a${Date.now()}`,
      type: 'note',
      timestamp: new Date(),
      description: note,
    };
    setActivities({
      ...activities,
      [leadId]: [...(activities[leadId] || []), newActivity],
    });
    toast.success('Note added');
  };

  const handleSetReminder = (leadId: string, reminder: Omit<Reminder, 'id' | 'leadId'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `r${Date.now()}`,
      leadId,
    };
    setReminders([...reminders, newReminder]);
    toast.success('Reminder set');
  };

  const handleRefresh = () => {
    setLeads(initialLeads);
    setActivities({});
    setReminders([]);
    toast.success('Data refreshed');
  };

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];

    if (tableState.filters.search) {
      const search = tableState.filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(search) ||
        lead.phone.toLowerCase().includes(search) ||
        lead.location.toLowerCase().includes(search) ||
        lead.assignedTo.toLowerCase().includes(search)
      );
    }

    if (tableState.filters.name) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(tableState.filters.name.toLowerCase())
      );
    }

    if (tableState.filters.phone) {
      filtered = filtered.filter(lead =>
        lead.phone.toLowerCase().includes(tableState.filters.phone.toLowerCase())
      );
    }

    if (tableState.filters.location) {
      filtered = filtered.filter(lead =>
        lead.location.toLowerCase().includes(tableState.filters.location.toLowerCase())
      );
    }

    if (tableState.filters.assignedTo) {
      filtered = filtered.filter(lead =>
        lead.assignedTo.toLowerCase().includes(tableState.filters.assignedTo.toLowerCase())
      );
    }

    if (tableState.filters.status) {
      filtered = filtered.filter(lead => lead.status === tableState.filters.status);
    }

    if (tableState.filters.rating !== null) {
      filtered = filtered.filter(lead => lead.rating >= (tableState.filters.rating || 0));
    }

    if (tableState.sortField) {
      filtered.sort((a, b) => {
        const aValue = a[tableState.sortField as keyof FigmaLead];
        const bValue = b[tableState.sortField as keyof FigmaLead];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return tableState.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return tableState.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [leads, tableState.filters, tableState.sortField, tableState.sortDirection]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (tableState.filters.name) count++;
    if (tableState.filters.phone) count++;
      if (tableState.filters.status) count++;
    if (tableState.filters.rating !== null) count++;
    return count;
  }, [tableState.filters]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const idsToDelete = Array.from(selectedIds);
    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} leads?`)) return;

    try {
      await deleteLeads(idsToDelete);
      setLeads(leads.filter(l => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
      toast.success(`${idsToDelete.length} leads deleted`);
    } catch (error) {
      toast.error('Failed to delete leads');
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filteredAndSortedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedLeads.map(l => l.id)));
    }
  };

  return (
    <div className="size-full flex flex-col bg-white">
      <Toaster position="top-right" />

      <Toolbar
        searchValue={tableState.filters.search}
        onSearchChange={(value) => setTableState({ ...tableState, filters: { ...tableState.filters, search: value } })}
        activeFiltersCount={activeFiltersCount}
        onOpenFilters={() => setShowFilterDialog(true)}
        groupBy={tableState.groupBy}
        onGroupByChange={(value) => setTableState({ ...tableState, groupBy: value })}
        onOpenCustomize={() => setShowCustomizeDialog(true)}
        onCreateLead={() => setShowCreateLeadDialog(true)}
        onRefresh={handleRefresh}
        onAddColumn={() => toast.info('Add column feature coming soon')}
        selectedCount={selectedIds.size}
        onDeleteSelected={handleDeleteSelected}
      />

      <LeadsTable
        leads={filteredAndSortedLeads}
        columns={columns}
        tableState={tableState}
        activities={activities}
        reminders={reminders}
        onUpdateLead={handleUpdateLead}
        onReorderLeads={handleReorderLeads}
        onSort={handleSort}
        onOpenDetail={setSelectedLead}
        onAddNote={handleAddNote}
        onSetReminder={handleSetReminder}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleAll={handleToggleAll}
      />

      {showFilterDialog && (
        <FilterDialog
          filters={tableState.filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={handleApplyFilters}
        />
      )}

      {showCustomizeDialog && (
        <CustomizeDialog
          columns={columns}
          onClose={() => setShowCustomizeDialog(false)}
          onApply={handleApplyColumns}
        />
      )}

      {showCreateLeadDialog && (
        <CreateLeadDialog
          onClose={() => setShowCreateLeadDialog(false)}
          onCreate={handleCreateLead}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          activities={activities[selectedLead.id] || []}
          reminders={reminders.filter(r => r.leadId === selectedLead.id)}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onAddNote={handleAddNote}
          onSetReminder={handleSetReminder}
        />
      )}
    </div>
  );
}
