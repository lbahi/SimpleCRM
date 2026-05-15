// SimpleCRM — filter-dialog.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  avatarInitials: string;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draftFilters: any;
  onDraftChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "FRESH", label: "Fresh" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

const SOURCE_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "MANUAL", label: "Manual" },
  { value: "REFERRAL", label: "Referral" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "GOOGLE", label: "Google" },
];

export function FilterDialog({ 
  open, 
  onOpenChange, 
  draftFilters, 
  onDraftChange, 
  onApply, 
  onClear 
}: FilterDialogProps) {
  const [members, setMembers] = React.useState<Member[]>([]);

  React.useEffect(() => {
    if (open) {
      fetch("/api/users?role=MEMBER")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMembers(data);
        })
        .catch(err => console.error("Failed to fetch members", err));
    }
  }, [open]);

  const toggleMultiSelect = (field: string, value: string) => {
    const current = draftFilters[field] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onDraftChange({ ...draftFilters, [field]: next });
  };

  const setAllMultiSelect = (field: string, options: { value: string }[]) => {
    onDraftChange({ ...draftFilters, [field]: options.map(o => o.value) });
  };

  const clearMultiSelect = (field: string) => {
    onDraftChange({ ...draftFilters, [field]: [] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-neutral-900">Filter leads</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-400" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Status Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAllMultiSelect("status", STATUS_OPTIONS)}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Select all
                </button>
                <button 
                  onClick={() => clearMultiSelect("status")}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-600"
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = (draftFilters.status || []).includes(opt.value);
                return (
                  <div 
                    key={opt.value}
                    onClick={() => toggleMultiSelect("status", opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl border border-neutral-100 cursor-pointer transition-all duration-200",
                      isSelected ? "bg-blue-50/50 border-blue-100 ring-1 ring-blue-100" : "hover:bg-neutral-50 hover:border-neutral-200"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleMultiSelect("status", opt.value)}
                      className={cn(isSelected && "border-primary bg-primary")}
                    />
                    <span className={cn(
                      "text-[13px] font-medium transition-colors",
                      isSelected ? "text-primary" : "text-neutral-600"
                    )}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned To Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Assigned to</label>
            <CustomDropdown
              value={draftFilters.assignedTo || ""}
              onChange={(val) => onDraftChange({ ...draftFilters, assignedTo: val })}
              placeholder="Anyone"
              showSearch
              options={[
                { value: "", label: "Anyone" },
                { value: "UNASSIGNED", label: "Unassigned" },
                ...members.map(m => ({
                  value: m.id,
                  label: m.name,
                  avatar: m.avatarInitials
                }))
              ]}
            />
          </div>

          {/* Source Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Source</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAllMultiSelect("sources", SOURCE_OPTIONS)}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Select all
                </button>
                <button 
                  onClick={() => clearMultiSelect("sources")}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-600"
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SOURCE_OPTIONS.map((opt) => {
                const isSelected = (draftFilters.sources || []).includes(opt.value);
                return (
                  <div 
                    key={opt.value}
                    onClick={() => toggleMultiSelect("sources", opt.value)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl border border-neutral-100 cursor-pointer transition-all duration-200",
                      isSelected ? "bg-blue-50/50 border-blue-100 ring-1 ring-blue-100" : "hover:bg-neutral-50 hover:border-neutral-200"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleMultiSelect("sources", opt.value)}
                    />
                    <span className={cn(
                      "text-[13px] font-medium transition-colors",
                      isSelected ? "text-primary" : "text-neutral-600"
                    )}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Minimum Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onDraftChange({ ...draftFilters, rating: star === draftFilters.rating ? 0 : star })}
                  className={cn(
                    "flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-200",
                    draftFilters.rating >= star 
                      ? "bg-amber-50 border-amber-200 text-amber-500 shadow-sm" 
                      : "bg-white border-neutral-100 text-neutral-300 hover:border-neutral-200"
                  )}
                >
                  <span className="text-[13px] font-bold">{star}</span>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill={draftFilters.rating >= star ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Location</label>
            <input
              type="text"
              value={draftFilters.location || ""}
              onChange={(e) => onDraftChange({ ...draftFilters, location: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              placeholder="Filter by city or region..."
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-neutral-50/50 border-t border-neutral-100 flex flex-row items-center justify-between gap-4">
          <button
            onClick={onClear}
            className="px-4 h-10 rounded-xl text-[13px] font-bold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all active:scale-95"
          >
            Clear all
          </button>
          <button
            onClick={onApply}
            className="flex-1 h-10 bg-neutral-900 text-white rounded-xl text-[13px] font-bold hover:bg-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Apply Filters
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
