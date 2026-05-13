// SimpleCRM — notification-bell
"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const router = useRouter();

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/reminders/count");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (count !== prevCount) {
      setPrevCount(count);
    }
  }, [count, prevCount]);

  const handleClick = () => {
    router.push("/reminders?tab=overdue");
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span 
          key={count}
          className={cn(
            "absolute right-2 top-2 flex h-4 min-w-[16px] animate-in zoom-in-50 duration-200 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
