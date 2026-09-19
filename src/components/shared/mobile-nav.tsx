// SimpleCRM — Mobile Navigation Drawer Content
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { 
  LogOut, 
  X,
  LayoutDashboard,
  Users,
  Inbox,
  Bell,
  BarChart3,
  FileText,
  UserCog,
  Settings,
  Plug
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    avatarInitials: string;
  };
  inboxCount?: number;
  reminderCount?: number;
  onClose: () => void;
}

export function MobileNav({ user, inboxCount = 0, onClose }: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setLogo(d.logoUrl))
      .catch((err) => console.error("Error loading logo:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      document.cookie = "simplecrm_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0";
      window.location.replace("/login");
    }
  };

  const menuItems = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    ...(user.role === "ADMIN" ? [
      { label: t("inbox"), href: "/inbox", icon: Inbox, badge: inboxCount },
    ] : []),
    { label: t("leads"), href: "/leads", icon: Users },
    { label: t("reminders"), href: "/reminders", icon: Bell },
    ...(user.role === "ADMIN" ? [
      { label: t("analytics"), href: "/analytics", icon: BarChart3 },
      { label: t("forms"), href: "/forms", icon: FileText },
      { label: t("team"), href: "/team", icon: UserCog },
      { label: t("integrations"), href: "/integrations", icon: Plug },
      { label: t("settings"), href: "/settings", icon: Settings },
    ] : [])
  ];

  return (
    <div className="flex h-full flex-col bg-white text-black">
      {/* Brand & Close Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-8 w-auto max-w-[140px] object-contain" />
          ) : (
            <span className="text-[16px] font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              <Image src="/Favicon.svg" alt="Icon" width={20} height={20} className="object-contain" />
              SimpleCRM
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-bold transition-all relative",
                isActive 
                  ? "bg-gray-50 text-black shadow-sm" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50/50"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-gray-400")} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className={cn(
                  "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isActive ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {item.badge}
                </span>
              ) : null}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-black rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User & Logout Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <Avatar className="h-9 w-9 shrink-0 border border-gray-200 shadow-sm">
            <AvatarFallback className="bg-black text-white text-xs font-bold">
              {user.avatarInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold text-black">{user.name}</p>
            <p className="truncate text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mt-1">
              {user.role}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
