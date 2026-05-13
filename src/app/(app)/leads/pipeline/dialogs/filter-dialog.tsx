// SimpleCRM — filter-dialog (Replicated from reference/FilterDialog.tsx)
"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draftFilters: any;
  onDraftChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterDialog({ 
  open, 
  onOpenChange, 
  draftFilters, 
  onDraftChange, 
  onApply, 
  onClear 
}: FilterDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Advanced Filters</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={draftFilters.name}
              onChange={(e) => onDraftChange({ ...draftFilters, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Filter by name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone</label>
            <input
              type="text"
              value={draftFilters.phone}
              onChange={(e) => onDraftChange({ ...draftFilters, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Filter by phone..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Location</label>
            <input
              type="text"
              value={draftFilters.location}
              onChange={(e) => onDraftChange({ ...draftFilters, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Filter by location..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Assigned To</label>
            <input
              type="text"
              value={draftFilters.assignedTo}
              onChange={(e) => onDraftChange({ ...draftFilters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Filter by assignee..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Status</label>
            <select
              value={draftFilters.status}
              onChange={(e) => onDraftChange({ ...draftFilters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
            >
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="FRESH">Fresh</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Minimum Rating</label>
            <select
              value={draftFilters.rating ?? ''}
              onChange={(e) => onDraftChange({ ...draftFilters, rating: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black outline-none"
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
            onClick={onClear}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
