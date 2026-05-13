// SimpleCRM — reminders-workspace
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ReminderWithLead } from "@/modules/reminders/reminders.types";
import { RemindersToolbar } from "./reminders-toolbar";
import { RemindersList } from "./reminders-list";
import { RemindersEmptyState } from "./reminders-empty-state";

interface WorkspaceProps {
  initialReminders: ReminderWithLead[];
  isAdmin: boolean;
}

export function RemindersWorkspace({ initialReminders, isAdmin }: WorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderWithLead[]>(initialReminders);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "overdue">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "overdue" || tab === "upcoming") setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab: "all" | "upcoming" | "overdue") => {
    setActiveTab(tab);
    router.push(`/reminders?tab=${tab}`, { scroll: false });
  };

  const handleDismiss = async (id: string) => {
    const prev = reminders;
    setReminders((r) => r.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (!res.ok) throw new Error("dismiss failed");
      toast.success("Reminder dismissed");
    } catch {
      setReminders(prev);
      toast.error("Failed to dismiss reminder");
    }
  };

  const handleReschedule = async (id: string, dueAt: string, note: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", dueAt, note }),
      });
      if (!res.ok) throw new Error("reschedule failed");
      // Refresh full list to get the new reminder with its lead shape
      const listRes = await fetch("/api/reminders");
      if (listRes.ok) {
        const fresh: ReminderWithLead[] = await listRes.json();
        setReminders(fresh);
      }
      toast.success("Reminder rescheduled");
    } catch {
      toast.error("Failed to reschedule reminder");
    }
  };

  const now = new Date();
  const filtered = reminders.filter((r) => {
    const matchesSearch = r.lead.name.toLowerCase().includes(search.toLowerCase());
    const isOverdue = new Date(r.dueAt) < now;
    if (activeTab === "upcoming") return matchesSearch && !isOverdue;
    if (activeTab === "overdue") return matchesSearch && isOverdue;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <RemindersToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        search={search}
        onSearchChange={setSearch}
      />
      {filtered.length > 0 ? (
        <RemindersList
          reminders={filtered}
          isAdmin={isAdmin}
          onDismiss={handleDismiss}
          onReschedule={handleReschedule}
        />
      ) : (
        <RemindersEmptyState variant={activeTab} />
      )}
    </div>
  );
}
