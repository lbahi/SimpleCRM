// SimpleCRM — cell-editor.tsx
"use client";

import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ColumnId } from "../model";

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
  if (column === "createdAt" || column === "lastContacted") {
    return (
      <DatePicker
        value={value}
        onChange={(date) => onChange(date)}
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
