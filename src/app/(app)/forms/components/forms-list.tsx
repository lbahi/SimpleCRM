// SimpleCRM — forms-list
"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { FormRow } from "./form-row";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreateFormDialog } from "./dialogs/create-form-dialog";

interface FormsListProps {
  forms: CaptureFormWithCount[];
  onRefresh: () => void;
}

export function FormsList({ forms, onRefresh }: FormsListProps) {
  const t = useTranslations("forms");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
        <div className="h-16 w-16 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
          <FileText className="h-8 w-8 text-neutral-300" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">{t("emptyTitle")}</h3>
        <p className="mt-1 text-[14px] text-neutral-500 max-w-xs text-center">
          {t("emptyDescription")}
        </p>
        <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-6 gap-2">
          <Plus className="h-4 w-4" />
          {t("newForm")}
        </Button>
        <CreateFormDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={onRefresh}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      <table className="w-full text-start border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50">
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">{t("formName")}</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">{t("source")}</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">{t("submissions")}</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">{t("status")}</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider text-end">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {forms.map((form) => (
            <FormRow key={form.id} form={form} onRefresh={onRefresh} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
