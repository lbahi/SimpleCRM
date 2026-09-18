// SimpleCRM — note-comment-edit-form
"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCommentEditFormProps {
  comment: { id: string; body: string };
  onSave: (commentId: string, newBody: string) => Promise<void>;
  onCancel: () => void;
}

export function NoteCommentEditForm({
  comment,
  onSave,
  onCancel,
}: NoteCommentEditFormProps) {
  const [editBody, setEditBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editBody.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(comment.id, editBody.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <input
        value={editBody}
        onChange={(e) => setEditBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") onCancel();
        }}
        disabled={saving}
        autoFocus
        className="text-[12px] px-3 py-2 rounded-xl border border-neutral-300 bg-white outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-200 transition-all disabled:opacity-50"
      />
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          disabled={!editBody.trim() || saving}
          onClick={handleSave}
          className="h-6 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 gap-1 px-2.5 text-[11px]"
        >
          <Check size={10} />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={saving}
          onClick={onCancel}
          className="h-6 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 gap-1 px-2.5 text-[11px]"
        >
          <X size={10} />
          Cancel
        </Button>
      </div>
    </div>
  );
}
