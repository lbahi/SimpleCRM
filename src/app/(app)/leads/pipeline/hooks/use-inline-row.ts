// SimpleCRM — use-inline-row.ts
import { useState } from "react";
import { toast } from "sonner";
import { ColumnId } from "../model";
import { LeadStatus } from "@prisma/client";

export function useInlineRow(onSuccess: () => Promise<void>) {
  const [isActive, setIsActive] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({
    sources: ["MANUAL"]
  });
  const [activeCell, setActiveCell] = useState<ColumnId | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const activate = async (columnId: ColumnId) => {
    setIsActive(true);
    setActiveCell(columnId);
    
    // Auto-assign logic: fetch members and find the one with the fewest leads
    try {
      const res = await fetch("/api/users?role=MEMBER");
      if (res.ok) {
        const members = await res.json();
        let defaultAssignedToId = "";
        
        if (members.length === 1) {
          defaultAssignedToId = members[0].id;
        } else if (members.length > 1) {
          // Find member with fewest open leads
          const bestMember = members.reduce((prev: any, curr: any) => 
            (prev.openLeads || 0) <= (curr.openLeads || 0) ? prev : curr
          );
          defaultAssignedToId = bestMember.id;
        }
        
        setValues(prev => ({ 
          ...prev, 
          assignedToId: defaultAssignedToId,
          status: LeadStatus.NEW,
          rating: 0,
          sources: ["MANUAL"]
        }));
      }
    } catch (error) {
      console.error("Auto-assign failed", error);
      setValues(prev => ({ 
        ...prev, 
        status: LeadStatus.NEW,
        rating: 0,
        sources: ["MANUAL"]
      }));
    }
  };

  const setValue = (key: string, val: any) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const cancel = () => {
    setIsActive(false);
    setValues({ sources: ["MANUAL"] });
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
          // 'source' is the primary source string, 'sources' is the array of tags
          source: values.sources?.[0] || "MANUAL",
          rating: values.rating ? parseInt(values.rating) : 0
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
