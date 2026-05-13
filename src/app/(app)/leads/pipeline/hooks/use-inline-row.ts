// SimpleCRM — use-inline-row.ts
import { useState } from "react";
import { toast } from "sonner";
import { ColumnId } from "../model";

export function useInlineRow(onSuccess: () => Promise<void>) {
  const [isActive, setIsActive] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<ColumnId | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const activate = (columnId: ColumnId) => {
    setIsActive(true);
    setActiveCell(columnId);
  };

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  const cancel = () => {
    setIsActive(false);
    setValues({});
    setActiveCell(null);
    setErrors({});
  };

  const submit = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!values.name?.trim()) newErrors.name = true;
    if (!values.phone?.trim()) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Name and Phone are required");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          source: "MANUAL",
          status: values.salesStatus || "NEW",
        }),
      });

      if (!res.ok) throw new Error("Failed to create lead");

      toast.success("Lead created successfully");
      cancel();
      await onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create lead");
    }
  };

  return {
    isActive,
    values,
    activeCell,
    errors,
    activate,
    setValue,
    submit,
    cancel,
  };
}

export type InlineRowState = ReturnType<typeof useInlineRow>;
