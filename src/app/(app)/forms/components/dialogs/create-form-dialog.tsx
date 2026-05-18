// SimpleCRM — create-form-dialog
"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableField, FormField } from "./sortable-field";
import { FormPreviewCard } from "../form-preview-card";

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (formData: {
    name: string;
    description: string;
    submitButtonText: string;
    sourceTag: string;
    fields: FormField[];
  }) => void;
}

export function CreateFormDialog({ open, onClose, onCreated }: CreateFormDialogProps) {
  if (!open) return null;

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("Submit your information below");
  const [submitButtonText, setSubmitButtonText] = useState("Send Request");
  const [sourceTag, setSourceTag] = useState("WEBSITE");
  const [fields, setFields] = useState<FormField[]>([
    {
      id: "1",
      type: "text",
      label: "Name",
      placeholder: "Enter your name",
      required: true,
    },
    {
      id: "2",
      type: "phone",
      label: "Phone",
      placeholder: "Enter your phone number",
      required: true,
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: FormField) => {
    setFields(fields.map((f) => (f.id === id ? updatedField : f)));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-neutral-50 border-b border-neutral-200 text-neutral-900">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create Capture Form</h2>
            <p className="text-sm text-neutral-500 mt-1 font-medium">Build new forms with layout tools</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-full text-neutral-500 hover:text-neutral-900 transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Form Builder */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6 bg-white">
            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Form Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Website Landing Page 02"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Form Description</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Submit your information below"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Submit Button Text</label>
              <input
                type="text"
                value={submitButtonText}
                onChange={(e) => setSubmitButtonText(e.target.value)}
                placeholder="e.g. Send Request"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Form Fields</h3>
                <button
                  onClick={addField}
                  className="px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus size={14} />
                  Add Field
                </button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onUpdate={(updated) => updateField(field.id, updated)}
                      onDelete={() => deleteField(field.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50 flex flex-col justify-center">
            <div className="mb-4 flex items-center justify-between max-w-md mx-auto w-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Live Preview</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Active</span>
            </div>

            <FormPreviewCard
              formName={formName}
              formDescription={formDescription}
              submitButtonText={submitButtonText}
              fields={fields}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onCreated({
                name: formName,
                description: formDescription,
                submitButtonText: submitButtonText,
                sourceTag: sourceTag,
                fields,
              });
            }}
            className="flex-1 px-4 py-2.5 bg-neutral-950 text-white rounded-lg text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-neutral-200"
          >
            Save and Activate
          </button>
        </div>
      </div>
    </div>
  );
}
