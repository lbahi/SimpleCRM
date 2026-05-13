// SimpleCRM — team page (admin)
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listMembers } from "@/modules/users/users.service";
import { TeamClient } from "./team-client";
import { Role } from "@prisma/client";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== Role.ADMIN) redirect("/leads");

  const members = await listMembers();

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-50">
      <div className="mx-auto max-w-6xl">
        <TeamClient initialData={members} />
      </div>
    </div>
  );
}
