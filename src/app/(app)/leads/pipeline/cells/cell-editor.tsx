// SimpleCRM — cell-editor.tsx
"use client";

import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ColumnId } from "../model";
import { useColumnStateContext } from "../context/column-state-context";

interface CellEditorProps {
  column: ColumnId;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CellEditor({
  column,
  value,
  onChange,
  onSave,
  onCancel,
}: CellEditorProps) {
  const { allAvailableColumns } = useColumnStateContext();
  const customDef = allAvailableColumns.find((c: any) => c.id === column);

  if (column === "createdAt" || column === "lastContacted" || (customDef?.type === "Date")) {
    return (
      <DatePicker
        value={value}
        onChange={(date) => { onChange(date); onSave(); }}
        placeholder="Select date"
        className="h-8 text-xs"
      />
    );
  }

  return (
    <Input
      autoFocus
      value={value}
      type="text"
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="h-8 text-xs"
    />
  );
}
