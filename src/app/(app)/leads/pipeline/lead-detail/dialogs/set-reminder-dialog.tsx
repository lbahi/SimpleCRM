// SimpleCRM — set-reminder-dialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

interface SetReminderDialogProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onReminderSet: (data: { dueAt: string; note: string }) => void;
}

export function SetReminderDialog({ leadId, open, onClose, onReminderSet }: SetReminderDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    const dueAt = new Date(`${date}T${time}`).toISOString();

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, dueAt, note }),
      });

      if (!res.ok) throw new Error("Failed to set reminder");
      
      const formattedDate = new Date(dueAt).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
      toast.success(`Reminder set for ${formattedDate}`);
      onReminderSet({ dueAt, note });
      onClose();
    } catch {
      toast.error("Failed to set reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickTimes = [
    { label: "9:00 AM", value: "09:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "5:00 PM", value: "17:00" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Set Reminder</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-wider text-purple-600/80">Date</label>
            <DatePicker
              value={date}
              onChange={(date) => setDate(date)}
              placeholder="Select date"
              className="text-[13px] border-2 border-purple-200/50 focus:border-purple-400 rounded-xl"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-wider text-purple-600/80">Time</label>
            <div className="space-y-2">
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-[13px] border-2 border-purple-200/50 focus:border-purple-400 rounded-xl"
              />
              <div className="flex flex-wrap gap-2">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTime(qt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      time === qt.value
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : "bg-white/50 border border-purple-200/50 text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <label className="text-[12px] font-bold uppercase tracking-wider text-purple-600/80">Note (optional)</label>
            <Textarea
              placeholder="What's the follow-up about?"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-24 text-[13px] pb-8 border-2 border-purple-200/50 focus:border-purple-400 rounded-xl bg-white/50"
            />
            <span className="absolute bottom-3 right-3 text-[10px] font-medium text-purple-400">
              {note.length}/200
            </span>
          </div>
          
          <DialogFooter className="pt-4 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="rounded-xl border-2 border-purple-200/50 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !date || !time}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
