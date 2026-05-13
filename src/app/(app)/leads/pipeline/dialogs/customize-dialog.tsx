// SimpleCRM — customize-dialog (Replicated from reference/CustomizeDialog.tsx)
"use client";

import { useState } from 'react';
import { X, Eye, EyeOff, GripVertical, Pin, PinOff } from 'lucide-react';
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

interface CustomizeDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  visibleColumns: any[];
  columnOrder: string[];
  onToggleVisibility: (id: string) => void;
  onMoveColumn: (id: string, direction: 'up' | 'down') => void;
  onReorderColumns: (ids: string[]) => void;
}

function SortableColumn({
  column,
  onToggleVisible,
  onTogglePin,
  onRename,
}: any) {
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
        {column.hidden ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-700" />}
      </button>
    </div>
  );
}

export function CustomizeDialog({ 
  open, 
  onOpenChange, 
  visibleColumns, 
  columnOrder, 
  onToggleVisibility, 
  onReorderColumns 
}: CustomizeDialogProps) {
  if (!open) return null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      onReorderColumns(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
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
                      onToggleVisible={() => onToggleVisibility(id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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
