import { useState } from 'react';
import { X, Phone, MapPin, Clock, Plus } from 'lucide-react';
import { FigmaLead, LeadStatus } from '@/lib/adapters/leads.adapter';
import { StatusCell } from './StatusCell';
import { RatingCell } from './RatingCell';
import { MemberCell } from './MemberCell';
import { SourceCell } from './SourceCell';
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
import { GripVertical } from 'lucide-react';

interface Activity {
  id: string;
  type: 'status_change' | 'contact_log' | 'note' | 'reminder';
  timestamp: Date;
  description: string;
  oldValue?: string;
  newValue?: string;
}

interface Reminder {
  id: string;
  leadId: string;
  timestamp: Date;
  note: string;
}

interface LeadDetailModalProps {
  lead: FigmaLead;
  activities: Activity[];
  reminders: Reminder[];
  onClose: () => void;
  onUpdateLead: (leadId: string, updates: Partial<FigmaLead>) => void;
  onAddNote: (leadId: string, note: string) => void;
  onSetReminder: (leadId: string, reminder: Omit<Reminder, 'id' | 'leadId'>) => void;
}

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
        <div className="text-xs text-gray-500 mb-1.5">{field.label}</div>
        {field.type === 'status' && <StatusCell status={field.value} />}
        {field.type === 'rating' && <RatingCell rating={field.value} onChange={onUpdate} />}
        {field.type === 'member' && <MemberCell name={field.value} size="sm" />}
        {field.type === 'sources' && <SourceCell sources={field.value} />}
        {field.type === 'text' && (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => onUpdate(e.target.value)}
            className="text-sm border-none outline-none bg-transparent w-full"
            disabled={!field.editable}
          />
        )}
        {field.type === 'date' && (
          <div className="text-sm">{field.value ? format(field.value, 'MMM d, yyyy h:mm a') : 'Never'}</div>
        )}
      </div>
    </div>
  );
}

export function LeadDetailModal({
  lead,
  activities,
  reminders,
  onClose,
  onUpdateLead,
  onAddNote,
  onSetReminder,
}: LeadDetailModalProps) {
  const [fields, setFields] = useState<FieldItem[]>([
    { id: 'status', label: 'Status', value: lead.status, type: 'status', editable: false },
    { id: 'rating', label: 'Rating', value: lead.rating, type: 'rating', editable: true },
    { id: 'assignedTo', label: 'Assigned To', value: lead.assignedTo, type: 'member', editable: false },
    { id: 'sources', label: 'Sources', value: lead.sources, type: 'sources', editable: false },
    { id: 'lastContacted', label: 'Last Contacted', value: lead.lastContacted, type: 'date', editable: false },
  ]);

  const [newNote, setNewNote] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);

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
    if (fieldId === 'rating') {
      onUpdateLead(lead.id, { rating: value });
      setFields(fields.map(f => f.id === fieldId ? { ...f, value } : f));
    }
  };

  const handleStatusChange = () => {
    onUpdateLead(lead.id, { status: selectedStatus });
  };

  const handleLogContact = () => {
    onUpdateLead(lead.id, { lastContacted: new Date() });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(lead.id, newNote);
      setNewNote('');
    }
  };

  const handleSetReminder = () => {
    if (reminderNote.trim() && reminderDate) {
      onSetReminder(lead.id, {
        timestamp: new Date(reminderDate),
        note: reminderNote,
      });
      setReminderNote('');
      setReminderDate('');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const noteActivities = activities.filter(a => a.type === 'note');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg">
                {getInitials(lead.name)}
              </div>
              <div>
                <h2 className="text-2xl mb-2">{lead.name}</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone size={14} />
                    {lead.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {lead.location}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-3 mt-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="NEW">New</option>
              <option value="NO_RESPOND">No Respond</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
            <button
              onClick={handleStatusChange}
              className="px-3 py-1.5 bg-black text-white rounded text-sm hover:bg-gray-800"
            >
              Update Status
            </button>
            <button
              onClick={handleLogContact}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              <Clock size={14} className="inline mr-1" />
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
                className="px-4 py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-black transition-colors"
              >
                Lead Information
              </Tabs.Trigger>
              <Tabs.Trigger
                value="activity"
                className="px-4 py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-black transition-colors"
              >
                Activity Log
              </Tabs.Trigger>
              <Tabs.Trigger
                value="notes"
                className="px-4 py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-black transition-colors"
              >
                Notes
              </Tabs.Trigger>
              <Tabs.Trigger
                value="reminders"
                className="px-4 py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:text-black text-gray-600 hover:text-black transition-colors"
              >
                Reminders
              </Tabs.Trigger>
            </Tabs.List>

            {/* Lead Information Tab */}
            <Tabs.Content value="info" className="flex-1 overflow-y-auto p-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0 border border-gray-200 rounded">
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

            {/* Activity Log Tab */}
            <Tabs.Content value="activity" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-12">No activities yet</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="size-2 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm">{activity.description}</div>
                        {activity.oldValue && activity.newValue && (
                          <div className="text-xs text-gray-500 mt-1">
                            {activity.oldValue} → {activity.newValue}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tabs.Content>

            {/* Notes Tab */}
            <Tabs.Content value="notes" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4 mb-6">
                {noteActivities.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-12">No notes yet</div>
                ) : (
                  noteActivities.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded p-4">
                      <div className="text-sm">{note.description}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        {format(note.timestamp, 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                >
                  <Plus size={16} />
                </button>
              </div>
            </Tabs.Content>

            {/* Reminders Tab */}
            <Tabs.Content value="reminders" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3 mb-6">
                {reminders.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-12">No reminders set</div>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-3 bg-yellow-50 p-4 rounded border border-yellow-200">
                      <Clock size={16} className="text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm">{reminder.note}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(reminder.timestamp, 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-3 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder="Reminder note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleSetReminder}
                    className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                  >
                    Set
                  </button>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
