// SimpleCRM — form-row
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, MoreHorizontal, Code } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditFormDialog } from "./dialogs/edit-form-dialog";
import { EmbedCodeDialog } from "./dialogs/embed-code-dialog";

interface FormRowProps {
  form: CaptureFormWithCount;
  onRefresh: () => void;
}

const SOURCE_CONFIG: Record<string, { label: string; className: string }> = {
  FACEBOOK_AD: { label: "Facebook Ad", className: "bg-blue-50 text-blue-700 border-blue-100" },
  INSTAGRAM: { label: "Instagram", className: "bg-pink-50 text-pink-700 border-pink-100" },
  WEBSITE: { label: "Website", className: "bg-green-50 text-green-700 border-green-100" },
  REFERRAL: { label: "Referral", className: "bg-purple-50 text-purple-700 border-purple-100" },
  COLD_OUTREACH: { label: "Cold Outreach", className: "bg-orange-50 text-orange-700 border-orange-100" },
  WALK_IN: { label: "Walk-in", className: "bg-teal-50 text-teal-700 border-teal-100" },
  OTHER: { label: "Other", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

export function FormRow({ form, onRefresh }: FormRowProps) {
  const [isActive, setIsActive] = useState(form.isActive);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/form/${form.slug}`);
  }, [form.slug]);

  const handleToggleActive = async () => {
    const next = !isActive;
    setIsActive(next);
    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Form activated" : "Form deactivated");
    } catch {
      setIsActive(!next);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Form deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete form");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied");
  };

  const source = SOURCE_CONFIG[form.sourceTag] || SOURCE_CONFIG.OTHER;

  return (
    <tr className="group transition-colors hover:bg-neutral-50/50">
      <td className="px-6 py-4">
        <span className="text-[14px] font-medium text-neutral-900">{form.name}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-neutral-400 truncate max-w-[140px]">/form/{form.slug}</span>
          <button onClick={handleCopyUrl} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <Copy className="h-3 w-3" />
          </button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant="outline" className={cn("rounded-md border font-medium", source.className)}>
          {source.label}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="text-[13px] text-neutral-600 font-medium">
          {form._count.leadSources} <span className="text-neutral-400 font-normal ml-0.5">leads</span>
        </span>
      </td>
      <td className="px-6 py-4">
        <Switch checked={isActive} onCheckedChange={handleToggleActive} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 flex items-center justify-center transition-colors outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>Edit settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEmbedOpen(true)}>
                <Code className="mr-2 h-3.5 w-3.5" />
                Get embed code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className={cn(isDeleting ? "bg-red-50 text-red-600 font-semibold" : "text-red-600")}
              >
                {isDeleting ? "Confirm delete?" : "Delete form"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>

      <EditFormDialog form={form} open={isEditOpen} onClose={() => setIsEditOpen(false)} onUpdated={onRefresh} />
      <EmbedCodeDialog form={form} open={isEmbedOpen} onClose={() => setIsEmbedOpen(false)} />
    </tr>
  );
}
