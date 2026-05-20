// SimpleCRM — public-form
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CaptureForm } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { FormSuccess } from "./form-success";
import { FormFieldRenderer } from "./form-field-renderer";

interface FormFieldItem {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface PublicFormProps {
  form: CaptureForm;
  brandColor: string;
  logoUrl: string | null;
}

export function PublicForm({ form, brandColor, logoUrl }: PublicFormProps) {
  const t = useTranslations("common");
  const [state, setState] = useState<"FORM" | "SUCCESS">("FORM");
  const [logo, setLogo] = useState<string | null>(logoUrl);
  const [color, setColor] = useState<string>(brandColor);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.logoUrl !== undefined) setLogo(d.logoUrl);
        if (d.brandColor) setColor(d.brandColor);
      })
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  const fieldsData = form.fields as unknown as {
    items: FormFieldItem[];
    submitButtonText?: string;
  };

  const formFields = fieldsData?.items || [];
  const submitText = fieldsData?.submitButtonText || t("sendRequest");

  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    formFields.forEach((field) => {
      const val = values[field.id];
      const isEmpty =
        !val ||
        (typeof val === "string" && val.trim().length === 0) ||
        (Array.isArray(val) && val.length === 0);

      if (field.required && isEmpty) {
        newErrors[field.id] = t("required", { field: field.label });
      }
      if (
        field.type === "tel" &&
        val &&
        typeof val === "string" &&
        val.replace(/\D/g, "").length < 6
      ) {
        newErrors[field.id] = t("validPhone");
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
    } catch {
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === "SUCCESS") {
    return <FormSuccess />;
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center mb-8">
        {/* Header Logo */}
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto object-contain mx-auto mb-6 max-w-full"
          />
        ) : (
          <div className="relative h-24 w-full max-w-[200px] mx-auto mb-6">
            <Image
              src="/Logo.svg"
              alt="Logo"
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
        )}

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
              {field.required && <span className="text-red-500 ms-1">*</span>}
            </label>

            <FormFieldRenderer
              field={field}
              values={values}
              errors={errors}
              setValues={setValues}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />

            {errors[field.id] && (
              <p className="text-red-500 text-[11px] font-bold ml-1 animate-in fade-in duration-300 uppercase tracking-tight">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: color }}
          className="w-full mt-4 h-14 text-white rounded-xl font-bold text-lg transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-neutral-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("processing")}</span>
            </>
          ) : (
            submitText
          )}
        </button>
      </form>
    </div>
  );
}
