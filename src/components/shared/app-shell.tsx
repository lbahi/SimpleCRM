// SimpleCRM — app-shell
"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { AppHeader } from "@/components/shared/app-header";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    avatarInitials: string;
  };
  inboxCount?: number;
  reminderCount?: number;
}


export function AppShell({ children, user, inboxCount = 0, reminderCount = 0 }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} inboxCount={inboxCount} reminderCount={reminderCount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
