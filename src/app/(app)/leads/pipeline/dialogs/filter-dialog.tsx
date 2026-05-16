// SimpleCRM — filter-dialog.tsx
"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { FilterStatusSection } from "./filter-status-section";
import { FilterSourceSection } from "./filter-source-section";
import { FilterRatingSection } from "./filter-rating-section";

interface Member { id: string; name: string; avatarInitials: string; }

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draftFilters: any;
  onDraftChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterDialog({ open, onOpenChange, draftFilters, onDraftChange, onApply, onClear }: FilterDialogProps) {
  const [members, setMembers] = React.useState<Member[]>([]);

  React.useEffect(() => {
    if (open) {
      fetch("/api/users?role=MEMBER").then(res => res.json()).then(data => { if (Array.isArray(data)) setMembers(data); }).catch(err => console.error(err));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-neutral-900">Filter leads</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <FilterStatusSection selected={draftFilters.status || []} onChange={(v) => onDraftChange({ ...draftFilters, status: v })} />
          
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Assigned to</label>
            <CustomDropdown
              value={draftFilters.assignedTo || ""}
              onChange={(val) => onDraftChange({ ...draftFilters, assignedTo: val })}
              placeholder="Anyone"
              showSearch
              options={[{ value: "", label: "Anyone" }, { value: "UNASSIGNED", label: "Unassigned" }, ...members.map(m => ({ value: m.id, label: m.name, avatar: m.avatarInitials }))]}
            />
          </div>

          <FilterSourceSection selected={draftFilters.sources || []} onChange={(v) => onDraftChange({ ...draftFilters, sources: v })} />
          <FilterRatingSection rating={draftFilters.rating || 0} onChange={(v) => onDraftChange({ ...draftFilters, rating: v })} />

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Location</label>
            <input
              type="text"
              value={draftFilters.location || ""}
              onChange={(e) => onDraftChange({ ...draftFilters, location: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] text-neutral-700 outline-none focus:border-primary transition-all"
              placeholder="Filter by city or region..."
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-neutral-50/50 border-t border-neutral-100 flex flex-row items-center justify-between gap-4">
          <button onClick={onClear} className="px-4 h-10 rounded-xl text-[13px] font-bold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all">Clear all</button>
          <button onClick={onApply} className="flex-1 h-10 bg-neutral-900 text-white rounded-xl text-[13px] font-bold hover:bg-neutral-800 shadow-md transition-all">Apply Filters</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
