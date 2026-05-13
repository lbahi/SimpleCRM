import { useState } from 'react';
import { X } from 'lucide-react';
import { FigmaLead, LeadStatus } from '@/lib/adapters/leads.adapter';

interface CreateLeadDialogProps {
  onClose: () => void;
  onCreate: (lead: Omit<FigmaLead, 'id' | 'createdAt'>) => void;
}

export function CreateLeadDialog({ onClose, onCreate }: CreateLeadDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    assignedTo: '',
    status: 'NEW' as LeadStatus,
    rating: 3,
    sources: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      sources: formData.sources.split(',').map(s => s.trim()).filter(Boolean),
      lastContacted: null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg">Create New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Enter name..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Assigned To *</label>
            <input
              type="text"
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Team member name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="NEW">New</option>
              <option value="NO_RESPOND">No Respond</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Sources (comma separated)</label>
            <input
              type="text"
              value={formData.sources}
              onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Website, Google Ads"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
