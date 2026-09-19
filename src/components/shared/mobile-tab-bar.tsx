// SimpleCRM — Mobile Bottom Tab Bar
"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LayoutDashboard, Users, Bell, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTabBarProps {
  userRole: "ADMIN" | "MEMBER";
  inboxCount?: number;
}

export function MobileTabBar({ userRole, inboxCount = 0 }: MobileTabBarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const tabItems = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    ...(userRole === "ADMIN" ? [
      { label: t("inbox"), href: "/inbox", icon: Inbox, badge: inboxCount },
    ] : []),
    { label: t("leads"), href: "/leads", icon: Users },
    { label: t("reminders"), href: "/reminders", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-gray-100 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex h-16 items-center justify-around px-2">
        {tabItems.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center h-full gap-1 transition-all relative",
                isActive ? "text-black" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={cn("text-[11px]", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
