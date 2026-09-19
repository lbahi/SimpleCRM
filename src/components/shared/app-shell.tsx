// SimpleCRM — app-shell
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { MobileNav } from "@/components/shared/mobile-nav";
import { MobileTabBar } from "@/components/shared/mobile-tab-bar";
import { cn } from "@/lib/utils";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar 
        user={user} 
        inboxCount={inboxCount} 
        reminderCount={reminderCount} 
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Overlay */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-60 h-screen w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <MobileNav 
          user={user} 
          inboxCount={inboxCount} 
          reminderCount={reminderCount} 
          onClose={() => setMobileNavOpen(false)} 
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader user={user} onMenuOpen={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 pb-16 lg:pb-0">{children}</main>
        <MobileTabBar userRole={user.role} inboxCount={inboxCount} />
      </div>
    </div>
  );
}
