import { useState } from 'react';
import { X, Eye, EyeOff, GripVertical, Pin, PinOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnDef } from '../types';

interface CustomizeDialogProps {
  columns: ColumnDef[];
  onClose: () => void;
  onApply: (columns: ColumnDef[]) => void;
}

function SortableColumn({
  column,
  onToggleVisible,
  onTogglePin,
  onRename,
}: {
  column: ColumnDef;
  onToggleVisible: () => void;
  onTogglePin: () => void;
  onRename: (label: string) => void;
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
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:bg-gray-50"
    >
      <button className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
      </button>

      <input
        type="text"
        value={column.label}
        onChange={(e) => onRename(e.target.value)}
        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
      />

      <button onClick={onTogglePin} className="p-1 hover:bg-gray-100 rounded" title={column.pinned ? 'Unpin' : 'Pin'}>
        {column.pinned ? <Pin size={16} className="text-black" /> : <PinOff size={16} className="text-gray-400" />}
      </button>

      <button onClick={onToggleVisible} className="p-1 hover:bg-gray-100 rounded" title={column.visible ? 'Hide' : 'Show'}>
        {column.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-400" />}
      </button>
    </div>
  );
}

export function CustomizeDialog({ columns, onClose, onApply }: CustomizeDialogProps) {
  const [localColumns, setLocalColumns] = useState(columns);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((col, index) => ({ ...col, order: index }));
      });
    }
  };

  const handleToggleVisible = (id: string) => {
    setLocalColumns(localColumns.map(col =>
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleTogglePin = (id: string) => {
    setLocalColumns(localColumns.map(col =>
      col.id === id ? { ...col, pinned: !col.pinned } : col
    ));
  };

  const handleRename = (id: string, label: string) => {
    setLocalColumns(localColumns.map(col =>
      col.id === id ? { ...col, label } : col
    ));
  };

  const handleApply = () => {
    onApply(localColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg">Customize Columns</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-600 mb-4">
            Drag to reorder, click the eye to show/hide, and the pin to pin columns to the left.
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns.map(col => col.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localColumns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onToggleVisible={() => handleToggleVisible(column.id)}
                    onTogglePin={() => handleTogglePin(column.id)}
                    onRename={(label) => handleRename(column.id, label)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
