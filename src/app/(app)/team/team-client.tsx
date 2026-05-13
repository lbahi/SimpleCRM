// SimpleCRM — team-client
"use client";

import { MemberWithStats } from "@/modules/users/users.types";
import { TeamWorkspace } from "./components/team-workspace";

interface TeamClientProps {
  initialData: MemberWithStats[];
}

export function TeamClient({ initialData }: TeamClientProps) {
  return <TeamWorkspace initialData={initialData} />;
}
