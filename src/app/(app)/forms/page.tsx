// SimpleCRM — forms page (admin)
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listForms } from "@/modules/forms/forms.service";
import { FormsClient } from "./forms-client";

export default async function FormsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/leads");

  const forms = await listForms();

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-50">
      <div className="mx-auto max-w-5xl">
        <FormsClient initialData={forms} />
      </div>
    </div>
  );
}
