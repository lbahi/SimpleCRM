import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FigmaLead } from '@/lib/adapters/leads.adapter';
import { StatusCell } from './StatusCell';
import { RatingCell } from './RatingCell';
import { MemberCell } from './MemberCell';
import { SourceCell } from './SourceCell';
import { ArrowUp, ArrowDown, GripVertical, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnDef, TableState, Activity, Reminder } from '../types';

interface LeadsTableProps {
  leads: FigmaLead[];
  columns: ColumnDef[];
  tableState: TableState;
  activities: Record<string, Activity[]>;
  reminders: Reminder[];
  onUpdateLead: (leadId: string, updates: Partial<FigmaLead>) => void;
  onReorderLeads: (leads: FigmaLead[]) => void;
  onSort: (field: string) => void;
  onOpenDetail: (lead: FigmaLead) => void;
  onAddNote: (leadId: string, note: string) => void;
  onSetReminder: (leadId: string, reminder: Omit<Reminder, 'id' | 'leadId'>) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}

interface SortableRowProps {
  lead: FigmaLead;
  columns: ColumnDef[];
  onOpenDetail: (lead: FigmaLead) => void;
  onUpdateLead: (leadId: string, updates: Partial<FigmaLead>) => void;
  selected: boolean;
  onToggleSelect: () => void;
}

function SortableRow({ lead, columns, onOpenDetail, onUpdateLead, selected, onToggleSelect }: SortableRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);
  const pinnedColumns = visibleColumns.filter(col => col.pinned);
  const unpinnedColumns = visibleColumns.filter(col => !col.pinned);

  const handleStartEdit = (column: ColumnDef, currentValue: any) => {
    if (!column.editable) return;
    setEditingField(column.field as string);
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = (field: string) => {
    if (editValue !== String(lead[field as keyof FigmaLead] || '')) {
      onUpdateLead(lead.id, { [field]: editValue });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };

  const renderCell = (column: ColumnDef) => {
    const value = lead[column.field as keyof FigmaLead];
    const isEditing = editingField === column.field;

    if (column.type === 'status') {
      return <StatusCell status={lead.status} />;
    }
    if (column.type === 'rating') {
      return <RatingCell rating={lead.rating} onChange={(rating) => onUpdateLead(lead.id, { rating })} />;
    }
    if (column.type === 'member') {
      return <MemberCell name={lead.assignedTo} size="sm" />;
    }
    if (column.type === 'sources') {
      return <SourceCell sources={lead.sources} />;
    }
    if (column.type === 'date' && value) {
      return <span className="text-sm">{format(value as Date, 'MMM d, yyyy')}</span>;
    }

    if (column.editable && isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(column.field as string)}
          onKeyDown={(e) => handleKeyDown(e, column.field as string)}
          className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <span
        className={`text-sm ${column.editable ? 'cursor-text hover:bg-gray-100 px-2 py-1 rounded' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (column.editable) {
            handleStartEdit(column, value);
          }
        }}
      >
        {String(value || '')}
      </span>
    );
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${selected ? 'bg-blue-50/30' : ''}`}
    >
      <td className="px-4 py-3 w-12 sticky left-0 bg-inherit z-10 text-center">
        <button className="cursor-grab active:cursor-grabbing inline-flex items-center justify-center" {...attributes} {...listeners}>
          <GripVertical size={14} className="text-gray-300" />
        </button>
      </td>
      <td className="px-4 py-3 w-12 sticky left-12 bg-inherit z-10 text-center">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(lead.id)}
            className="h-4 w-4 rounded border-gray-300 data-checked:bg-blue-500 data-checked:border-blue-500"
          />
        </div>
      </td>
      <td className="px-4 py-3 w-12 sticky left-24 bg-inherit z-10">
        <button
          onClick={() => onOpenDetail(lead)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="View details"
        >
          <Info size={16} className="text-gray-600" />
        </button>
      </td>
      <td className="px-4 py-3 sticky left-36 bg-inherit z-10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm flex-shrink-0">
            {getInitials(lead.name)}
          </div>
          {editingField === 'name' ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSaveEdit('name')}
              onKeyDown={(e) => handleKeyDown(e, 'name')}
              className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-sm cursor-text hover:bg-gray-100 px-2 py-1 rounded flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit({ id: 'name', field: 'name', editable: true } as ColumnDef, lead.name);
              }}
            >
              {lead.name}
            </span>
          )}
        </div>
      </td>
      {pinnedColumns.filter(col => col.id !== 'name').map((column) => (
        <td
          key={column.id}
          className="px-4 py-3 sticky bg-inherit z-10"
          style={{ left: `${240}px` }}
        >
          {renderCell(column)}
        </td>
      ))}
      {unpinnedColumns.map((column) => (
        <td
          key={column.id}
          className="px-4 py-3"
        >
          {renderCell(column)}
        </td>
      ))}
    </tr>
  );
}

export function LeadsTable({
  leads,
  columns,
  tableState,
  activities,
  reminders,
  onUpdateLead,
  onReorderLeads,
  onSort,
  onOpenDetail,
  onAddNote,
  onSetReminder,
  selectedIds,
  onToggleSelect,
  onToggleAll,
}: LeadsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = leads.findIndex((lead) => lead.id === active.id);
      const newIndex = leads.findIndex((lead) => lead.id === over.id);
      const reordered = arrayMove(leads, oldIndex, newIndex);
      onReorderLeads(reordered);
    }
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const groupedLeads = useMemo(() => {
    if (!tableState.groupBy) {
      return { ungrouped: leads };
    }

    const groups: Record<string, FigmaLead[]> = {};
    leads.forEach(lead => {
      const groupKey = String(lead[tableState.groupBy as keyof FigmaLead] || 'Unassigned');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(lead);
    });

    return groups;
  }, [leads, tableState.groupBy]);

  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order);
  const pinnedColumns = visibleColumns.filter(col => col.pinned);
  const unpinnedColumns = visibleColumns.filter(col => !col.pinned);

  const renderHeader = () => (
    <thead className="bg-gray-50 sticky top-0 z-20">
      <tr className="border-b border-gray-200">
        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 w-12 sticky left-0 bg-gray-50 z-20">

        </th>
        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 w-12 sticky left-12 bg-gray-50 z-20 text-center">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedIds.size === leads.length && leads.length > 0}
              onCheckedChange={onToggleAll}
              className="h-4 w-4 rounded border-gray-300 data-checked:bg-blue-500 data-checked:border-blue-500"
            />
          </div>
        </th>
        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 w-12 sticky left-24 bg-gray-50 z-20">

        </th>
        <th
          className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 sticky left-36 bg-gray-50 z-20 cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center gap-2">
            Name
            {tableState.sortField === 'name' && (
              tableState.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
            )}
          </div>
        </th>
        {pinnedColumns.filter(col => col.id !== 'name').map((column) => (
          <th
            key={column.id}
            className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 sticky bg-gray-50 z-20 cursor-pointer hover:bg-gray-100"
            style={{ left: `${240}px` }}
            onClick={() => onSort(column.field as string)}
          >
            <div className="flex items-center gap-2">
              {column.label}
              {tableState.sortField === column.field && (
                tableState.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </div>
          </th>
        ))}
        {unpinnedColumns.map((column) => (
          <th
            key={column.id}
            className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100"
            onClick={() => onSort(column.field as string)}
          >
            <div className="flex items-center gap-2">
              {column.label}
              {tableState.sortField === column.field && (
                tableState.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  if (!tableState.groupBy) {
    return (
      <div className="overflow-auto flex-1">
        <table className="w-full">
          {renderHeader()}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={leads.map(lead => lead.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {leads.map((lead) => (
                  <SortableRow
                    key={lead.id}
                    lead={lead}
                    columns={columns}
                    onOpenDetail={onOpenDetail}
                    onUpdateLead={onUpdateLead}
                    selected={selectedIds.has(lead.id)}
                    onToggleSelect={() => toggleSelect(lead.id)}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full">
        {renderHeader()}
        <tbody>
          {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => {
            const isExpanded = expandedGroups.has(groupKey);
            return (
              <>
                <tr
                  key={`group-${groupKey}`}
                  className="bg-gray-100 border-b border-gray-300 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <td colSpan={visibleColumns.length + 3} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="text-sm">
                        {groupKey} ({groupLeads.length})
                      </span>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={groupLeads.map(lead => lead.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {groupLeads.map((lead) => (
                        <SortableRow
                          key={lead.id}
                          lead={lead}
                          columns={columns}
                          onOpenDetail={onOpenDetail}
                          onUpdateLead={onUpdateLead}
                          selected={selectedIds.has(lead.id)}
                          onToggleSelect={() => toggleSelect(lead.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
