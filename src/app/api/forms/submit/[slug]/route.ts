// SimpleCRM — api/forms/submit/[slug]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { submitFormSchema } from "@/modules/forms/forms.schema";
import { submitForm } from "@/modules/forms/forms.service";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const parsed = submitFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await submitForm(slug, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed";
    const status = message === "Form not found or inactive" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
