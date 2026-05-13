// SimpleCRM — use-column-state.ts
import { useState, useEffect, useMemo } from "react";
import { ColumnId, COLUMN_DEFS, DEFAULT_VISIBLE_COLUMNS } from "../model";
import { Type, Hash, Calendar, CheckSquare, List, Star, Link as LinkIcon, Sparkles } from "lucide-react";

const DEFAULT_WIDTHS: Record<string, number> = {
  name: 200,
  phone: 140,
  salesStatus: 140,
  location: 120,
  endDate: 140,
  rating: 100,
  owner: 160,
  email: 190,
  industry: 120,
  companySize: 120,
  amount: 110,
  company: 220,
  progress: 160,
  createdAt: 160,
  commentsCount: 110,
  lastActivity: 150,
  sources: 160,
  notePreview: 200,
};

const TYPE_ICONS: Record<string, any> = {
  Text: Type,
  Number: Hash,
  Date: Calendar,
  Checkbox: CheckSquare,
  Select: List,
  Rating: Star,
  URL: LinkIcon,
};

export function useColumnState() {
  const [visibleColumns, setVisibleColumns] = useState<ColumnId[]>(DEFAULT_VISIBLE_COLUMNS);
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(COLUMN_DEFS.map((col) => col.id));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS);
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({});
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [customColumns, setCustomColumns] = useState<any[]>([]);

  useEffect(() => {
    const savedOrder = localStorage.getItem("simpleCRM_columnOrder");
    const savedWidths = localStorage.getItem("simpleCRM_columnWidths");
    const savedVisible = localStorage.getItem("simpleCRM_columnVisibility");
    const savedLabels = localStorage.getItem("simpleCRM_columnLabels");
    const savedCustom = localStorage.getItem("simpleCRM_customColumns");
    const savedPinned = localStorage.getItem("simpleCRM_pinnedColumns");

    if (savedOrder) setColumnOrder(JSON.parse(savedOrder));
    if (savedWidths) setColumnWidths(JSON.parse(savedWidths));
    if (savedVisible) setVisibleColumns(JSON.parse(savedVisible));
    if (savedLabels) setColumnLabels(JSON.parse(savedLabels));
    if (savedCustom) setCustomColumns(JSON.parse(savedCustom));
    if (savedPinned) setPinnedColumns(JSON.parse(savedPinned));
  }, []);

  const allAvailableColumns = useMemo(() => {
    const custom = customColumns.map(col => ({
      id: col.id as ColumnId,
      label: col.label,
      icon: TYPE_ICONS[col.type] || Type,
      width: "min-w-[150px]",
      isCustom: true,
      type: col.type,
      options: col.options
    }));
    return [...COLUMN_DEFS, ...custom];
  }, [customColumns]);

  const addCustomColumn = (attr: any) => {
    const next = [...customColumns, attr];
    setCustomColumns(next);
    localStorage.setItem("simpleCRM_customColumns", JSON.stringify(next));
    
    const nextOrder = [...columnOrder, attr.id as ColumnId];
    setColumnOrder(nextOrder);
    localStorage.setItem("simpleCRM_columnOrder", JSON.stringify(nextOrder));
    
    toggleVisibility(attr.id as ColumnId);
  };

  const setLabel = (columnId: string, label: string) => {
    const next = { ...columnLabels, [columnId]: label };
    setColumnLabels(next);
    localStorage.setItem("simpleCRM_columnLabels", JSON.stringify(next));
  };

  const toggleVisibility = (columnId: ColumnId) => {
    setVisibleColumns((prev) => {
      const next = prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId];
      localStorage.setItem("simpleCRM_columnVisibility", JSON.stringify(next));
      return next;
    });
  };

  const reorderColumns = (newOrder: ColumnId[]) => {
    setColumnOrder(newOrder);
    localStorage.setItem("simpleCRM_columnOrder", JSON.stringify(newOrder));
  };

  const resizeColumn = (columnId: string, width: number) => {
    const next = { ...columnWidths, [columnId]: Math.max(80, width) };
    setColumnWidths(next);
    localStorage.setItem("simpleCRM_columnWidths", JSON.stringify(next));
  };

  const pinColumn = (columnId: string) => {
    const next = pinnedColumns.includes(columnId)
      ? pinnedColumns.filter((id) => id !== columnId)
      : [...pinnedColumns, columnId];
    setPinnedColumns(next);
    localStorage.setItem("simpleCRM_pinnedColumns", JSON.stringify(next));
  };

  return {
    visibleColumns,
    setVisibleColumns,
    columnOrder,
    setColumnOrder,
    columnWidths,
    columnLabels,
    pinnedColumns,
    allAvailableColumns,
    toggleVisibility,
    reorderColumns,
    resizeColumn,
    pinColumn,
    setLabel,
    addCustomColumn,
  };
}

export type ColumnState = ReturnType<typeof useColumnState>;
