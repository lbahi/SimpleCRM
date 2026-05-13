// SimpleCRM — edit-form-dialog
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Save, ChevronDown } from "lucide-react";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";

interface EditFormDialogProps {
  form: CaptureFormWithCount;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditFormDialog({ form, open, onClose, onUpdated }: EditFormDialogProps) {
  if (!open) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: form.name,
    description: form.description || "Submit your information below",
    sourceTag: form.sourceTag,
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Form name is required";
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

      toast.success("Form settings updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-purple-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Edit Form Settings</h2>
            <p className="text-xs text-purple-100 mt-1">Update global settings for this form</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-purple-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Form Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Website Contact Form"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none transition-all ${
                  errors.name ? "border-red-200" : "border-gray-200 focus:border-purple-600"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-500 font-bold">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Display Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Fill in the details below"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Lead Source Tag</label>
              <div className="relative">
                <select
                  value={formData.sourceTag}
                  onChange={(e) => setFormData({ ...formData, sourceTag: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-600 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="FACEBOOK_AD">Facebook Ad</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="COLD_OUTREACH">Cold Outreach</option>
                  <option value="WALK_IN">Walk-in</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">Leads from this form will be tagged with this value</p>
            </div>

          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? "Saving..." : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

