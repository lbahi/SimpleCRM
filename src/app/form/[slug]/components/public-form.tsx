// SimpleCRM — public-form
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CaptureForm } from "@prisma/client";
import { Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { FormSuccess } from "./form-success";

interface PublicFormProps {
  form: CaptureForm;
}

export function PublicForm({ form }: PublicFormProps) {
  const [state, setState] = useState<"FORM" | "SUCCESS">("FORM");
  
  const fieldsData = form.fields as { 
    items: any[]; 
    submitButtonText?: string;
  };
  
  const formFields = fieldsData.items || [];
  const submitText = fieldsData.submitButtonText || "Send Request";

  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

  const renderField = (field: any) => {
    const isMulti = field.type === 'multiselect';
    const isSelect = field.type === 'select' || isMulti;

    if (isSelect) {
      const selected = values[field.id] || (isMulti ? [] : "");
      const displayText = isMulti 
        ? (selected.length > 0 ? selected.join(', ') : (field.placeholder || "Select options..."))
        : (selected || (field.placeholder || "Select an option"));

      return (
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === field.id ? null : field.id)}
            className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm bg-white transition-all text-left shadow-sm active:scale-[0.99] ${
              errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className={`truncate ${selected.length > 0 || (!isMulti && selected) ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}`}>
              {displayText}
            </span>
            <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform duration-200 ${activeDropdown === field.id ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === field.id && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto p-1.5">
                  {field.options?.filter((opt: string) => opt.trim().length > 0).map((opt: string, i: number) => {
                    const isActive = isMulti ? selected.includes(opt) : selected === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (isMulti) {
                            const next = selected.includes(opt) 
                              ? selected.filter((o: string) => o !== opt)
                              : [...selected, opt];
                            setValues({ ...values, [field.id]: next });
                          } else {
                            setValues({ ...values, [field.id]: opt });
                            setActiveDropdown(null);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors font-medium flex items-center justify-between ${
                          isActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {opt}
                        {isActive && <div className="size-1.5 bg-purple-600 rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={values[field.id] || ""}
          onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
          placeholder={field.placeholder}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl text-sm bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all resize-none ${
            errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
          }`}
        />
      );
    }

    if (field.type === 'checkbox' || field.type === 'radio') {
      return (
        <div className="flex flex-wrap gap-4 pt-1">
          {field.options?.map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer group">
              <input
                type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                name={`field-${field.id}`}
                checked={field.type === 'checkbox' ? (values[field.id] || []).includes(opt) : values[field.id] === opt}
                onChange={(e) => {
                  if (field.type === 'checkbox') {
                    const current = values[field.id] || [];
                    const next = e.target.checked ? [...current, opt] : current.filter((o: string) => o !== opt);
                    setValues({ ...values, [field.id]: next });
                  } else {
                    setValues({ ...values, [field.id]: opt });
                  }
                }}
                className="size-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type={field.type === 'tel' ? 'tel' : 'text'}
        value={values[field.id] || ""}
        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
        placeholder={field.placeholder}
        className={`w-full h-12 px-4 border rounded-xl text-sm bg-white focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all ${
          errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
        }`}
      />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="relative h-24 w-full max-w-[200px] mx-auto mb-6">
          <Image 
            src="/Logo.svg" 
            alt="Logo" 
            fill 
            className="object-contain opacity-90"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>

        {form.description && (
          <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
            {form.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest px-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {renderField(field)}
            
            {errors[field.id] && (
              <p className="text-red-500 text-[11px] font-bold ml-1 animate-in fade-in duration-300 uppercase tracking-tight">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-4 h-14 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            submitText
          )}
        </button>
      </form>
    </div>
  );
}
