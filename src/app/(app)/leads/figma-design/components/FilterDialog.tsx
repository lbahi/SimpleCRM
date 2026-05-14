import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { TableState } from '../types';

interface Member {
  id: string;
  name: string;
  avatarInitials: string;
}

interface FilterDialogProps {
  filters: TableState['filters'];
  onClose: () => void;
  onApply: (filters: TableState['filters']) => void;
}

export function FilterDialog({ filters, onClose, onApply }: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/users?role=MEMBER")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(err => console.error("Failed to fetch members", err));
  }, []);

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
            <CustomDropdown
              value={localFilters.assignedTo}
              onChange={(val) => setLocalFilters({ ...localFilters, assignedTo: val })}
              placeholder="All members"
              showSearch
              options={[
                { value: "", label: "All members" },
                { value: "Unassigned", label: "Unassigned" },
                ...members.map(m => ({
                  value: m.name, // Store name for the current filter logic
                  label: m.name,
                  avatar: m.avatarInitials
                }))
              ]}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Status</label>
            <CustomDropdown
              value={localFilters.status}
              onChange={(val) => setLocalFilters({ ...localFilters, status: val })}
              placeholder="All statuses"
              options={[
                { value: "", label: "All statuses" },
                { value: "NEW", label: "New" },
                { value: "NO_RESPOND", label: "No Respond" },
                { value: "CONTACTED", label: "Contacted" },
                { value: "CONVERTED", label: "Converted" },
                { value: "LOST", label: "Lost" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Minimum Rating</label>
            <CustomDropdown
              value={localFilters.rating?.toString() ?? ""}
              onChange={(val) => setLocalFilters({ ...localFilters, rating: val ? Number(val) : null })}
              placeholder="Any rating"
              options={[
                { value: "", label: "Any rating" },
                { value: "1", label: "1 star or more" },
                { value: "2", label: "2 stars or more" },
                { value: "3", label: "3 stars or more" },
                { value: "4", label: "4 stars or more" },
                { value: "5", label: "5 stars" },
              ]}
            />
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
