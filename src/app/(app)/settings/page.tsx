// SimpleCRM — settings page
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SettingsWorkspace } from "./settings-workspace";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-50">
      <div className="mx-auto max-w-4xl">
        <SettingsWorkspace
          session={{
            name: session.name ?? "User",
            email: session.email ?? "",
            role: session.role,
          }}
        />
      </div>
    </div>
  );
}

