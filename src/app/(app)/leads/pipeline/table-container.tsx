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
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ColumnHeader } from './columns/column-header';
import { CSS } from '@dnd-kit/utilities';
import { LeadRow } from './rows/lead-row';

import { useColumnStateContext } from './context/column-state-context';
import { PipelineLead, ColumnId } from './model';

interface TableContainerProps {
  leads: PipelineLead[];
  columnState: any;
  tableState: any;
  inlineRow: any;
  onUpdateField: (lead: PipelineLead, field: ColumnId, value: any) => void | Promise<void>;
  onSortChange: (field: ColumnId, direction: 'asc' | 'desc') => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onExpand: (id: string) => void;
  currentUserRole: string;
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
  currentUserRole,
}: TableContainerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ leadId: string; column: ColumnId } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleStartEdit = (lead: PipelineLead, column: ColumnId) => {
    setEditingCell({ leadId: lead.id, column });
    setEditingValue(String((lead as any)[column] || ""));
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const lead = leads.find(l => l.id === editingCell.leadId);
    if (lead) {
      await onUpdateField(lead, editingCell.column, editingValue);
    }
    setEditingCell(null);
  };

  const groupedLeads = useMemo(() => {
    if (!tableState.groupBy) return { ungrouped: leads };
    const groups: Record<string, any[]> = {};
    leads.forEach((lead: PipelineLead) => {
      const groupKey = String((lead as any)[tableState.groupBy] || 'Unassigned');
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

  const orderedVisibleColumns = useMemo(() => {
    return columnState.columnOrder
      .map((id: ColumnId) => columnState.allAvailableColumns.find((c: any) => c.id === id))
      .filter((c: any) => c && columnState.visibleColumns.includes(c.id));
  }, [columnState.columnOrder, columnState.allAvailableColumns, columnState.visibleColumns]);

  const renderHeader = () => (
    <thead className="bg-gray-50 sticky top-0 z-20">
      <tr className="border-b border-gray-200">
        <td className="sticky left-0 z-30 w-12 cursor-grab border-b border-r border-neutral-200 bg-gray-50 px-1 text-center transition-all duration-200 hover:bg-neutral-50 active:cursor-grabbing"></td>
        <th className="w-12 sticky left-12 bg-gray-50 z-30 border-b border-neutral-100" style={{ width: 48, left: 48 }}>
          <div className="flex items-center justify-center h-full">
            <input
              type="checkbox"
              checked={selectedIds.size === leads.length && leads.length > 0}
              onChange={onToggleAll}
              className="size-4 rounded border-gray-300"
            />
          </div>
        </th>
        <SortableContext 
          items={orderedVisibleColumns.map((c: any) => c!.id)} 
          strategy={horizontalListSortingStrategy}
        >
          {orderedVisibleColumns.map((column: any, idx: number) => {
            const isPinned = columnState.pinnedColumns.includes(column.id);
            const left = isPinned ? 96 : 0; 

            return (
              <ColumnHeader
                key={column.id}
                columnId={column.id}
                label={columnState.columnLabels[column.id] || column.label}
                sortField={tableState.sortField}
                sortDirection={tableState.sortDirection}
                onSort={(id: ColumnId) => onSortChange(id, tableState.sortDirection === 'asc' ? 'desc' : 'asc')}
                width={columnState.columnWidths[column.id] || 150}
                onResize={(w) => columnState.resizeColumn(column.id, w)}
                onAction={(id, action, payload) => {
                  if (action === 'hide') columnState.toggleVisibility(id);
                  if (action === 'rename') columnState.setLabel(id, payload);
                }}
                isPinned={isPinned}
                pinnedLeft={left}
              />
            );
          })}
        </SortableContext>
        <th className="w-12 sticky right-0 bg-gray-50 z-30 border-b border-neutral-100 border-l" style={{ width: 48, right: 0 }}></th>
      </tr>
    </thead>
  );

  return (
    <div className="overflow-auto flex-1 bg-white rounded-lg border border-gray-200">
      <table
        className="border-collapse"
        style={{
          tableLayout: "fixed",
          width: Math.max(
            orderedVisibleColumns.reduce(
              (sum: number, col: any) => sum + (columnState.columnWidths[col.id ?? col] || 150),
              48 * 3   // drag handle + checkbox + expand (w-12 each)
            ),
            800            // minimum table width
          ),
        }}
      >
        <colgroup><col style={{ width: 48 }} /><col style={{ width: 48 }} />{orderedVisibleColumns.map((col: any) => (<col key={col.id ?? col} style={{ width: columnState.columnWidths[col.id ?? col] || 150 }} />))}<col style={{ width: 48 }} /></colgroup>
        {renderHeader()}
        <tbody>
          {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => {
            if (groupKey === 'ungrouped') {
              return (
                <SortableContext 
                  key="ungrouped-context"
                  items={leads.map(l => l.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {groupLeads.map((lead, idx) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      rowIndex={idx}
                      columns={orderedVisibleColumns.map((c: any) => c.id)}
                      columnWidths={columnState.columnWidths}
                      selectedDetailId={null} // Will be handled by onExpand
                      isSelected={selectedIds.has(lead.id)}
                      onToggleSelection={onToggleSelection}
                      onExpand={onExpand}
                      editingCell={editingCell}
                      editingValue={editingValue}
                      onStartEdit={handleStartEdit}
                      onChangeEditingValue={setEditingValue}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => setEditingCell(null)}
                      onUpdateField={onUpdateField}
                      pinnedColumns={columnState.pinnedColumns}
                      pinnedOffsets={{}} // To be calculated if needed
                      currentUserRole={currentUserRole}
                    />
                  ))}
                </SortableContext>
              );
            }
            const isExpanded = expandedGroups.has(groupKey);
            return (
              <>
                <tr
                  key={`group-${groupKey}`}
                  className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <td colSpan={(orderedVisibleColumns.length + 3) as number} className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        {groupKey} ({groupLeads.length})
                      </span>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <SortableContext 
                    key={`group-context-${groupKey}`}
                    items={groupLeads.map(l => l.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                  {groupLeads.map((lead, idx) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      rowIndex={idx}
                      columns={orderedVisibleColumns.map((c: any) => c.id)}
                      columnWidths={columnState.columnWidths}
                      selectedDetailId={null}
                      isSelected={selectedIds.has(lead.id)}
                      onToggleSelection={onToggleSelection}
                      onExpand={onExpand}
                      editingCell={editingCell}
                      editingValue={editingValue}
                      onStartEdit={handleStartEdit}
                      onChangeEditingValue={setEditingValue}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => setEditingCell(null)}
                      onUpdateField={onUpdateField}
                      pinnedColumns={columnState.pinnedColumns}
                      pinnedOffsets={{}}
                      currentUserRole={currentUserRole}
                    />
                  ))}
                  </SortableContext>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
