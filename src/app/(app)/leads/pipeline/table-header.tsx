// SimpleCRM — table-header.tsx
"use client";

import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnHeader } from './columns/column-header';
import { ColumnId, ColumnDef } from './model';
import { toast } from 'sonner';

interface TableHeaderProps {
  orderedVisibleColumns: ColumnDef[];
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
  tableState: {
    sortField: ColumnId;
    sortDirection: 'asc' | 'desc';
  };
  pinnedOffsets: Record<string, number>;
  onSortChange: (field: ColumnId, direction: 'asc' | 'desc') => void;
  selectedIds: Set<string>;
  leadsCount: number;
  onToggleAll: () => void;
}

export function TableHeader({
  orderedVisibleColumns,
  columnState,
  tableState,
  pinnedOffsets,
  onSortChange,
  selectedIds,
  leadsCount,
  onToggleAll,
}: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 sticky top-0 z-20">
      <tr className="border-b border-gray-100">
        <th className="sticky left-0 z-30 w-12 border-b border-neutral-100 bg-gray-50 px-1 text-center" style={{ width: 48, left: 0 }}></th>

        <SortableContext 
          items={orderedVisibleColumns.map((c: ColumnDef) => c.id)} 
          strategy={horizontalListSortingStrategy}
        >
          {orderedVisibleColumns.map((column: ColumnDef) => {
            const isPinned = columnState.pinnedColumns.includes(column.id);
            const left = pinnedOffsets[column.id] || 0;

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
                  if (action === 'hide') columnState.toggleVisibility(id as ColumnId);
                  if (action === 'rename') columnState.setLabel(id, payload);
                  if (action === 'pin') columnState.pinColumn(id);
                  if (action === 'delete') {
                    columnState.deleteCustomColumn(id);
                    toast.success("Column deleted");
                  }
                  if (action === 'sort-asc') onSortChange(id, 'asc');
                  if (action === 'sort-desc') onSortChange(id, 'desc');
                }}
                isPinned={isPinned}
                pinnedLeft={left}
                isCustom={column.isCustom}
                icon={column.icon}
              />
            );
          })}
        </SortableContext>
        <th className="w-12 sticky right-0 bg-gray-50 z-30 border-b border-neutral-100 border-l" style={{ width: 48, right: 0 }}></th>
      </tr>
    </thead>
  );
}
