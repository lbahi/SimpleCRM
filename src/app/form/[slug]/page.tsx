// SimpleCRM — form page (public)
import { notFound } from "next/navigation";
import { getFormBySlug } from "@/modules/forms/forms.service";
import { PublicForm } from "./components/public-form";

interface FormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center pt-16 pb-12 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 pl-4">
          <span className="text-sm font-bold tracking-tight text-neutral-900">SimpleCRM</span>
        </div>
        <PublicForm form={form} />
      </div>
    </div>
  );
}
