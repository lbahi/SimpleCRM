// SimpleCRM — form page (public)
import { notFound } from "next/navigation";
import { getFormBySlug } from "@/modules/forms/forms.service";
import { PublicForm } from "./components/public-form";
import { prisma } from "@/lib/prisma";

interface FormPageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form) notFound();

  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Trust Badge */}
        <div className="flex items-center justify-center mb-8">
          <div className="group flex items-center gap-2.5 px-4 py-2 bg-white border border-emerald-100 rounded-full shadow-sm shadow-emerald-100/50 hover:shadow-md hover:border-emerald-200 transition-all duration-300 cursor-default">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-700">Secure Data Encryption</span>
            </div>
          </div>
        </div>
        
        <PublicForm
          form={form}
          brandColor={settings?.brandColor ?? "#171717"}
          logoUrl={settings?.logoUrl ?? null}
        />
      </div>
    </div>
  );
}


