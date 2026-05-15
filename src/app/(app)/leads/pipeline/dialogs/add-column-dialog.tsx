// SimpleCRM — add-column-dialog.tsx
"use client";

import { 
  Plus, 
  Check, 
  Sparkles, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Star, 
  User, 
  List, 
  Calendar,
  X
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ColumnState } from "../hooks/use-column-state";

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnState: ColumnState;
  onCreateCustom: () => void;
}

const PREMADE_ATTRIBUTES = [
  { id: "name", label: "Name", icon: Sparkles },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "location", label: "Location", icon: MapPin },
  { id: "status", label: "Status", icon: MessageSquare },
  { id: "rating", label: "Rating", icon: Star },
  { id: "assignedTo", label: "Assigned To", icon: User },
  { id: "sources", label: "Sources", icon: List },
  { id: "lastContacted", label: "Last Contacted", icon: Calendar },
  { id: "createdAt", label: "Created At", icon: Calendar },
];

export function AddColumnDialog({
  open,
  onOpenChange,
  columnState,
  onCreateCustom,
}: AddColumnDialogProps) {
  const { visibleColumns, toggleVisibility, allAvailableColumns } = columnState;
  
  const customColumns = allAvailableColumns.filter(c => c.isCustom);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <DialogHeader className="p-6 border-b border-neutral-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-neutral-900">Add Column</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={18} className="text-neutral-400" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Section A: Premade Attributes */}
          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Standard Attributes</label>
            <div className="grid grid-cols-1 gap-2">
              {PREMADE_ATTRIBUTES.map((attr) => {
                const isVisible = visibleColumns.includes(attr.id);
                return (
                  <button
                    key={attr.id}
                    onClick={() => toggleVisibility(attr.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 group",
                      isVisible 
                        ? "bg-blue-50/50 border-blue-100 ring-1 ring-blue-100" 
                        : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isVisible ? "bg-blue-100 text-blue-600" : "bg-neutral-100 text-neutral-400 group-hover:text-neutral-600"
                      )}>
                        <attr.icon size={16} />
                      </div>
                      <span className={cn(
                        "text-[13px] font-semibold transition-colors",
                        isVisible ? "text-blue-900" : "text-neutral-700"
                      )}>
                        {attr.label}
                      </span>
                    </div>
                    {isVisible && (
                      <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Custom Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Custom Attributes</label>
              <button 
                onClick={onCreateCustom}
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
              >
                <Plus size={12} />
                Create new
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {customColumns.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                  <p className="text-[12px] text-neutral-400">No custom attributes yet</p>
                </div>
              )}
              {customColumns.map((attr) => {
                const isVisible = visibleColumns.includes(attr.id);
                return (
                  <button
                    key={attr.id}
                    onClick={() => toggleVisibility(attr.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 group",
                      isVisible 
                        ? "bg-blue-50/50 border-blue-100 ring-1 ring-blue-100" 
                        : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "px-2 py-1 rounded bg-neutral-100 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter"
                      )}>
                        Custom
                      </div>
                      <span className={cn(
                        "text-[13px] font-semibold transition-colors",
                        isVisible ? "text-blue-900" : "text-neutral-700"
                      )}>
                        {attr.label}
                      </span>
                    </div>
                    {isVisible && (
                      <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex justify-center">
          <button 
            onClick={() => onOpenChange(false)}
            className="text-[13px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
