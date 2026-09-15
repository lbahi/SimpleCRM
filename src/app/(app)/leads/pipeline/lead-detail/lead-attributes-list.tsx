// SimpleCRM — lead-attributes-list
"use client";

import React, { useMemo } from "react";
import { useColumnStateContext } from "../context/column-state-context";
import { COLUMN_DEFS, type ColumnId, type PipelineLead } from "../model";
import { AttributeRow, type AttributeColumn } from "./attribute-row";

// ─── Constants ───────────────────────────────────────────────

/**
 * Canonical ordered list of built-in fields shown in the attributes panel.
 */
const ORDERED_ATTR_COLUMNS: ColumnId[] = [
  "name",
  "phone",
  "location",
  "status",
  "rating",
  "assignedTo",
  "sources",
  "lastContacted",
  "createdAt",
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

const LeadAttributesListUI = React.memo(function LeadAttributesListUI({
  lead,
  onUpdate,
  columnOrder,
  allAvailableColumns,
}: LeadAttributesListProps & {
  columnOrder: (ColumnId | string)[];
  allAvailableColumns: { id: string; label: string }[];
}) {
  const orderedCols = useMemo<AttributeColumn[]>(() => {
    // Built-in fields in canonical order
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

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <div className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold px-6 py-3 border-b border-neutral-100 bg-neutral-50/50">
        Attributes
      </div>
      <div className="flex flex-col">
        {orderedCols.map((col) => (
          <AttributeRow
            key={col.id}
            col={col}
            lead={lead}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
});

export function LeadAttributesList(props: LeadAttributesListProps) {
  const { columnOrder, allAvailableColumns } = useColumnStateContext();
  return (
    <LeadAttributesListUI
      {...props}
      columnOrder={columnOrder}
      allAvailableColumns={allAvailableColumns}
    />
  );
}
