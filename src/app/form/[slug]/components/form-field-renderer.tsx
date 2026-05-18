// SimpleCRM — form-field-renderer
"use client";

import { ChevronDown } from "lucide-react";

interface FormFieldItem {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormFieldRendererProps {
  field: FormFieldItem;
  values: Record<string, string | string[]>;
  errors: Record<string, string>;
  setValues: (vals: Record<string, string | string[]>) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

export function FormFieldRenderer({
  field,
  values,
  errors,
  setValues,
  activeDropdown,
  setActiveDropdown,
}: FormFieldRendererProps) {
  const isMulti = field.type === "multiselect";
  const isSelect = field.type === "select" || isMulti;

  if (isSelect) {
    const selected = (values[field.id] || (isMulti ? [] : "")) as string | string[];
    const isSelectedArray = Array.isArray(selected);
    const displayText = isMulti
      ? isSelectedArray && selected.length > 0
        ? selected.join(", ")
        : field.placeholder || "Select options..."
      : selected
      ? (selected as string)
      : field.placeholder || "Select an option";

    const selectedOptions = isSelectedArray ? (selected as string[]) : [];

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setActiveDropdown(activeDropdown === field.id ? null : field.id)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm bg-white transition-all text-left shadow-sm active:scale-[0.99] ${
            errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span
            className={`truncate ${(isMulti && selectedOptions.length > 0) || (!isMulti && selected)
              ? "text-gray-900 font-medium"
              : "text-gray-400 font-medium"}`}
          >
            {displayText}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${
              activeDropdown === field.id ? "rotate-180" : ""
            }`}
          />
        </button>

        {activeDropdown === field.id && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto p-1.5">
                {field.options
                  ?.filter((opt) => opt.trim().length > 0)
                  .map((opt, i) => {
                    const isActive = isMulti ? selectedOptions.includes(opt) : selected === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (isMulti) {
                            const next = selectedOptions.includes(opt)
                              ? selectedOptions.filter((o) => o !== opt)
                              : [...selectedOptions, opt];
                            setValues({ ...values, [field.id]: next });
                          } else {
                            setValues({ ...values, [field.id]: opt });
                            setActiveDropdown(null);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors font-medium flex items-center justify-between ${
                          isActive
                            ? "bg-neutral-50 text-neutral-950"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {opt}
                        {isActive && <div className="size-1.5 bg-neutral-950 rounded-full" />}
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

  if (field.type === "textarea") {
    const textVal = (values[field.id] || "") as string;
    return (
      <textarea
        value={textVal}
        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
        placeholder={field.placeholder}
        rows={4}
        className={`w-full px-4 py-3 border rounded-xl text-sm bg-white focus:ring-4 focus:ring-neutral-50 focus:border-neutral-300 outline-none transition-all resize-none ${
          errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
        }`}
      />
    );
  }

  if (field.type === "checkbox" || field.type === "radio") {
    return (
      <div className="flex flex-wrap gap-4 pt-1">
        {field.options?.map((opt, i) => {
          const currentVal = values[field.id];
          const isChecked =
            field.type === "checkbox"
              ? Array.isArray(currentVal) && currentVal.includes(opt)
              : currentVal === opt;

          return (
            <label key={i} className="flex items-center gap-2 cursor-pointer group">
              <input
                type={field.type === "checkbox" ? "checkbox" : "radio"}
                name={`field-${field.id}`}
                checked={isChecked}
                onChange={(e) => {
                  if (field.type === "checkbox") {
                    const currentArr = Array.isArray(currentVal) ? currentVal : [];
                    const next = e.target.checked
                      ? [...currentArr, opt]
                      : currentArr.filter((o) => o !== opt);
                    setValues({ ...values, [field.id]: next });
                  } else {
                    setValues({ ...values, [field.id]: opt });
                  }
                }}
                className="size-4 rounded border-gray-300 text-neutral-950 focus:ring-neutral-900 transition-all cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  const strVal = (values[field.id] || "") as string;
  return (
    <input
      type={field.type === "tel" ? "tel" : "text"}
      value={strVal}
      onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
      placeholder={field.placeholder}
      className={`w-full h-12 px-4 border rounded-xl text-sm bg-white focus:ring-4 focus:ring-neutral-50 focus:border-neutral-300 outline-none transition-all ${
        errors[field.id] ? "border-red-200" : "border-gray-200 hover:border-gray-300"
      }`}
    />
  );
}
