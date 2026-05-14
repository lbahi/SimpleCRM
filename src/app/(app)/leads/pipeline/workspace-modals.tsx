// SimpleCRM — workspace-modals.tsx
"use client";

import { FilterDialog } from "./dialogs/filter-dialog";
import { CustomizeDialog } from "./dialogs/customize-dialog";
import { CreateLeadDialog } from "../create-lead-dialog";
import { LeadDetailModal } from "./lead-detail/lead-detail-modal";
import { CustomAttributeDialog } from "./dialogs/custom-attribute-dialog";
import { TableState } from "./hooks/use-table-state";
import { ColumnState } from "./hooks/use-column-state";
import { PipelineLead, ColumnId } from "./model";

interface WorkspaceModalsProps {
  modals: {
    showCreate: boolean;
    setShowCreate: (v: boolean) => void;
    showFilter: boolean;
    setShowFilter: (v: boolean) => void;
    showCustomize: boolean;
    setShowCustomize: (v: boolean) => void;
    showCustomAttr: boolean;
    setShowCustomAttr: (v: boolean) => void;
  };
  tableState: TableState;
  columnState: ColumnState;
  leads: PipelineLead[];
  selectedLead: PipelineLead | null;
  onCloseDetail: () => void;
  onNavigate: (id: string) => void;
  onUpdateField: any;
  onRefresh: () => Promise<void>;
}

export function WorkspaceModals({
  modals,
  tableState,
  columnState,
  leads,
  selectedLead,
  onCloseDetail,
  onNavigate,
  onUpdateField,
  onRefresh,
}: WorkspaceModalsProps) {
  const moveColumn = (columnId: ColumnId, direction: "up" | "down") => {
    const { columnOrder, reorderColumns } = columnState;
    const idx = columnOrder.indexOf(columnId);
    if (idx < 0) return;
    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= columnOrder.length) return;
    const next = [...columnOrder];
    const [item] = next.splice(idx, 1);
    next.splice(nextIdx, 0, item);
    reorderColumns(next);
  };

  return (
    <>
      <FilterDialog
        open={modals.showFilter}
        onOpenChange={modals.setShowFilter}
        draftFilters={tableState.draftFilters}
        onDraftChange={tableState.setDraftFilters}
        onApply={() => { tableState.setFilters(tableState.draftFilters); modals.setShowFilter(false); }}
        onClear={() => {
          const empty = { name: "", phone: "", location: "", assignedTo: "", status: "", rating: "" };
          tableState.setFilters(empty); tableState.setDraftFilters(empty); modals.setShowFilter(false);
        }}
      />
      <CustomizeDialog
        open={modals.showCustomize}
        onOpenChange={modals.setShowCustomize}
        visibleColumns={columnState.allAvailableColumns}
        visibleColumnIds={columnState.visibleColumns}
        columnOrder={columnState.columnOrder}
        onToggleVisibility={columnState.toggleVisibility}
        onMoveColumn={moveColumn}
        onReorderColumns={columnState.reorderColumns}
      />
      <CustomAttributeDialog
        open={modals.showCustomAttr}
        onOpenChange={modals.setShowCustomAttr}
        onSave={columnState.addCustomColumn}
      />
      <CreateLeadDialog
        open={modals.showCreate}
        onClose={() => modals.setShowCreate(false)}
        onCreated={async () => { modals.setShowCreate(false); await onRefresh(); }}
      />
      <LeadDetailModal
        key={selectedLead?.id ?? "modal"}
        open={!!selectedLead}
        lead={selectedLead}
        onClose={onCloseDetail}
        onUpdateField={onUpdateField}
      />
    </>
  );
}
