// SimpleCRM — create-attribute-dialog.tsx
"use client";

import { useState } from "react";
import { X, Plus, Type, Hash, Calendar, CheckSquare, List, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (attr: { id: string; label: string; type: string; options?: string[] }) => void;
}

const ATTRIBUTE_TYPES = [
  { value: "Text", label: "Text (single line)", icon: Type },
  { value: "Number", label: "Number (integer or decimal)", icon: Hash },
  { value: "Date", label: "Date (date picker)", icon: Calendar },
  { value: "Checkbox", label: "Checkbox (true/false)", icon: CheckSquare },
  { value: "Select", label: "Select (dropdown, single choice)", icon: List },
  { value: "Multi-select", label: "Multi-select (multiple choices)", icon: Layers },
];

export function CreateAttributeDialog({
  open,
  onOpenChange,
  onSave,
}: CreateAttributeDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim()) {
      if (options.includes(newOption.trim())) {
        toast.error("Option already exists");
        return;
      }
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Attribute name is required");
      return;
    }
    if ((type === "Select" || type === "Multi-select") && options.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }

    const id = `custom_${Date.now()}`;
    onSave({
      id,
      label: name.trim(),
      type,
      options: (type === "Select" || type === "Multi-select") ? options : undefined,
    });
    
    toast.success(`Column added — ${name}`);
    reset();
    onOpenChange(false);
  };

  const reset = () => {
    setName("");
    setType("Text");
    setOptions([]);
    setNewOption("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <DialogHeader className="p-6 border-b border-neutral-100">
          <DialogTitle className="text-xl font-bold text-neutral-900">Create custom attribute</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Attribute Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Attribute name *</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              placeholder="e.g. Lead Score, Department"
              className="h-10 text-[13px] rounded-xl border-neutral-200 focus:ring-primary/10 focus:border-primary"
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-neutral-400">{name.length}/50</span>
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Type *</label>
            <CustomDropdown
              value={type}
              onChange={setType}
              options={ATTRIBUTE_TYPES}
              className="h-10 rounded-xl"
            />
          </div>

          {/* Options Section (for Select/Multi-select) */}
          {(type === "Select" || type === "Multi-select") && (
            <div className="space-y-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Options</label>
              <div className="flex gap-2">
                <Input 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add an option..."
                  className="h-9 text-[13px] rounded-lg bg-white border-neutral-200"
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                />
                <Button 
                  type="button"
                  onClick={addOption} 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 p-0 rounded-lg border-neutral-200"
                >
                  <Plus className="w-4 h-4 text-neutral-600" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {options.length === 0 && (
                  <span className="text-[12px] text-neutral-400 italic">No options added yet</span>
                )}
                {options.map((opt, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm group transition-all hover:border-neutral-300"
                  >
                    <span className="text-[12px] font-medium text-neutral-700">{opt}</span>
                    <button 
                      onClick={() => removeOption(i)} 
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-neutral-50/50 border-t border-neutral-100 flex flex-row items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="text-[13px] font-bold text-neutral-400 hover:text-neutral-600 rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            className="flex-1 max-w-[120px] h-10 bg-neutral-900 text-white text-[13px] font-bold rounded-xl hover:bg-neutral-800 shadow-lg active:scale-95 transition-all"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
