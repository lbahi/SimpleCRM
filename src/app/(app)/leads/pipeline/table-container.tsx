// SimpleCRM — table-container
"use client";

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TableHeader } from './table-header';
import { LeadRow } from './rows/lead-row';
import { GhostRow } from './rows/ghost-row';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ColumnId, PipelineLead, ColumnDef } from './model';
import { getFieldValue, valueToString } from './model.utils';
import { InlineRowState } from './hooks/use-inline-row';
import { TableState } from './hooks/use-table-state';
import * as React from 'react';



interface TableContainerProps {
  leads: PipelineLead[];
  columnState: {
    columnOrder: ColumnId[];
    allAvailableColumns: ColumnDef[];
    visibleColumns: ColumnId[];
    pinnedColumns: string[];
    columnWidths: Record<string, number>;
    columnLabels: Record<string, string>;
    resizeColumn: (id: string, w: number) => void;
    toggleVisibility: (id: ColumnId) => void;
    setLabel: (id: string, label: string) => void;
    pinColumn: (id: string) => void;
    deleteCustomColumn: (id: string) => void;
  };
  tableState: TableState;
  inlineRow: InlineRowState;
  onUpdateField: (lead: PipelineLead, field: ColumnId, value: unknown) => void | Promise<void>;
  onSortChange: (field: ColumnId, direction: 'asc' | 'desc') => void;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  onExpand: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserRole: string;
  currentUserId: string;
}

export function TableContainer({
  leads,
  columnState,
  tableState,
  inlineRow,
  onUpdateField,
  onSortChange,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  onExpand,
  onDuplicate,
  onDelete,
  currentUserRole,
  currentUserId,
}: TableContainerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ leadId: string; column: ColumnId } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleStartEdit = (lead: PipelineLead, column: ColumnId) => {
    setEditingCell({ leadId: lead.id, column });
    setEditingValue(valueToString(getFieldValue(lead, column)));
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const lead = leads.find(l => l.id === editingCell.leadId);
    if (lead) await onUpdateField(lead, editingCell.column, editingValue);
    setEditingCell(null);
  };

  const groupedLeads = useMemo(() => {
    if (!tableState.groupBy) return { ungrouped: leads };
    const groups: Record<string, PipelineLead[]> = {};
    leads.forEach((lead: PipelineLead) => {
      const val = getFieldValue(lead, tableState.groupBy as ColumnId);
      const groupKey = valueToString(val) || 'Unassigned';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(lead);
    });
    return groups;
  }, [leads, tableState.groupBy]);

  const orderedVisibleColumns = useMemo(() => {
    return columnState.columnOrder
      .map((id: ColumnId) => columnState.allAvailableColumns.find((c: ColumnDef) => c.id === id))
      .filter((c): c is ColumnDef => !!c && columnState.visibleColumns.includes(c.id));
  }, [columnState.columnOrder, columnState.allAvailableColumns, columnState.visibleColumns]);

  const pinnedOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let currentOffset = 48; // drag handle (48)
    columnState.columnOrder.forEach((id: ColumnId) => {
      if (columnState.pinnedColumns.includes(id) && columnState.visibleColumns.includes(id)) {
        offsets[id] = currentOffset;
        currentOffset += columnState.columnWidths[id] || 150;
      }
    });
    return offsets;
  }, [columnState.columnOrder, columnState.pinnedColumns, columnState.visibleColumns, columnState.columnWidths]);

  const rowProps = {
    columns: orderedVisibleColumns.map((c: ColumnDef) => c.id),
    columnWidths: columnState.columnWidths,
    selectedDetailId: null,
    onToggleSelection,
    onExpand,
    editingCell,
    editingValue,
    onStartEdit: handleStartEdit,
    onChangeEditingValue: setEditingValue,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: () => setEditingCell(null),
    onUpdateField,
    pinnedColumns: columnState.pinnedColumns,
    pinnedOffsets,
    onDuplicate,
    onDelete,
    currentUserRole,
    currentUserId,
  };

  const leadIds = useMemo(() => leads.map(l => l.id), [leads]);

  // DEV-ONLY alignment guard
  if (process.env.NODE_ENV === "development" && typeof document !== "undefined") {
    const headerCount = orderedVisibleColumns.length + 2; // +drag +expand
    const actualThCount = document.querySelectorAll("thead tr th").length;
    // We only assert if the elements actually exist in the DOM (to avoid false positives on first render)
    if (actualThCount > 0) {
      console.assert(
        actualThCount === headerCount,
        `Column mismatch: header has ${actualThCount} th but expected ${headerCount}`
      );
    }
  }

  return (
    <TooltipProvider delay={100}>
      <div className="overflow-auto flex-1 bg-white rounded-lg border border-gray-100">
        <table className="border-collapse" style={{ tableLayout: "fixed", width: "max-content", minWidth: "100%" }}>
          <TableHeader 
            orderedVisibleColumns={orderedVisibleColumns}
            columnState={columnState}
            tableState={tableState}
            pinnedOffsets={pinnedOffsets}
            onSortChange={onSortChange}
            selectedIds={selectedIds}
            leadsCount={leads.length}
            onToggleAll={onToggleAll}
          />
          <tbody>
            {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => {
              const groupItems = groupKey === 'ungrouped' ? leadIds : groupLeads.map(l => l.id);
              return (
                <React.Fragment key={groupKey}>
                  {groupKey !== 'ungrouped' && (
                    <tr className="bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100" onClick={() => {
                      const next = new Set(expandedGroups);
                      if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
                      setExpandedGroups(next);
                    }}>
                      <td colSpan={orderedVisibleColumns.length + 3} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {expandedGroups.has(groupKey) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{groupKey} ({groupLeads.length})</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {(groupKey === 'ungrouped' || expandedGroups.has(groupKey)) && (
                    <SortableContext items={groupItems} strategy={verticalListSortingStrategy}>
                      {groupLeads.map((lead, idx) => (
                        <LeadRow key={lead.id} lead={lead} rowIndex={idx} isSelected={selectedIds.has(lead.id)} {...rowProps} />
                      ))}
                    </SortableContext>
                  )}
                </React.Fragment>
              );
            })}
            <GhostRow columns={rowProps.columns} columnWidths={rowProps.columnWidths} state={inlineRow} pinnedColumns={rowProps.pinnedColumns} pinnedOffsets={rowProps.pinnedOffsets} isAdmin={currentUserRole === "ADMIN"} />
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
