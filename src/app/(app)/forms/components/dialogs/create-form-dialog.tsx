// SimpleCRM — create-form-dialog (Replicated from reference/FormBuilderModal.tsx)
"use client";

import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import Image from 'next/image';
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

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (formData: any) => void;
}

function SortableField({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

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
        <button className="mt-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical size={16} className="text-gray-400" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Field Type</label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ ...field, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Label</label>
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
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Enter placeholder text"
            />
          </div>

          {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Options (comma separated)</label>
              <input
                type="text"
                value={field.options?.join(', ') || ''}
                onChange={(e) => onUpdate({ ...field, options: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
              className="size-4 shrink-0 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor={`required-${field.id}`} className="text-xs font-medium text-gray-600 cursor-pointer select-none">
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

export function CreateFormDialog({ open, onClose, onCreated }: CreateFormDialogProps) {
  if (!open) return null;

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('Submit your information below');
  const [submitButtonText, setSubmitButtonText] = useState('Send Request');
  const [sourceTag, setSourceTag] = useState('Website');
  const [fields, setFields] = useState<FormField[]>([
    {
      id: '1',
      type: 'text',
      label: 'Name',
      placeholder: 'Enter your name',
      required: true,
    },
    {
      id: '2',
      type: 'phone',
      label: 'Phone',
      placeholder: 'Enter your phone number',
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
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: FormField) => {
    setFields(fields.map(f => f.id === id ? updatedField : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const PreviewSelect = ({ field }: { field: FormField }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const isMulti = field.type === 'multiselect';

    const toggleOption = (opt: string) => {
      if (isMulti) {
        setSelected(prev =>
          prev.includes(opt)
            ? prev.filter(o => o !== opt)
            : [...prev, opt]
        );
      } else {
        setSelected([opt]);
        setIsOpen(false);
      }
    };

    const displayText = selected.length > 0
      ? selected.join(', ')
      : (field.placeholder || (isMulti ? 'Select options...' : 'Select an option'));

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition-all text-left shadow-sm active:scale-[0.99]"
        >
          <span className={`truncate ${selected.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
            {displayText}
          </span>
          <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto p-1.5">
                {field.options?.filter(opt => opt.trim().length > 0).map((opt, i) => {
                  const isActive = selected.includes(opt);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleOption(opt)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors font-medium flex items-center justify-between ${isActive
                          ? 'bg-purple-50 text-purple-700'
                          : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      {opt}
                      {isActive && <div className="size-1.5 bg-purple-600 rounded-full" />}
                    </button>
                  );
                })}
                {(!field.options || field.options.filter(opt => opt.trim().length > 0).length === 0) && (
                  <div className="px-3 py-2 text-sm text-gray-400 italic">No options defined</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPreview = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            rows={4}
          />
        );
      case 'select':
      case 'multiselect':
        return <PreviewSelect field={field} />;
      case 'checkbox':
      case 'radio':
        return (
          <div className="flex flex-wrap gap-4 mt-2">
            {field.options && field.options.length > 0 ? (
              field.options.filter(opt => opt.length > 0).map((opt, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                    name={`preview-${field.id}`}
                    className="size-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{opt}</span>
                </label>
              ))
            ) : (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                  name={`preview-${field.id}`}
                  className="size-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Default {field.type} option</span>
              </label>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-purple-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Create Capture Form</h2>
            <p className="text-sm text-purple-100 mt-1">Build new forms with layout tools</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-purple-100 transition-colors">
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
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
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
          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Live Preview</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Active</span>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto border border-gray-100">
              <div className="text-center mb-8">
                <div className="relative h-20 w-full max-w-[160px] mx-auto mb-6">
                  <Image 
                    src="/Logo.svg" 
                    alt="Logo" 
                    fill 
                    className="object-contain opacity-90"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{formName || 'Form Title'}</h2>

                <p className="text-sm text-gray-500">{formDescription}</p>
              </div>

              <div className="space-y-5">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderPreview(field)}
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 px-4 py-3.5 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]">
                {submitButtonText}
              </button>
            </div>
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
                fields
              });
            }}
            className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            Save and Activate
          </button>
        </div>
      </div>
    </div>
  );
}
