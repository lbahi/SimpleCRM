// SimpleCRM — edit-form-dialog
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";

interface EditFormDialogProps {
  form: CaptureFormWithCount;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}


export function EditFormDialog({ form, open, onClose, onUpdated }: EditFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: form.name,
    sourceTag: form.sourceTag,
    fields: form.fields as { location: boolean; message: boolean },
  });
  const [errors, setErrors] = useState<{ name?: string; sourceTag?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; sourceTag?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Form name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Form name must be at least 3 characters";
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success("Form updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Edit form settings</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[12px] font-bold uppercase tracking-wider text-purple-600/80">Form name *</Label>
              <Input
                placeholder="e.g. Facebook Landing Page Q2"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={cn(
                  "border-2 border-purple-200/50 focus:border-purple-400 rounded-xl bg-white/50",
                  errors.name && "border-destructive focus:border-destructive"
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name}</p>
              )}
            </div>


            <div className="space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-wider text-purple-600/80">Show fields</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-purple-100/50 bg-white/50 hover:bg-purple-50/50 transition-colors">
                  <Checkbox
                    id="edit-location"
                    checked={formData.fields.location}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, fields: { ...formData.fields, location: !!checked } })
                    }
                    className="border-purple-300"
                  />
                  <Label htmlFor="edit-location" className="text-sm font-medium cursor-pointer text-purple-700">
                    Location field
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-xl border-2 border-purple-100/50 bg-white/50 hover:bg-purple-50/50 transition-colors">
                  <Checkbox
                    id="edit-message"
                    checked={formData.fields.message}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, fields: { ...formData.fields, message: !!checked } })
                    }
                    className="border-purple-300"
                  />
                  <Label htmlFor="edit-message" className="text-sm font-medium cursor-pointer text-purple-700">
                    Message field
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6 border-t border-purple-100/50">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 mb-4 block">Form Preview</Label>
            <div className="flex justify-center">
              <div className="w-[400px] origin-top scale-[0.65] mb-[-120px]">
                <div className="bg-white rounded-2xl border-2 border-purple-100 p-6 shadow-xl pointer-events-none">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formData.name || "Form Name"}</h3>
                    <p className="text-[12px] text-purple-400">Fill in your details and we'll be in touch.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="h-9 w-full rounded-xl border-2 border-purple-100 bg-purple-50/30" />
                    <div className="h-9 w-full rounded-xl border-2 border-purple-100 bg-purple-50/30" />
                    {formData.fields.location && (
                      <div className="h-9 w-full rounded-xl border-2 border-purple-100 bg-purple-50/30" />
                    )}
                    {formData.fields.message && (
                      <div className="h-20 w-full rounded-xl border-2 border-purple-100 bg-purple-50/30" />
                    )}
                    <div className="h-10 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-t border-purple-100/50 gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="rounded-xl border-2 border-purple-200/50 hover:bg-purple-100/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
