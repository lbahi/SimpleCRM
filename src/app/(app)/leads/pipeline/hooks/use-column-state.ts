// SimpleCRM — use-column-state.ts
import { useState, useEffect, useMemo } from "react";
import { ColumnId, COLUMN_DEFS, DEFAULT_VISIBLE_COLUMNS } from "../model";
import { Type, Hash, Calendar, CheckSquare, List, Star, Link as LinkIcon, Sparkles } from "lucide-react";

const DEFAULT_WIDTHS: Record<string, number> = {
  name: 200,
  phone: 140,
  location: 120,
  status: 140,
  rating: 100,
  assignedTo: 160,
  sources: 160,
  lastContacted: 160,
  createdAt: 160,
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

interface CustomColumnDef {
  id: string;
  label: string;
  type: string;
  options?: string[];
}

export function useColumnState() {
  const [visibleColumns, setVisibleColumns] = useState<ColumnId[]>(DEFAULT_VISIBLE_COLUMNS);
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(COLUMN_DEFS.map((col) => col.id));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS);
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({});
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumnDef[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem("simpleCRM_columnOrder");
    const savedWidths = localStorage.getItem("simpleCRM_columnWidths");
    const savedVisible = localStorage.getItem("simpleCRM_columnVisibility");
    const savedLabels = localStorage.getItem("simpleCRM_columnLabels");
    const savedCustom = localStorage.getItem("simpleCRM_customColumns");
    const savedPinned = localStorage.getItem("simpleCRM_pinnedColumns");

    if (savedWidths) setColumnWidths(JSON.parse(savedWidths));
    if (savedLabels) setColumnLabels(JSON.parse(savedLabels));
    if (savedPinned) setPinnedColumns(JSON.parse(savedPinned));
    
    let parsedCustomColumns: any[] = [];
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      // FIX 4: Cleanup any accidental custom columns with empty or single-char names
      const cleanCustom = parsed.filter(
        (c: any) => c.label && c.label.trim().length >= 2
      );
      parsedCustomColumns = cleanCustom;
      setCustomColumns(cleanCustom);
      localStorage.setItem("simpleCRM_customColumns", JSON.stringify(cleanCustom));
    }

    // ─── LocalStorage Cleanup & Sanitization ───
    const VALID_IDS = new Set([
      "name", "phone", "location", "status", "rating",
      "assignedTo", "sources", "lastContacted", "createdAt", 
      "notePreview",
      ...parsedCustomColumns.map((c: any) => c.id)
    ]);
    
    // Sanitize column order — remove any invalid IDs
    const cleanOrder = (savedOrder ? JSON.parse(savedOrder) : COLUMN_DEFS.map(c => c.id))
      .filter((id: string) => VALID_IDS.has(id) || id.startsWith("custom_"));
    
    // Ensure "name" is always first
    const nameIdx = cleanOrder.indexOf("name");
    if (nameIdx > 0) {
      cleanOrder.splice(nameIdx, 1);
      cleanOrder.unshift("name");
    } else if (nameIdx === -1) {
      cleanOrder.unshift("name");
    }
    
    // Sanitize visible columns
    const cleanVisible = (savedVisible ? JSON.parse(savedVisible) : DEFAULT_VISIBLE_COLUMNS)
      .filter((id: string) => VALID_IDS.has(id) || id.startsWith("custom_"));
    
    // Ensure "name" is always visible
    if (!cleanVisible.includes("name")) {
      cleanVisible.unshift("name");
    }
    
    setColumnOrder(cleanOrder);
    setVisibleColumns(cleanVisible);
    setIsHydrated(true);
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

  const addCustomColumn = (attr: CustomColumnDef) => {
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

  const deleteCustomColumn = (columnId: string) => {
    const nextCustom = customColumns.filter(c => c.id !== columnId);
    setCustomColumns(nextCustom);
    localStorage.setItem("simpleCRM_customColumns", JSON.stringify(nextCustom));
    
    const nextOrder = columnOrder.filter(id => id !== columnId);
    setColumnOrder(nextOrder);
    localStorage.setItem("simpleCRM_columnOrder", JSON.stringify(nextOrder));
    
    const nextVisible = visibleColumns.filter(id => id !== columnId);
    setVisibleColumns(nextVisible as ColumnId[]);
    localStorage.setItem("simpleCRM_columnVisibility", JSON.stringify(nextVisible));
  };

  const toggleVisibility = (columnId: ColumnId) => {
    if (columnId === "name") return; // name is always visible, ignore
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
    deleteCustomColumn,
    isHydrated,
  };
}

export type ColumnState = ReturnType<typeof useColumnState>;
