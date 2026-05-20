// SimpleCRM — settings-workspace
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { AppearanceSection } from "./components/appearance-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ShieldAlert, KeyRound, AlertTriangle, Globe } from "lucide-react";
import { Role } from "@prisma/client";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

interface SettingsWorkspaceProps {
  session: {
    name: string;
    email: string;
    role: Role;
  };
}

export function SettingsWorkspace({ session }: SettingsWorkspaceProps) {
  const t = useTranslations("settings");
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
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{t("title")}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Section */}
        <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-neutral-600" />
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900">{t("profile")}</CardTitle>
                <CardDescription className="text-neutral-500">
                  {t("fullName")}
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
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("fullName")}</Label>
                  <Input value={session.name} readOnly className="bg-neutral-50 border-neutral-200 text-neutral-600 h-10 rounded-lg cursor-not-allowed select-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("email")}</Label>
                  <Input value={session.email} readOnly className="bg-neutral-50 border-neutral-200 text-neutral-600 h-10 rounded-lg cursor-not-allowed select-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="shadow-sm border border-neutral-200 bg-white rounded-xl">
          <CardHeader className="border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-neutral-600" />
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900">{t("language")}</CardTitle>
                <CardDescription className="text-neutral-500">
                  {t("languageDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-w-xs">
              <LanguageSwitcher />
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
                <CardTitle className="text-lg font-semibold text-neutral-900">{t("password")}</CardTitle>
                <CardDescription className="text-neutral-500">
                  {t("passwordDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("currentPassword")}</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("newPassword")}</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t("confirmPassword")}</Label>
                <Input type="password" placeholder="••••••••" disabled className="bg-neutral-50 border-neutral-200 h-10 rounded-lg cursor-not-allowed" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-neutral-400">{t("passwordManagedByAdmin")}</p>
              <Button disabled className="h-9 bg-neutral-900 text-white rounded-lg px-4 opacity-50 cursor-not-allowed">
                {t("updatePassword")}
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
                  <CardTitle className="text-lg font-semibold text-red-900">{t("dangerZone")}</CardTitle>
                  <CardDescription className="text-red-500/80">
                    {t("dangerZoneDescription")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-semibold text-red-900">{t("resetTitle")}</h4>
                  <p className="text-xs text-red-700/70 mt-0.5">
                    {t("resetDescription")}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                disabled={isResetting}
                onClick={handleResetWorkspace}
                className="border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-lg h-9 shrink-0 transition-colors disabled:opacity-50"
              >
                {isResetting ? t("resetting") : t("resetButton")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
