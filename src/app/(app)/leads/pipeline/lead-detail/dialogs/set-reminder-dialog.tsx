// SimpleCRM — set-reminder-dialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, X, Loader2, AlignLeft, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Bell className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">Set Reminder</DialogTitle>
              <p className="text-xs text-neutral-400 mt-1">Schedule a follow-up for this lead</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Date</Label>
              <DatePicker
                value={date}
                onChange={(date) => setDate(date)}
                placeholder="Select date"
                usePortal={false}
                className="h-11 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Time</Label>
              <div className="relative mb-3">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 h-11 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTime(qt.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                      time === qt.value
                        ? "bg-neutral-900 text-white shadow-md"
                        : "bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Note (optional)</Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3.5 size-4 text-neutral-400" />
                <Textarea
                  placeholder="What's the follow-up about?"
                  maxLength={200}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="pl-10 resize-none h-24 pb-8 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl text-[13px]"
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-medium text-neutral-400">
                  {note.length}/200
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-neutral-50 border-t border-neutral-100 flex items-center gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="rounded-xl h-11 px-6 hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !date || !time}
              className="rounded-xl h-11 px-8 bg-neutral-900 text-white hover:bg-black shadow-lg shadow-neutral-200 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Save Reminder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
