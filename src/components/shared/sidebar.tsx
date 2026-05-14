// SimpleCRM — Premium White Sidebar
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LogOut, 
  ChevronLeft,
  LayoutDashboard,
  Users,
  Inbox,
  Bell,
  BarChart3,
  FileText,
  UserCog,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    avatarInitials: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/inbox/count");
        if (res.ok) {
          const data = await res.json();
          setInboxCount(data.count);
        }
      } catch {}
    };
    fetchCount();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user.role === "ADMIN" ? [
      { label: "Inbox", href: "/inbox", icon: Inbox, badge: inboxCount },
    ] : []),
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Reminders", href: "/reminders", icon: Bell },
    ...(user.role === "ADMIN" ? [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Forms", href: "/forms", icon: FileText },
      { label: "Team", href: "/team", icon: UserCog },
      { label: "Settings", href: "/settings", icon: Settings },
    ] : [])
  ];

  return (
    <aside 
      className={cn(
        "flex h-screen flex-col bg-white text-black border-r border-gray-100 transition-all duration-300 ease-in-out z-50 shadow-sm",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Brand Section with SVG Logo */}
      <div className={cn(
        "h-24 flex items-center relative", // Removed transition-all and duration-100
        isCollapsed ? "justify-center px-0" : "px-6"
      )}>
        <div className="flex items-center justify-center w-full">
          <div className={cn(
            "relative shrink-0", // Removed transition-all and duration-300
            isCollapsed ? "h-8 w-8" : "h-[180px] w-full max-w-[300px]"
          )}>
             <Image 
              src={isCollapsed ? "/Favicon.svg" : "/Logo.svg"} 
              alt="Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 py-2 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="px-4 mb-4">
          </div>
        )}
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl py-3 text-sm font-bold transition-all relative",
                isCollapsed ? "justify-center px-0" : "px-4",
                isActive 
                  ? "bg-gray-50 text-black shadow-sm" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50/50"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-black" : "text-gray-400")} />
              {!isCollapsed && <span className="flex-1 animate-in fade-in slide-in-from-left-1 duration-300">{item.label}</span>}
              {item.badge && !isCollapsed ? (
                <span className={cn(
                  "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isActive ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {item.badge}
                </span>
              ) : null}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-black rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Toggle Button - Moved to a cleaner position or separate area if needed */}
      <div className="px-4 py-4 border-t border-gray-50 flex justify-center">
         <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all text-gray-400 hover:text-black"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
          {!isCollapsed }
        </button>
      </div>

      {/* User Section */}
      <div className="p-4 bg-gray-50/50">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl transition-colors border border-transparent",
          isCollapsed ? "justify-center" : "bg-white border-gray-100 shadow-sm"
        )}>
          <Avatar className="h-9 w-9 shrink-0 border border-gray-200 shadow-sm">
            <AvatarFallback className="bg-black text-white text-xs font-bold">
              {user.avatarInitials}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-black">{user.name}</p>
              <p className="truncate text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mt-1">
                {user.role}
              </p>
            </div>
          )}
          
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
