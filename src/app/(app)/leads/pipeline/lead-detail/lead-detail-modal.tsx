// SimpleCRM — lead-detail-modal (Replicated from reference/LeadDetailModal.tsx)
"use client";

import { useState } from 'react';
import { X, Phone, MapPin, Clock, Plus, GripVertical } from 'lucide-react';
import { StatusCell, RatingCell } from '../cells/reference-cells';
import { MemberCell } from '@/app/(app)/leads/pipeline/cells/member-cell';
import { SourceCell } from '@/app/(app)/leads/pipeline/cells/source-cell';
import { format } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
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

interface FieldItem {
  id: string;
  label: string;
  value: any;
  type: 'status' | 'rating' | 'member' | 'sources' | 'text' | 'date';
  editable: boolean;
}

function SortableField({ field, onUpdate }: { field: FieldItem; onUpdate: (value: any) => void }) {
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
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 py-3 px-3 hover:bg-gray-50 rounded group border-b border-gray-100">
      <button className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100" {...attributes} {...listeners}>
        <GripVertical size={16} className="text-gray-400" />
      </button>
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">{field.label}</div>
        {field.type === 'status' && <StatusCell status={field.value} />}
        {field.type === 'rating' && <RatingCell rating={field.value} onChange={onUpdate} />}
        {field.type === 'member' && <div className="text-sm font-medium">{field.value || 'Unassigned'}</div>}
        {field.type === 'sources' && <div className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block">{field.value}</div>}
        {field.type === 'text' && (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => onUpdate(e.target.value)}
            className="text-sm border-none outline-none bg-transparent w-full font-medium"
            disabled={!field.editable}
          />
        )}
        {field.type === 'date' && (
          <div className="text-sm font-medium">{field.value ? format(new Date(field.value), 'MMM d, yyyy h:mm a') : 'Never'}</div>
        )}
      </div>
    </div>
  );
}

export function LeadDetailModal({
  open,
  lead,
  onClose,
  onUpdateField,
}: any) {
  if (!open || !lead) return null;

  const [fields, setFields] = useState<FieldItem[]>([
    { id: 'status', label: 'Status', value: lead.status, type: 'status', editable: false },
    { id: 'rating', label: 'Rating', value: lead.rating || 0, type: 'rating', editable: true },
    { id: 'assignedTo', label: 'Assigned To', value: lead.assignedTo, type: 'member', editable: false },
    { id: 'source', label: 'Source', value: lead.source, type: 'sources', editable: false },
    { id: 'lastContacted', label: 'Last Contacted', value: lead.lastContacted, type: 'date', editable: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFieldUpdate = (fieldId: string, value: any) => {
    onUpdateField(lead.id, fieldId, value);
    setFields(fields.map(f => f.id === fieldId ? { ...f, value } : f));
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg font-bold">
                {getInitials(lead.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{lead.name}</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {lead.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {lead.location}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <select
              value={lead.status}
              onChange={(e) => handleFieldUpdate('status', e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
            >
              <option value="NEW">New</option>
              <option value="FRESH">Fresh</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
            <button
              onClick={() => {}}
              className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 font-medium"
            >
              <Clock size={14} className="inline mr-1.5 -mt-0.5" />
              Log Contact
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs.Root defaultValue="info" className="h-full flex flex-col">
            <Tabs.List className="flex border-b border-gray-200 px-6">
              <Tabs.Trigger
                value="info"
                className="px-4 py-3 text-sm font-bold uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-500 hover:text-black transition-all"
              >
                Information
              </Tabs.Trigger>
              <Tabs.Trigger
                value="activity"
                className="px-4 py-3 text-sm font-bold uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-500 hover:text-black transition-all"
              >
                Activity Log
              </Tabs.Trigger>
              <Tabs.Trigger
                value="notes"
                className="px-4 py-3 text-sm font-bold uppercase tracking-wider data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-500 hover:text-black transition-all"
              >
                Notes
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="info" className="flex-1 overflow-y-auto p-6">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0 border border-gray-200 rounded divide-y divide-gray-100">
                    {fields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onUpdate={(value) => handleFieldUpdate(field.id, value)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </Tabs.Content>

            <Tabs.Content value="activity" className="flex-1 overflow-y-auto p-6">
              <div className="text-sm text-gray-500 text-center py-12">No activities yet</div>
            </Tabs.Content>

            <Tabs.Content value="notes" className="flex-1 overflow-y-auto p-6">
              <div className="text-sm text-gray-500 text-center py-12">No notes yet</div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800">
                  <Plus size={16} />
                </button>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
