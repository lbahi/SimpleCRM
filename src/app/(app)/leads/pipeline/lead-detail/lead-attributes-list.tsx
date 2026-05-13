// SimpleCRM — lead-attributes-list
"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useColumnStateContext } from "../context/column-state-context";
import { COLUMN_DEFS, type ColumnId, type PipelineLead } from "../model";
import { AttributeRow, type AttributeColumn } from "./attribute-row";

// ─── Constants ───────────────────────────────────────────────

/** Always visible in the modal regardless of table column visibility */
const FALLBACK_COLUMNS: ColumnId[] = ["status", "rating", "assignedTo"];

/** Excluded from attribute list — shown in the header section instead */
const HEADER_COLUMNS = new Set<ColumnId>(["name", "phone"]);

// ─── Helpers ─────────────────────────────────────────────────

function resolveLabel(id: ColumnId, allAvailable: { id: string; label: string }[]): string {
  return (
    allAvailable.find((c) => c.id === id)?.label ??
    COLUMN_DEFS.find((c) => c.id === id)?.label ??
    id
  );
}

// ─── Component ───────────────────────────────────────────────

interface LeadAttributesListProps {
  lead: PipelineLead;
  onUpdate: (field: ColumnId, value: unknown) => void;
}

export function LeadAttributesList({ lead, onUpdate }: LeadAttributesListProps) {
  const { visibleColumns, columnOrder, allAvailableColumns, reorderColumns } =
    useColumnStateContext();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const orderedCols = useMemo<AttributeColumn[]>(() => {
    const visibleSet = new Set(visibleColumns);

    const base = columnOrder
      .filter((id) => visibleSet.has(id) && !HEADER_COLUMNS.has(id))
      .map((id): AttributeColumn => ({ id: id as ColumnId, label: resolveLabel(id as ColumnId, allAvailableColumns) }));

    // All columns hidden → fallback to guaranteed three
    if (base.length === 0) {
      return FALLBACK_COLUMNS.map((id) => ({ id, label: resolveLabel(id, allAvailableColumns) }));
    }

    // Ensure fallback columns always appear even if table-hidden
    const baseIds = new Set(base.map((c) => c.id));
    const missing = FALLBACK_COLUMNS
      .filter((id) => !baseIds.has(id) && !HEADER_COLUMNS.has(id))
      .map((id): AttributeColumn => ({ id, label: resolveLabel(id, allAvailableColumns) }));

    return [...missing, ...base];
  }, [visibleColumns, columnOrder, allAvailableColumns]);

  const isFallback =
    visibleColumns.filter((id) => !HEADER_COLUMNS.has(id)).length === 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = columnOrder.indexOf(active.id as ColumnId);
    const newIdx = columnOrder.indexOf(over.id as ColumnId);
    if (oldIdx === -1 || newIdx === -1) return;
    reorderColumns(arrayMove([...columnOrder], oldIdx, newIdx));
  };

  const colIds = orderedCols.map((c) => c.id);

  return (
    <div className="flex flex-col py-1">
      <DndContext
        id="attr-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={colIds} strategy={verticalListSortingStrategy}>
          {orderedCols.map((col, i) => (
            <div key={col.id}>
              <AttributeRow col={col} lead={lead} onUpdate={onUpdate} />
              {i < orderedCols.length - 1 && (
                <div className="mx-3 border-b border-neutral-50" />
              )}
            </div>
          ))}
        </SortableContext>
      </DndContext>

      {isFallback && (
        <p className="mt-2 px-3 text-[11px] text-neutral-400">
          Add more fields via the pipeline table columns
        </p>
      )}
    </div>
  );
}
