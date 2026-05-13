// SimpleCRM — use-lead-mutations.ts
import { toast } from "sonner";
import { PipelineLead } from "../../model";
import type { NoteItem, ActivityItem } from "./use-lead-detail";
import { updateLeadStatus, updateLead, logContact } from "@/app/actions/leads";
import { LeadStatus } from "@prisma/client";

interface MutateState {
  setLead: React.Dispatch<React.SetStateAction<PipelineLead | null>>;
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  refresh: () => Promise<void>;
}

export function useLeadMutations(leadId: string, mutate: MutateState, isSample?: boolean) {
  const updateStatus = async (status: string) => {
    if (isSample) return;
    
    let previousStatus = "";
    mutate.setLead((prev) => {
      if (prev) previousStatus = prev.status;
      return prev ? { ...prev, status: status as any } : prev;
    });

    try {
      await updateLeadStatus(leadId, status as LeadStatus);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
      await mutate.refresh();
    }
  };

  const updateRating = async (rating: number) => {
    if (isSample) return;
    
    let previousRating = 0;
    mutate.setLead((prev) => {
      if (prev) previousRating = prev.rating || 0;
      return prev ? { ...prev, rating } : prev;
    });

    try {
      await updateLead(leadId, { rating });
      toast.success("Rating updated");
    } catch {
      toast.error("Failed to update rating");
      await mutate.refresh();
    }
  };

  const logContact = async () => {
    if (isSample) return;
    const now = new Date();
    
    mutate.setLead((prev) => prev ? { ...prev, lastContacted: now } : prev);

    try {
      await logContact(leadId);
      toast.success("Contact logged");
    } catch {
      toast.error("Failed to log contact");
      await mutate.refresh();
    }
  };

  const addNote = async (body: string) => {
    if (isSample) return;
    
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      const note = await res.json();
      
      mutate.setNotes(prev => [note, ...prev]);
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  return { updateStatus, updateRating, logContact, addNote };
}
