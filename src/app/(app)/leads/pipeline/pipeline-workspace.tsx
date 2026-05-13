// SimpleCRM — pipeline-workspace
"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { PaginatedLeads } from "@/modules/leads/leads.types";
import { useColumnStateContext } from "./context/column-state-context";
import { ColumnStateProvider } from "./context/column-state-context";
import { useTableState } from "./hooks/use-table-state";
import { useLeads } from "./hooks/use-leads";
import { useInlineRow } from "./hooks/use-inline-row";
import { useWorkspaceDnd } from "./hooks/use-workspace-dnd";
import { PipelineToolbar } from "./toolbar/pipeline-toolbar";
import { TableContainer } from "./table-container";
import { WorkspaceModals } from "./workspace-modals";

function PipelineWorkspaceInner({ initialData }: { initialData: PaginatedLeads }) {
  const columnState = useColumnStateContext();
  const tableState = useTableState();
  const { sortedLeads, persistFieldChange, refreshLeads, reorderLeads, clearManualOrder } = useLeads(initialData, tableState);
  const inlineRow = useInlineRow(refreshLeads);
  const { sensors, handleDragEnd } = useWorkspaceDnd(sortedLeads, reorderLeads, columnState.columnOrder, columnState.reorderColumns);

  const [showCreate, setShowCreate] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showCustomAttr, setShowCustomAttr] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedLead = sortedLeads.find((l) => l.id === selectedDetailId) || null;

  const handleSortChange = (field: any, direction: "asc" | "desc") => {
    clearManualOrder();
    tableState.setSort(field, direction);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === sortedLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sortedLeads.map((l) => l.id)));
  };

  return (
    <DndContext id="pipeline-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <PipelineToolbar
          tableState={tableState}
          columnState={columnState}
          onShowCreate={() => setShowCreate(true)}
          onShowFilter={() => { tableState.setDraftFilters(tableState.filters); setShowFilter(true); }}
          onShowCustomize={() => setShowCustomize(true)}
          onRefreshLeads={refreshLeads}
        />
        <div className="flex-1 overflow-hidden flex flex-col">
          <TableContainer
            leads={sortedLeads}
            columnState={columnState}
            tableState={tableState}
            inlineRow={inlineRow}
            onUpdateField={persistFieldChange}
            onSortChange={handleSortChange}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onToggleAll={handleToggleAll}
            onExpand={setSelectedDetailId}
          />
        </div>
        <WorkspaceModals
          modals={{ showCreate, setShowCreate, showFilter, setShowFilter, showCustomize, setShowCustomize, showCustomAttr, setShowCustomAttr }}
          tableState={tableState}
          columnState={columnState}
          leads={sortedLeads}
          selectedLead={selectedLead}
          onCloseDetail={() => setSelectedDetailId(null)}
          onNavigate={setSelectedDetailId}
          onUpdateField={persistFieldChange}
          onRefresh={refreshLeads}
        />
      </div>
    </DndContext>
  );
}

export function PipelineWorkspace({ initialData }: { initialData: PaginatedLeads }) {
  return (
    <ColumnStateProvider>
      <PipelineWorkspaceInner initialData={initialData} />
    </ColumnStateProvider>
  );
}

