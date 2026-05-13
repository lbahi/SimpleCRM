// SimpleCRM — assign-dialog
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Users, UserPlus, CheckCircle2 } from "lucide-react";
import { designTokens } from "@/lib/design-system/tokens";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: (assignedIds: string[]) => void;
}

interface Member {
  id: string;
  name: string;
  avatarInitials: string;
  _count?: { assignedLeads: number };
}

export function AssignDialog({ open, onOpenChange, selectedIds, onSuccess }: AssignDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/users?role=MEMBER")
        .then((res) => res.json())
        .then((data) => setMembers(data.users || data))
        .catch(() => toast.error("Failed to load members"));
      setSelectedMember(null);
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedMember || selectedIds.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedIds, assignedToId: selectedMember }),
      });

      if (!res.ok) throw new Error("Failed to assign leads");

      const memberName = members.find((m) => m.id === selectedMember)?.name;
      toast.success(`${selectedIds.length} leads assigned to ${memberName}`);
      onSuccess(selectedIds);
    } catch (error) {
      toast.error("An error occurred during assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] gap-0 rounded-[32px] border-none bg-white p-0 shadow-2xl overflow-hidden">
        <DialogHeader className="p-8 pb-4 text-left">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-xl shadow-neutral-900/10">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-neutral-900">
            Assign {selectedIds.length} {selectedIds.length === 1 ? "Lead" : "Leads"}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-neutral-500">
            Select a team member to handle these leads. They will receive a notification immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[380px] overflow-y-auto px-6 py-2">
          <div className="space-y-3 pb-4">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="mb-3 h-10 w-10 text-neutral-200" />
                <p className="text-sm font-medium text-neutral-400">No active members found</p>
              </div>
            ) : (
              members.map((member) => {
                const isSelected = selectedMember === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMember(member.id)}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                        : "border-neutral-50 bg-neutral-50/50 hover:border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    <Avatar className={cn(
                      "h-10 w-10 border-2 transition-colors",
                      isSelected ? "border-white/20" : "border-white"
                    )}>
                      <AvatarFallback className={cn(
                        "font-bold text-xs transition-colors",
                        isSelected ? "bg-white/10 text-white" : "bg-white text-neutral-900 shadow-sm"
                      )}>
                        {member.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 overflow-hidden">
                      <p className={cn(
                        "truncate text-sm font-bold tracking-tight transition-colors",
                        isSelected ? "text-white" : "text-neutral-900"
                      )}>
                        {member.name}
                      </p>
                      <p className={cn(
                        "text-xs transition-colors",
                        isSelected ? "text-white/60" : "text-neutral-400"
                      )}>
                        {member._count?.assignedLeads ?? 0} active leads
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-neutral-50/50 p-6">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl px-6 text-sm font-bold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            Cancel
          </Button>
          <Button 
            disabled={!selectedMember || isSubmitting} 
            onClick={handleAssign}
            className="h-11 rounded-xl bg-neutral-900 px-8 text-sm font-bold text-white hover:bg-neutral-800 disabled:bg-neutral-200 shadow-lg shadow-neutral-900/10"
          >
            {isSubmitting ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
