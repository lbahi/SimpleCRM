// SimpleCRM — forms-list
"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { FormRow } from "./form-row";
import { useState } from "react";
import { CreateFormDialog } from "./dialogs/create-form-dialog";

interface FormsListProps {
  forms: CaptureFormWithCount[];
  onRefresh: () => void;
}

export function FormsList({ forms, onRefresh }: FormsListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
        <div className="h-16 w-16 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
          <FileText className="h-8 w-8 text-neutral-300" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">No forms yet</h3>
        <p className="mt-1 text-[14px] text-neutral-500 max-w-xs text-center">
          Create your first form to start capturing leads.
        </p>
        <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-6 gap-2">
          <Plus className="h-4 w-4" />
          New form
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
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/50">
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Form name</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Source</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Submissions</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-[12px] font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
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
