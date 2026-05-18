// SimpleCRM — form-preview-card
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "multiselect" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormPreviewCardProps {
  formName: string;
  formDescription: string;
  submitButtonText: string;
  fields: FormField[];
}

export function FormPreviewCard({
  formName,
  formDescription,
  submitButtonText,
  fields,
}: FormPreviewCardProps) {
  const [logo, setLogo] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#171717");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.logoUrl) setLogo(d.logoUrl);
        if (d.brandColor) setColor(d.brandColor);
      })
      .catch((err) => console.error("Error loading preview settings:", err));
  }, []);

  const PreviewSelect = ({ field }: { field: FormField }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const isMulti = field.type === "multiselect";

    const toggleOption = (opt: string) => {
      if (isMulti) {
        setSelected((prev) =>
          prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
        );
      } else {
        setSelected([opt]);
        setIsOpen(false);
      }
    };

    const displayText =
      selected.length > 0
        ? selected.join(", ")
        : field.placeholder || (isMulti ? "Select options..." : "Select an option");

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-gray-300 transition-all text-left shadow-sm active:scale-[0.99]"
        >
          <span
            className={`truncate ${
              selected.length > 0 ? "text-gray-900 font-medium" : "text-gray-400 font-medium"
            }`}
          >
            {displayText}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto p-1.5">
                {field.options
                  ?.filter((opt) => opt.trim().length > 0)
                  .map((opt, i) => {
                    const isActive = selected.includes(opt);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleOption(opt)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors font-medium flex items-center justify-between ${
                          isActive
                            ? "bg-neutral-50 text-neutral-900"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {opt}
                        {isActive && <div className="size-1.5 bg-neutral-950 rounded-full" />}
                      </button>
                    );
                  })}
                {(!field.options ||
                  field.options.filter((opt) => opt.trim().length > 0).length === 0) && (
                  <div className="px-3 py-2 text-sm text-gray-400 italic">No options defined</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPreview = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            readOnly
            placeholder={field.placeholder}
            className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 focus:outline-none cursor-default"
            rows={4}
          />
        );
      case "select":
      case "multiselect":
        return <PreviewSelect field={field} />;
      case "checkbox":
      case "radio":
        return (
          <div className="flex flex-wrap gap-4 mt-2">
            {field.options && field.options.length > 0 ? (
              field.options
                .filter((opt) => opt.length > 0)
                .map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      readOnly
                      type={field.type === "checkbox" ? "checkbox" : "radio"}
                      className="size-4 rounded border-gray-300 text-neutral-950 focus:ring-neutral-900 transition-all cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      {opt}
                    </span>
                  </label>
                ))
            ) : (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  readOnly
                  type={field.type === "checkbox" ? "checkbox" : "radio"}
                  className="size-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-800 transition-all cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Default {field.type} option
                </span>
              </label>
            )}
          </div>
        );
      default:
        return (
          <input
            readOnly
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none cursor-default"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto border border-gray-100">
      <div className="text-center mb-8">
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto object-contain mx-auto mb-6 max-w-full"
          />
        ) : (
          <div className="relative h-20 w-full max-w-[160px] mx-auto mb-6">
            <Image
              src="/Logo.svg"
              alt="Logo"
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{formName || "Form Title"}</h2>
        <p className="text-sm text-gray-500">{formDescription}</p>
      </div>

      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderPreview(field)}
          </div>
        ))}
      </div>

      <button
        style={{ backgroundColor: color }}
        className="w-full mt-8 px-4 py-3.5 text-white rounded-lg font-bold hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
      >
        {submitButtonText}
      </button>
    </div>
  );
}
