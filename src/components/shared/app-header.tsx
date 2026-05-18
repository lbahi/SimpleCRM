// SimpleCRM — Premium App Header
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Bell, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AppHeaderProps {
  user: {
    name: string;
    role: "ADMIN" | "MEMBER";
    avatarInitials: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8">
      <div />

      <div className="flex items-center gap-6">
        {/* Simple Notification Button */}
        <button className="p-2 text-gray-400 hover:text-black transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-black rounded-full border-2 border-white" />
        </button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className="flex items-center gap-3 rounded-xl p-1 pr-3 transition-all hover:bg-gray-50 outline-none border border-transparent hover:border-gray-100"
            aria-label="User menu"
          >
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarFallback className="bg-black text-white text-[11px] font-bold">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-black leading-none">{user.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white">
            <div className="flex flex-col gap-1 p-2">
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black rounded-xl transition-all">
                <User className="h-4 w-4" />
                Your Profile
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
