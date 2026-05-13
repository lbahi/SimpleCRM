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
  const [values, setValues] = useState<FormState>({
    name: "",
    phone: "",
    location: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = form.fields as { location: boolean; message: boolean };

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (values.phone.trim().length < 6) newErrors.phone = "Valid phone number required";
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
        <h1 className="text-2xl font-semibold text-neutral-900">{form.name}</h1>
        <p className="mt-2 text-sm text-neutral-500">Fill in your details and we'll be in touch.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-neutral-700">
            Full name <span className="text-red-400 ml-0.5">*</span>
          </label>
          <Input
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Your full name"
            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-[12px]">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-neutral-700">
            Phone number <span className="text-red-400 ml-0.5">*</span>
          </label>
          <Input
            type="tel"
            value={values.phone}
            onChange={(e) => setValues({ ...values, phone: e.target.value })}
            placeholder="Your phone number"
            className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.phone && <p className="text-red-500 text-[12px]">{errors.phone}</p>}
        </div>

        {fields.location && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-neutral-700">Location</label>
            <Input
              value={values.location}
              onChange={(e) => setValues({ ...values, location: e.target.value })}
              placeholder="City / Region"
            />
          </div>
        )}

        {fields.message && (
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-neutral-700">Message</label>
            <Textarea
              value={values.message}
              onChange={(e) => setValues({ ...values, message: e.target.value })}
              placeholder="Tell us more..."
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-medium mt-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
}
