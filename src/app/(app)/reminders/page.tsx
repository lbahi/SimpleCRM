// SimpleCRM — reminders page
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { listReminders } from "@/modules/reminders/reminders.service";
import { RemindersClient } from "./reminders-client";

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const reminders = await listReminders(session.userId, session.role as "ADMIN" | "MEMBER");

  return <RemindersClient initialReminders={reminders} isAdmin={session.role === "ADMIN"} />;
}
