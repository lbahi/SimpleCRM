// SimpleCRM — settings-workspace
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppearanceSection } from "./components/appearance-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ShieldAlert, KeyRound, AlertTriangle } from "lucide-react";
import { Role } from "@prisma/client";

interface SettingsWorkspaceProps {
  session: {
    name: string;
    email: string;
    role: Role;
  };
}

export function SettingsWorkspace({ session }: SettingsWorkspaceProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetWorkspace = async () => {
    const confirmed = window.confirm(
      "ARE YOU ABSOLUTELY SURE? This will permanently delete all leads, team members, activity logs, notes, reminders, and capture forms. This action is 100% irreversible!"
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/settings/reset", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset workspace");
      toast.success("Workspace has been successfully reset!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while resetting the workspace.");
    } finally {
      setIsResetting(false);
    }
  };

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your account preferences, branding, and workspace configurations.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Section */}
        <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-600" />
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900">Profile</CardTitle>
                <CardDescription className="text-neutral-500">
                  Your personal profile details and how you appear in SimpleCRM.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {/* Avatar display */}
              <div className="flex items-center gap-4 shrink-0">
                <Avatar className="h-16 w-16 border-2 border-neutral-200 shadow-sm ring-4 ring-neutral-50">
                  <AvatarFallback className="bg-neutral-900 text-white text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-neutral-900">{session.name}</h4>
                  <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {session.role}
                  </span>
                </div>
              </div>

              {/* Readonly details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Full Name</Label>
                  <Input value={session.name} readOnly className="bg-neutral-50 border-neutral-200 text-neutral-600 h-10 rounded-lg cursor-not-allowed select-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Email Address</Label>
                  <Input value={session.email} readOnly className="bg-neutral-50 border-neutral-200 text-neutral-600 h-10 rounded-lg cursor-not-allowed select-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Appearance Section */}
        <AppearanceSection />

        {/* 3. Password Section */}
        <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-neutral-600" />
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900">Password</CardTitle>
                <CardDescription className="text-neutral-500">
                  Change your password to ensure your account security.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Password</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">New Password</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Confirm Password</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-neutral-400">Password updates are managed by your administrator.</p>
              <Button disabled className="h-9 bg-neutral-900 text-white rounded-lg px-4 opacity-50 cursor-not-allowed">
                Update password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Danger Zone Section (Admin only) */}
        {session.role === Role.ADMIN && (
          <Card className="shadow-sm border border-red-200/80 bg-red-50/20 rounded-xl">
            <CardHeader className="border-b border-red-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <div>
                  <CardTitle className="text-lg font-semibold text-red-900">Danger zone</CardTitle>
                  <CardDescription className="text-red-500/80">
                    Irreversible actions that affect the entire workspace.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-semibold text-red-900">Reset Workspace Data</h4>
                  <p className="text-xs text-red-700/70 mt-0.5">
                    This will delete all leads, team members, activity history, and public capture forms. This action is final.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                disabled={isResetting}
                onClick={handleResetWorkspace}
                className="border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg h-9 shrink-0 transition-colors disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Reset Workspace"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
