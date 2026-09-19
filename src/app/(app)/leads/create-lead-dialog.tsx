// SimpleCRM — create-lead-dialog.tsx
"use client";

import { useState, useEffect } from "react";
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
import { createLeadSchema, type CreateLeadInput } from "@/modules/leads/leads.schema";
import { toast } from "sonner";
import { createLead } from "@/app/actions/leads";

interface CreateLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultStatus?: string;
}

export function CreateLeadDialog({
  open,
  onClose,
  onCreated,
  defaultStatus,
}: CreateLeadDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema) as any,
    defaultValues: {
      source: "WEBSITE",
      tags: [],
      status: (defaultStatus as any) || "NEW",
    },
  });

  // Reset form when dialog opens with potentially new default status
  useEffect(() => {
    if (open) {
      reset({
        name: "",
        phone: "",
        location: "",
        rating: 0,
        sources: [],
        source: "WEBSITE",
        tags: [],
        status: (defaultStatus as any) || "NEW",
      });
    }
  }, [open, defaultStatus, reset]);

  const onSubmit = async (data: CreateLeadInput) => {
    setLoading(true);
    try {
      await createLead(data);
      toast.success("Lead created successfully");
      reset();
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead manually. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="New York, NY"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location.message}</p>
            )}
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-neutral-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {loading ? "Creating..." : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
