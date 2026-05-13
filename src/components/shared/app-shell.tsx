// SimpleCRM — app-shell
"use client";

import { usePathname } from "next/navigation";
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

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/leads": "Leads",
  "/reminders": "Reminders",
  "/analytics": "Analytics",
  "/forms": "Capture Forms",
  "/team": "Team",
  "/settings": "Settings",
};

export function AppShell({ children, user, inboxCount = 0, reminderCount = 0 }: AppShellProps) {
  const pathname = usePathname();
  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    "SimpleCRM";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} inboxCount={inboxCount} reminderCount={reminderCount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title={title} user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
