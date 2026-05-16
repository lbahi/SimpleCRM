// SimpleCRM — customize-dialog (Replicated from reference/CustomizeDialog.tsx)
"use client";

import { X, Eye, EyeOff, GripVertical, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnId } from '../model';

interface CustomizeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  visibleColumns: any[];
  visibleColumnIds: ColumnId[];
  columnOrder: ColumnId[];
  onToggleVisibility: (id: ColumnId) => void;
  onMoveColumn: (id: ColumnId, dir: "up" | "down") => void;
  onReorderColumns: (order: ColumnId[]) => void;
  onDeleteCustomColumn?: (id: string) => void;
  onShowCreateAttr?: () => void;
}

function SortableColumn({
  column,
  isVisible,
  onToggleVisible,
}: {
  column: any;
  isVisible: boolean;
  onToggleVisible: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 shadow-sm"
    >
      <button className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
      </button>

      <span className="flex-1 text-sm font-medium">{column.label}</span>

      <button onClick={onToggleVisible} className="p-1 hover:bg-gray-100 rounded transition-colors">
        {isVisible ? <Eye size={16} className="text-gray-700" /> : <EyeOff size={16} className="text-gray-400" />}
      </button>
    </div>
  );
}

export function CustomizeDialog({ 
  open, 
  onOpenChange, 
  visibleColumns, 
  visibleColumnIds,
  columnOrder, 
  onToggleVisibility, 
  onReorderColumns,
  onDeleteCustomColumn,
  onShowCreateAttr
}: CustomizeDialogProps) {
  const customColumns = visibleColumns.filter((c: any) => c.id.startsWith("custom_"));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!open) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as ColumnId);
      const newIndex = columnOrder.indexOf(over.id as ColumnId);
      onReorderColumns(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Customize Columns</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-500 mb-6">
            Drag to reorder your pipeline columns. Use the eye icon to hide or show specific attributes.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {columnOrder.map((id) => {
                  const column = visibleColumns.find(c => c.id === id);
                  if (!column) return null;
                  return (
                    <SortableColumn
                      key={id}
                      column={column}
                      isVisible={visibleColumnIds.includes(id)}
                      onToggleVisible={() => onToggleVisibility(id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">
              Custom attributes
            </h3>
            
            <div className="space-y-2 mb-4">
              {customColumns.length > 0 ? (
                customColumns.map((col) => (
                  <div key={col.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded shadow-sm">
                    <span className="flex-1 text-sm font-medium">{col.label}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px] font-medium tracking-wide">
                      {col.type || "Text"}
                    </span>
                    <button
                      onClick={() => {
                        if (onDeleteCustomColumn) {
                          onDeleteCustomColumn(col.id);
                          toast.success("Column deleted");
                        }
                      }}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                      title="Delete attribute"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-gray-400 italic">No custom attributes yet</p>
              )}
            </div>

            <button
              onClick={() => {
                if (onShowCreateAttr) onShowCreateAttr();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all"
            >
              <Plus size={16} />
              Add custom attribute
            </button>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
