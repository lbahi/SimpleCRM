// SimpleCRM — add-column-dialog.tsx
"use client";

import { 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  User, 
  Link as LinkIcon, 
  Image as ImageIcon,
  FileText,
  Search,
  Plus,
  Check,
  Star,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COLUMN_DEFS, ColumnId } from "../model";

interface AddColumnDialogProps {
  onAdd: (columnId: ColumnId) => void;
  visibleColumns: ColumnId[];
  trigger: React.ReactNode;
  onCreateCustom: () => void;
}

export function AddColumnDialog({
  onAdd,
  visibleColumns,
  trigger,
  onCreateCustom,
}: AddColumnDialogProps) {
  const fieldTypes = [
    { label: "Short Text", icon: Type },
    { label: "Long Text", icon: FileText },
    { label: "Number", icon: Hash },
    { label: "Date", icon: Calendar },
    { label: "Checklist", icon: CheckSquare },
    { label: "Member", icon: User },
    { label: "Rating", icon: Star },
    { label: "Link", icon: LinkIcon },
    { label: "Image", icon: ImageIcon },
  ];

  const premadeIds: ColumnId[] = [
    "rating",
    "status",
    "location",
    "phone",
    "sources",
    "assignedTo",
    "notePreview",
    "createdAt",
    "lastContacted"
  ];

  const premadeColumns = COLUMN_DEFS.filter(col => premadeIds.includes(col.id));

  return (
    <Dialog>
      <DialogTrigger className="outline-none">
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add column</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <Input 
              placeholder="Search attributes..." 
              className="h-8 pl-8 text-xs bg-white border-neutral-200 focus:ring-0 focus:border-neutral-300"
            />
          </div>
          
          <div className="max-h-[320px] overflow-y-auto space-y-4">
            <div>
              <p className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Premade Attributes</p>
              <div className="space-y-1">
                {premadeColumns.map((col) => {
                  const isVisible = visibleColumns.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => onAdd(col.id)}
                      className="w-full h-9 px-2 rounded-lg flex items-center gap-2.5 text-[13px] text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center">
                        <col.icon className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      {col.label}
                      {isVisible ? (
                        <Check className="ml-auto w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Plus className="ml-auto w-3.5 h-3.5 text-neutral-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <p className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Create custom attribute</p>
              <button
                onClick={onCreateCustom}
                className="w-full h-9 px-2 rounded-lg flex items-center gap-2.5 text-[13px] text-neutral-700 hover:bg-neutral-100 transition-colors group"
              >
                <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Plus className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                Create custom attribute
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
