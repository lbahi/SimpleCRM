// SimpleCRM — invite-member-dialog
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Mail, Lock, UserCircle, ShieldCheck } from "lucide-react";
import { designTokens } from "@/lib/design-system/tokens";

import { cn } from "@/lib/utils";

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function InviteMemberDialog({ open, onClose, onCreated }: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatarInitials: "",
  });

  const handleInitialsChange = (val: string) => {
    setFormData({ ...formData, avatarInitials: val.slice(0, 2).toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 409) {
        setError("This email is already in use");
        return;
      }

      if (!res.ok) throw new Error();

      toast.success(`${formData.name} has been added to the team`);
      onCreated();
      onClose();
      setFormData({ name: "", email: "", password: "", avatarInitials: "" });
    } catch {
      toast.error("Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <UserPlus className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">Invite Member</DialogTitle>
              <p className="text-xs text-neutral-400 mt-1">Add a new representative to your team</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Full Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    placeholder="e.g. Sarah Miller"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="pl-10 h-11 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={cn(
                      "pl-10 h-11 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl",
                      error && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {error && <p className="text-red-500 text-[11px] font-medium pl-1">{error}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Secure Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10 h-11 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all rounded-xl font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Profile Preview</Label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-md ring-1 ring-neutral-200">
                      <AvatarFallback className="bg-neutral-900 text-white text-lg font-bold">
                        {formData.avatarInitials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Input
                      placeholder="SM"
                      value={formData.avatarInitials}
                      onChange={(e) => handleInitialsChange(e.target.value)}
                      maxLength={2}
                      className="h-9 w-20 font-bold text-center rounded-lg bg-white"
                      required
                    />
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Avatar Initials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <ShieldCheck className="size-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-[12px] leading-relaxed text-blue-700/80">
                Member will be created with the <strong>Representative</strong> role. Manual credentials sharing is required.
              </p>
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
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || formData.password.length < 8}
              className="rounded-xl h-11 px-8 bg-neutral-900 text-white hover:bg-black shadow-lg shadow-neutral-200 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
