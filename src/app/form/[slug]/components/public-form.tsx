// SimpleCRM — public-form
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CaptureForm } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormSuccess } from "./form-success";

interface PublicFormProps {
  form: CaptureForm;
}

interface FormState {
  name: string;
  phone: string;
  location: string;
  message: string;
}

export function PublicForm({ form }: PublicFormProps) {
  const [state, setState] = useState<"FORM" | "SUCCESS">("FORM");
  
  // Parse the new fields structure
  const fieldsData = form.fields as { 
    items: any[]; 
    submitButtonText?: string;
  };
  
  const formFields = fieldsData.items || [];
  const submitText = fieldsData.submitButtonText || "Send Request";

  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    formFields.forEach(field => {
      if (field.required && !values[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      if (field.type === 'tel' && values[field.id] && values[field.id].length < 6) {
        newErrors[field.id] = "Valid phone number required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forms/submit/${form.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Submission failed");
      setState("SUCCESS");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === "SUCCESS") {
    return <FormSuccess />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{form.name}</h1>
        {form.description && (
          <p className="mt-2 text-[14px] text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
            {form.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <label className="text-[13px] font-medium text-neutral-700 flex items-center justify-between">
              {field.label}
              {field.required && <span className="text-red-400 text-[10px] uppercase tracking-wider font-bold">Required</span>}
            </label>
            
            {field.type === 'select' || field.type === 'multiselect' ? (
              <select
                multiple={field.type === 'multiselect'}
                value={values[field.id] || (field.type === 'multiselect' ? [] : "")}
                onChange={(e) => {
                  if (field.type === 'multiselect') {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setValues({ ...values, [field.id]: selectedOptions });
                  } else {
                    setValues({ ...values, [field.id]: e.target.value });
                  }
                }}
                className={`w-full px-4 py-2.5 bg-neutral-50 border rounded-xl text-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-black/5 ${
                  errors[field.id] ? "border-red-200 bg-red-50/30" : "border-neutral-100 hover:border-neutral-200 focus:border-black"
                }`}
              >
                {!field.required && <option value="">Select an option</option>}
                {field.options?.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <Textarea
                value={values[field.id] || ""}
                onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                rows={3}
                className={`resize-none bg-neutral-50 border-neutral-100 ${errors[field.id] ? "border-red-200" : ""}`}
              />
            ) : (
              <Input
                type={field.type === 'tel' ? 'tel' : 'text'}
                value={values[field.id] || ""}
                onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                className={`h-11 bg-neutral-50 border-neutral-100 ${errors[field.id] ? "border-red-200" : ""}`}
              />
            )}
            
            {errors[field.id] && (
              <p className="text-red-500 text-[11px] font-medium ml-1">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <Button 
          type="submit" 
          className="w-full h-12 text-[15px] font-bold bg-black text-white hover:bg-neutral-800 rounded-xl transition-all active:scale-[0.98] mt-4" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </div>
  );
}
