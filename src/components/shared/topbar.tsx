"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/shared/notification-bell";

interface TopbarProps {
  title: string;
  reminderCount?: number;
}

export function Topbar({ title, reminderCount = 0 }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
