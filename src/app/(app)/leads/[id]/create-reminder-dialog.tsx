// SimpleCRM — create-reminder-dialog
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reminderSchema, type ReminderInput } from "@/modules/reminders/reminders.schema";
import { toast } from "sonner";

interface CreateReminderDialogProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateReminderDialog({
  leadId,
  open,
  onClose,
  onCreated,
}: CreateReminderDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: {
      leadId: leadId,
      dueAt: new Date(Date.now() + 86400000).toISOString(), // Default to tomorrow
    },
  });

  const onSubmit = async (data: ReminderInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create reminder");

      toast.success("Reminder set");
      reset();
      onCreated();
    } catch (error) {
      toast.error("Failed to create reminder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogDescription>
            Schedule a follow-up or task for this lead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dueAt">Due Date & Time *</Label>
            <Input
              id="dueAt"
              type="datetime-local"
              {...register("dueAt")}
            />
            {errors.dueAt && (
              <p className="text-xs text-destructive">Invalid date/time</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add more details..."
              className="resize-none"
              {...register("note")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
