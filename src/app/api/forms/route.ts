// SimpleCRM — api/forms/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { createFormSchema } from "@/modules/forms/forms.schema";
import { listForms, createForm } from "@/modules/forms/forms.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const forms = await listForms();
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = createFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const form = await createForm(parsed.data);
    return NextResponse.json(form, { status: 201 });
  } catch (error: any) {
    console.error("[API_FORMS_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }
}
