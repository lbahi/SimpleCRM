// SimpleCRM — form-row
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, MoreHorizontal, Code } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
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

const SOURCE_CONFIG: Record<string, { className: string }> = {
  FACEBOOK_AD: { className: "bg-blue-50 text-blue-700 border-blue-100" },
  INSTAGRAM: { className: "bg-pink-50 text-pink-700 border-pink-100" },
  WEBSITE: { className: "bg-green-50 text-green-700 border-green-100" },
  REFERRAL: { className: "bg-purple-50 text-purple-700 border-purple-100" },
  COLD_OUTREACH: { className: "bg-orange-50 text-orange-700 border-orange-100" },
  WALK_IN: { className: "bg-teal-50 text-teal-700 border-teal-100" },
  OTHER: { className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

export function FormRow({ form, onRefresh }: FormRowProps) {
  const t = useTranslations("forms");
  const sources = useTranslations("sources");
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
      toast.success(next ? t("activated") : t("deactivated"));
    } catch {
      setIsActive(!next);
      toast.error(t("statusUpdateFailed"));
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
      toast.success(t("deleted"));
      onRefresh();
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t("linkCopied"));
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
          {sources(form.sourceTag) || sources("OTHER")}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <span className="text-[13px] text-neutral-600 font-medium">
          {form._count.leadSources} <span className="text-neutral-400 font-normal ms-0.5">{t("leads")}</span>
        </span>
      </td>
      <td className="px-6 py-4">
        <label className="premium-switch">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={handleToggleActive} 
          />
          <div className="slider">
            <div className="circle">
              <svg className="cross" viewBox="0 0 365.696 365.696" height={6} width={6}>
                <g>
                  <path fill="currentColor" d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0" />
                </g>
              </svg>
              <svg className="checkmark" viewBox="0 0 24 24" height={10} width={10}>
                <g>
                  <path fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                </g>
              </svg>
            </div>
          </div>
        </label>
      </td>

      <td className="px-6 py-4 text-end">
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 flex items-center justify-center transition-colors outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <MoreHorizontal className="me-2 h-4 w-4 text-purple-500" />
                {t("editSettings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEmbedOpen(true)}>
                <Code className="me-2 h-4 w-4 text-purple-500" />
                {t("embedCode")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className={cn(isDeleting ? "bg-red-50 text-red-600 font-semibold" : "text-red-600")}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 flex items-center justify-center", isDeleting ? "text-red-600" : "text-red-400")}>
                    {isDeleting ? "!" : "×"}
                  </div>
                  {isDeleting ? t("confirmDelete") : t("deleteForm")}
                </div>
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
