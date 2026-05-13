// SimpleCRM — custom-attribute-dialog.tsx
"use client";

import { useState } from "react";
import { 
  X, 
  Plus, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  Star, 
  Link as LinkIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CustomAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (attr: any) => void;
}

export function CustomAttributeDialog({
  open,
  onOpenChange,
  onSave,
}: CustomAttributeDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Text");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const types = [
    { id: "Text", icon: Type },
    { id: "Number", icon: Hash },
    { id: "Date", icon: Calendar },
    { id: "Checkbox", icon: CheckSquare },
    { id: "Select", icon: List },
    { id: "Rating", icon: Star },
    { id: "URL", icon: LinkIcon },
  ];

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `custom_${Date.now()}`,
      label: name,
      type,
      options: type === "Select" ? options : undefined,
    });
    setName("");
    setType("Text");
    setOptions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-neutral-200">
        <DialogHeader className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <DialogTitle className="text-sm font-semibold text-neutral-800">Create Custom Attribute</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Attribute Name</label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead Score"
              className="h-10 text-sm border-neutral-200 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Attribute Type</label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all duration-200",
                    type === t.id 
                      ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm" 
                      : "border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200"
                  )}
                >
                  <t.icon className={cn("w-4 h-4", type === t.id ? "text-blue-500" : "text-neutral-400")} />
                  {t.id}
                </button>
              ))}
            </div>
          </div>

          {type === "Select" && (
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Options</label>
              <div className="flex gap-2">
                <Input 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="New option..."
                  className="h-9 text-sm bg-white"
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                />
                <Button onClick={addOption} size="sm" className="h-9 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700">
                    {opt}
                    <button onClick={() => removeOption(i)} className="text-neutral-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-sm">Cancel</Button>
          <Button onClick={handleSave} className="text-sm px-6">Create Attribute</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
