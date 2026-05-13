// SimpleCRM — table-container (Replicated from reference/LeadsTable.tsx)
"use client";

import { useState, useMemo } from 'react';
import { StatusCell, RatingCell } from './cells/reference-cells';
import { MemberCell } from '@/app/(app)/leads/pipeline/cells/member-cell'; // Using existing or creating one
import { SourceCell } from '@/app/(app)/leads/pipeline/cells/source-cell'; // Using existing or creating one
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

// Adapter for project types
import { Lead } from '@prisma/client';

interface TableContainerProps {
  leads: any[];
  columnState: any;
  tableState: any;
  inlineRow: any;
  onUpdateField: (id: string, field: string, value: any) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onExpand: (id: string) => void;
}

function SortableRow({ 
  lead, 
  columns, 
  onOpenDetail, 
  onUpdateLead, 
  selected, 
  onToggleSelect 
}: any) {
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

  const handleStartEdit = (column: any, currentValue: any) => {
    setEditingField(column.id);
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = (field: string) => {
    if (editValue !== String(lead[field] || '')) {
      onUpdateLead(lead.id, field, editValue);
    }
    setEditingField(null);
    setEditValue('');
  };

  const renderCell = (column: any) => {
    const value = lead[column.id];
    const isEditing = editingField === column.id;

    if (column.id === 'status') return <StatusCell status={lead.status} />;
    if (column.id === 'rating') return <RatingCell rating={lead.rating || 0} onChange={(val) => onUpdateLead(lead.id, 'rating', val)} />;
    
    // Member Cell adaptation
    if (column.id === 'assignedTo') return <div className="flex items-center gap-2 text-sm">{lead.assignedTo || 'Unassigned'}</div>;
    
    // Source Cell adaptation
    if (column.id === 'source') return <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{lead.source}</span>;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(column.id)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(column.id)}
          className="w-full px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <span
        className="text-sm cursor-text hover:bg-gray-100 px-2 py-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleStartEdit(column, value);
        }}
      >
        {String(value || '')}
      </span>
    );
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}
    >
      <td className="px-4 py-3 w-12 sticky left-0 bg-inherit z-10">
        <button className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical size={16} className="text-gray-400" />
        </button>
      </td>
      <td className="px-4 py-3 w-12 sticky left-12 bg-inherit z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(lead.id)}
          className="size-4 rounded border-gray-300"
        />
      </td>
      <td className="px-4 py-3 w-12 sticky left-24 bg-inherit z-10">
        <button
          onClick={() => onOpenDetail(lead.id)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <Info size={16} className="text-gray-600" />
        </button>
      </td>
      {columns.filter((c: any) => !c.hidden).map((column: any) => (
        <td key={column.id} className="px-4 py-3">
          {renderCell(column)}
        </td>
      ))}
    </tr>
  );
}

export function TableContainer({
  leads,
  columnState,
  tableState,
  onUpdateField,
  onSortChange,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onExpand,
}: TableContainerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupedLeads = useMemo(() => {
    if (!tableState.groupBy) return { ungrouped: leads };
    const groups: Record<string, any[]> = {};
    leads.forEach(lead => {
      const groupKey = String(lead[tableState.groupBy] || 'Unassigned');
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(lead);
    });
    return groups;
  }, [leads, tableState.groupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) newExpanded.delete(groupKey);
    else newExpanded.add(groupKey);
    setExpandedGroups(newExpanded);
  };

  const renderHeader = () => (
    <thead className="bg-gray-50 sticky top-0 z-20">
      <tr className="border-b border-gray-200">
        <th className="px-4 py-3 w-12 sticky left-0 bg-gray-50 z-20"></th>
        <th className="px-4 py-3 w-12 sticky left-12 bg-gray-50 z-20">
          <input
            type="checkbox"
            checked={selectedIds.size === leads.length && leads.length > 0}
            onChange={onToggleAll}
            className="size-4 rounded border-gray-300"
          />
        </th>
        <th className="px-4 py-3 w-12 sticky left-24 bg-gray-50 z-20"></th>
        {columnState.visibleColumns.filter((c: any) => !c.hidden).map((column: any) => (
          <th
            key={column.id}
            className="px-4 py-3 text-left text-xs uppercase tracking-wider text-gray-600 cursor-pointer hover:bg-gray-100 font-bold"
            onClick={() => onSortChange(column.id, tableState.sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            <div className="flex items-center gap-2">
              {column.label}
              {tableState.sortField === column.id && (
                tableState.sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="overflow-auto flex-1 bg-white rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        {renderHeader()}
        <tbody>
          {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => {
            if (groupKey === 'ungrouped') {
              return groupLeads.map((lead) => (
                <SortableRow
                  key={lead.id}
                  lead={lead}
                  columns={columnState.visibleColumns}
                  onOpenDetail={onExpand}
                  onUpdateLead={onUpdateField}
                  selected={selectedIds.has(lead.id)}
                  onToggleSelect={onToggleSelection}
                />
              ));
            }
            const isExpanded = expandedGroups.has(groupKey);
            return (
              <>
                <tr
                  key={`group-${groupKey}`}
                  className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <td colSpan={columnState.visibleColumns.length + 3} className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        {groupKey} ({groupLeads.length})
                      </span>
                    </div>
                  </td>
                </tr>
                {isExpanded && groupLeads.map((lead) => (
                  <SortableRow
                    key={lead.id}
                    lead={lead}
                    columns={columnState.visibleColumns}
                    onOpenDetail={onExpand}
                    onUpdateLead={onUpdateField}
                    selected={selectedIds.has(lead.id)}
                    onToggleSelect={onToggleSelection}
                  />
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
