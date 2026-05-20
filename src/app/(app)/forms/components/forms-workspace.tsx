// SimpleCRM — forms-workspace
"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { useTranslations } from "next-intl";
import { FormsList } from "./forms-list";
import { CreateFormDialog } from "./dialogs/create-form-dialog";
import { toast } from "sonner";

interface WorkspaceProps {
  initialData: CaptureFormWithCount[];
}

export function FormsWorkspace({ initialData }: WorkspaceProps) {
  const t = useTranslations("forms");
  const [forms, setForms] = useState<CaptureFormWithCount[]>(initialData);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const refetch = async () => {
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      }
    } catch (err) {
      toast.error(t("refreshFailed"));
    }
  };

  const handleCreateForm = async (formData: any) => {
    const loadingToast = toast.loading(t("creating"));
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create form");

      toast.success(t("created"), { id: loadingToast });
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(t("createFailed"), { id: loadingToast });
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 font-normal text-neutral-900">{t("title")}</h1>
            <p className="text-gray-600">{t("subtitle")}</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            {t("newForm")}
          </button>
        </div>

        {forms.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <FormsList forms={forms} onRefresh={refetch} />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h2 className="text-xl mb-2 font-semibold">{t("emptyTitle")}</h2>
                <p className="text-gray-600 mb-4">{t("emptyDescription")}</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 inline-flex items-center gap-2 font-medium"
                >
                  <Plus size={16} />
                  {t("newForm")}
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateFormDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreateForm}
        />
      </div>
    </div>
  );
}
