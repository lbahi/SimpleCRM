// SimpleCRM — sortable-field
"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "multiselect" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface SortableFieldProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

export function SortableField({ field, onUpdate, onDelete }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded p-4 mb-3 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-2 cursor-grab active:cursor-grabbing outline-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} className="text-gray-400" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Field Type
              </label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ ...field, type: e.target.value as FormField["type"] })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none bg-white transition-all"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="textarea">Textarea</option>
                <option value="select">Single Select</option>
                <option value="multiselect">Multiple Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio Option</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Field label"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Enter placeholder text"
            />
          </div>

          {(field.type === "select" ||
            field.type === "multiselect" ||
            field.type === "radio" ||
            field.type === "checkbox") && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Options (comma separated)
              </label>
              <input
                type="text"
                value={field.options?.join(", ") || ""}
                onChange={(e) =>
                  onUpdate({
                    ...field,
                    options: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id={`edit-required-${field.id}`}
              checked={field.required}
              onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
              className="size-4 shrink-0 rounded border-gray-300 text-neutral-950 focus:ring-neutral-900 cursor-pointer"
            />
            <label
              htmlFor={`edit-required-${field.id}`}
              className="text-xs font-medium text-gray-600 cursor-pointer select-none"
            >
              Required field
            </label>
          </div>
        </div>

        <button onClick={onDelete} className="mt-2 text-red-600 hover:text-red-700 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
