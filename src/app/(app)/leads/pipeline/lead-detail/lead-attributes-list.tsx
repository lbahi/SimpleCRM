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

/**
 * Canonical ordered list of built-in fields shown in the attributes panel.
 * "name" and "phone" are excluded — they appear in the header instead.
 */
const ORDERED_ATTR_COLUMNS: ColumnId[] = [
  "status", "rating", "assignedTo", "sources", "lastContacted",
];

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
  const { columnOrder, allAvailableColumns, reorderColumns } =
    useColumnStateContext();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const orderedCols = useMemo<AttributeColumn[]>(() => {
    // Built-in fields in canonical order (always shown, matching reference)
    const builtIn: AttributeColumn[] = ORDERED_ATTR_COLUMNS.map((id) => ({
      id,
      label: resolveLabel(id, allAvailableColumns),
    }));

    // Append any custom_ columns from columnOrder
    const customCols: AttributeColumn[] = columnOrder
      .filter((id) => typeof id === "string" && id.startsWith("custom_"))
      .map((id): AttributeColumn => ({
        id: id as ColumnId,
        label: resolveLabel(id as ColumnId, allAvailableColumns),
      }));

    return [...builtIn, ...customCols];
  }, [columnOrder, allAvailableColumns]);

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
    <DndContext
      id="attr-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={colIds} strategy={verticalListSortingStrategy}>
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {orderedCols.map((col) => (
            <AttributeRow
              key={col.id}
              col={col}
              lead={lead}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
