// SimpleCRM — comment-notifications-dropdown
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationActor {
  name: string;
  avatarInitials: string;
}

interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  leadId: string;
  actor: NotificationActor;
}

export function CommentNotificationsDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json() as { count: number };
        setCount(data.count);
      }
    } catch {
      // ignore — polling should be silent
    }
  }, []);

  // Poll every 60 s, matching notification-bell.tsx pattern
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json() as AppNotification[];
        setNotifications(data);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await fetchList();
  };

  const handleMarkOne = useCallback(async (n: AppNotification) => {
    setOpen(false);
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
      setCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
    }
    router.push(`/leads/${n.leadId}`);
  }, [router]);

  const handleMarkAll = useCallback(async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Comment notifications${count > 0 ? ` (${count} unread)` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-2 top-2 flex h-4 min-w-[16px] animate-in zoom-in-50 duration-200 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-neutral-100 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <span className="text-[13px] font-bold text-neutral-900">
                Notifications
              </span>
              {count > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-50">
              {loadingList && (
                <div className="px-4 py-6 text-center text-[13px] text-neutral-400">
                  Loading…
                </div>
              )}

              {!loadingList && notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-neutral-400">
                  No notifications yet
                </div>
              )}

              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkOne(n)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50",
                    !n.read && "bg-blue-50/40"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 flex-shrink-0 mt-0.5">
                    {n.actor.avatarInitials}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[13px] text-neutral-800 leading-snug">
                      {n.message}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
