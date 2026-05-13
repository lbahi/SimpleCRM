// SimpleCRM — use-lead-detail.ts
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { PipelineLead, checkResponse } from "../../model";

interface NoteAuthor {
  avatarInitials: string;
  name: string;
}

export interface NoteItem {
  id: string;
  author: NoteAuthor;
  createdAt: string | Date;
  body?: string;
  content?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  fromValue?: string;
  toValue?: string;
  createdAt: string | Date;
  actor: {
    name: string;
  };
}

export interface ReminderItem {
  id: string;
  dueAt: string;
  note: string | null;
  status: "PENDING" | "DISMISSED" | "RESCHEDULED";
}

export function useLeadDetail(leadId?: string, isSample?: boolean) {
  const [lead, setLead] = useState<PipelineLead | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!leadId || isSample) return;
    setIsLoading(true);
    try {
      const [leadRes, notesRes, activityRes, remindersRes] = await Promise.all([
        fetch(`/api/leads/${leadId}`).then(checkResponse).then(r => r.json()),
        fetch(`/api/leads/${leadId}/notes`).then(checkResponse).then(r => r.json()),
        fetch(`/api/leads/${leadId}/activity`).then(checkResponse).then(r => r.json()),
        fetch(`/api/leads/${leadId}/reminders?status=PENDING`).then(checkResponse).then(r => r.json()),
      ]);
      setLead(leadRes);
      setNotes(notesRes);
      setActivityLogs(activityRes);
      setReminders(remindersRes);
    } catch (error) {
      toast.error("Failed to load lead details");
    } finally {
      setIsLoading(false);
    }
  }, [leadId, isSample]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const mutate = {
    setLead,
    setNotes,
    setActivityLogs,
    setReminders,
    refresh: fetchDetail,
  };

  return { lead, notes, activityLogs, reminders, isLoading, mutate };
}
