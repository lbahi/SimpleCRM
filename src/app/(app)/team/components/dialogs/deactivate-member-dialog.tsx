// SimpleCRM — deactivate-member-dialog
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertTriangle, Loader2, UserMinus, ShieldAlert, ArrowRightLeft, Inbox, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { designTokens } from "@/lib/design-system/tokens";
import { MemberWithStats } from "@/modules/users/users.types";

interface DeactivateMemberDialogProps {
  member: MemberWithStats;
  open: boolean;
  onClose: () => void;
  onDeactivated: () => void;
}

export function DeactivateMemberDialog({ 
  member, 
  open, 
  onClose, 
  onDeactivated 
}: DeactivateMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reassignToId, setReassignToId] = useState<string | null>(null);
  const [mode, setMode] = useState<"REASSIGN" | "INBOX">("REASSIGN");
  const [activeMembers, setActiveMembers] = useState<MemberWithStats[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (open && member.openLeads > 0) {
      setLoadingMembers(true);
      fetch("/api/users?role=MEMBER")
        .then(res => res.json())
        .then(data => {
          // Exclude the member being deactivated and only show active members
          const others = data.filter((m: any) => m.id !== member.id && m.isActive);
          setActiveMembers(others);
        })
        .finally(() => setLoadingMembers(false));
    }
  }, [open, member.id, member.openLeads]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const targetId = mode === "REASSIGN" ? reassignToId : null;

    try {
      const res = await fetch(`/api/users/${member.id}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reassignToId: targetId }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      toast.success(
        targetId 
          ? `${member.name} deactivated. ${result.leadsReassigned} leads reassigned.`
          : `${member.name} deactivated. ${result.leadsReturnedToInbox} leads returned to inbox.`
      );
      onDeactivated();
      onClose();
    } catch {
      toast.error("Failed to deactivate member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canConfirm = member.openLeads === 0 || (mode === "INBOX" || (mode === "REASSIGN" && reassignToId));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 text-white relative">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <ShieldAlert className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">Deactivate Member</DialogTitle>
              <p className="text-xs text-red-100/70 mt-1">Removing access for {member.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-red-200 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="bg-white">
          <div className="p-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
              <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900 leading-none">
                  {member.name} has {member.openLeads} open leads.
                </p>
                <p className="text-xs text-amber-800/80 leading-relaxed mt-1">
                  You must decide what happens to these leads before the member can be safely deactivated.
                </p>
              </div>
            </div>

            {member.openLeads > 0 ? (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400 pl-1">Reassignment Method</Label>
                <RadioGroup value={mode} onValueChange={(val: string) => setMode(val as any)} className="grid grid-cols-1 gap-3">
                  <div 
                    onClick={() => setMode("REASSIGN")}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                      mode === "REASSIGN" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all",
                      mode === "REASSIGN" ? "border-neutral-900" : "border-neutral-300"
                    )}>
                      {mode === "REASSIGN" && <div className="size-2 rounded-full bg-neutral-900" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="size-3.5 text-neutral-500" />
                        <span className="text-sm font-bold text-neutral-900">Transfer to Member</span>
                      </div>
                      <p className="text-xs text-neutral-500">Pick another active representative</p>
                      
                      {mode === "REASSIGN" && (
                        <div className="pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <Select value={reassignToId || ""} onValueChange={setReassignToId}>
                            <SelectTrigger className="h-10 rounded-xl border-neutral-200 bg-white">
                              <SelectValue placeholder="Select target member" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-1 shadow-xl border-neutral-100">
                              {activeMembers.map((m) => (
                                <SelectItem key={m.id} value={m.id} className="rounded-lg py-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 ring-1 ring-neutral-200">
                                      <AvatarFallback className="text-[9px] font-bold bg-neutral-100 text-neutral-600">
                                        {m.avatarInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{m.name}</span>
                                      <span className="text-[10px] text-neutral-400">{m.openLeads} open leads</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              {activeMembers.length === 0 && !loadingMembers && (
                                <div className="p-4 text-center text-xs text-neutral-400">No available members</div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div 
                    onClick={() => setMode("INBOX")}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                      mode === "INBOX" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all",
                      mode === "INBOX" ? "border-neutral-900" : "border-neutral-300"
                    )}>
                      {mode === "INBOX" && <div className="size-2 rounded-full bg-neutral-900" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Inbox className="size-3.5 text-neutral-500" />
                        <span className="text-sm font-bold text-neutral-900">Return to General Inbox</span>
                      </div>
                      <p className="text-xs text-neutral-500">Leads will be unassigned and visible to admins</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <div className="size-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto ring-1 ring-neutral-100">
                  <UserMinus className="size-6 text-neutral-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-900">Safe Deactivation</p>
                  <p className="text-xs text-neutral-500 px-8">This member has no active leads. You can proceed without reassignment.</p>
                </div>
              </div>
            )}
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
              onClick={handleSubmit} 
              disabled={isSubmitting || !canConfirm}
              className="rounded-xl h-11 px-8 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
