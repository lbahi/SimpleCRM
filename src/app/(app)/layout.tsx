import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserById } from "@/modules/users/users.service";
import { countOverdueReminders } from "@/modules/reminders/reminders.service";
import { getInboxCount } from "@/modules/inbox/inbox.service";
import { AppShell } from "@/components/shared/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch full user for sidebar
  const user = await getUserById(session.userId);
  if (!user) {
    redirect("/login");
  }

  const inboxCount = await getInboxCount(session.userId, session.role);
  const reminderCount = await countOverdueReminders(session.userId, session.role as "ADMIN" | "MEMBER");

  return (
    <AppShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      }}
      inboxCount={inboxCount}
      reminderCount={reminderCount}
    >
      {children}
    </AppShell>
  );
}
