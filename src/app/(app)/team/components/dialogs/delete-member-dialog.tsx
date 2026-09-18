"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberWithStats } from "@/modules/users/users.types";

interface DeleteMemberDialogProps {
  member: MemberWithStats;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteMemberDialog({ member, open, onClose, onDeleted }: DeleteMemberDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canConfirm = confirmation === member.name;

  const handleDelete = async () => {
    if (!canConfirm) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${member.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete member");
      }

      toast.success(`${member.name} deleted permanently.`);
      setConfirmation("");
      onDeleted();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setConfirmation("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="max-w-md rounded-3xl border-none p-0 shadow-2xl">
        <DialogHeader className="space-y-4 bg-red-50 p-8 pb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-red-950">Delete Permanently</DialogTitle>
            <p className="text-sm leading-relaxed text-red-900/70">
              This permanently removes the member&apos;s personal information. Historical notes, activity, reminders, and notifications will remain attributed to Deleted Member.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-8">
          <p className="text-sm text-neutral-700">
            Type <span className="font-semibold text-neutral-950">{member.name}</span> to confirm.
          </p>
          <div className="space-y-2">
            <Label htmlFor={`delete-confirm-${member.id}`}>Member name</Label>
            <Input
              id={`delete-confirm-${member.id}`}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={member.name}
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 border-t border-neutral-100 bg-neutral-50 p-6">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={!canConfirm || isSubmitting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}