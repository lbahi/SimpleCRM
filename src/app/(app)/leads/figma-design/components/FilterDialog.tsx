import { useState } from 'react';
import { X } from 'lucide-react';
import { TableState } from '../types';

interface FilterDialogProps {
  filters: TableState['filters'];
  onClose: () => void;
  onApply: (filters: TableState['filters']) => void;
}

export function FilterDialog({ filters, onClose, onApply }: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: TableState['filters'] = {
      search: '',
      name: '',
      phone: '',
      location: '',
      assignedTo: '',
      status: '',
      rating: null,
    };
    setLocalFilters(clearedFilters);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg">Advanced Filters</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Name</label>
            <input
              type="text"
              value={localFilters.name}
              onChange={(e) => setLocalFilters({ ...localFilters, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Filter by name..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Phone</label>
            <input
              type="text"
              value={localFilters.phone}
              onChange={(e) => setLocalFilters({ ...localFilters, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Filter by phone..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Location</label>
            <input
              type="text"
              value={localFilters.location}
              onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Filter by location..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Assigned To</label>
            <input
              type="text"
              value={localFilters.assignedTo}
              onChange={(e) => setLocalFilters({ ...localFilters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Filter by assignee..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Status</label>
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="NO_RESPOND">No Respond</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Minimum Rating</label>
            <select
              value={localFilters.rating ?? ''}
              onChange={(e) => setLocalFilters({ ...localFilters, rating: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Any rating</option>
              <option value="1">1 star or more</option>
              <option value="2">2 stars or more</option>
              <option value="3">3 stars or more</option>
              <option value="4">4 stars or more</option>
              <option value="5">5 stars</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
