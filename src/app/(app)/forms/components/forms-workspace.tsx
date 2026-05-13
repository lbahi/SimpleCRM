// SimpleCRM — forms-workspace
"use client";

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { FormsList } from "./forms-list";
import { CreateFormDialog } from "./dialogs/create-form-dialog";
import { toast } from "sonner";

interface WorkspaceProps {
  initialData: CaptureFormWithCount[];
}

export function FormsWorkspace({ initialData }: WorkspaceProps) {
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
      toast.error("Failed to refresh forms");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 -m-6 h-[calc(100vh-64px)]">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2 font-normal text-neutral-900">Capture Forms</h1>
            <p className="text-gray-600">Manage your lead intake forms</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            New form
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
                <h2 className="text-xl mb-2 font-semibold">No forms yet</h2>
                <p className="text-gray-600 mb-4">Create your first form to start capturing leads.</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 inline-flex items-center gap-2 font-medium"
                >
                  <Plus size={16} />
                  New form
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateFormDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={refetch}
        />
      </div>
    </div>
  );
}

