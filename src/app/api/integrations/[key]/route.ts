// SimpleCRM — api/integrations/[key]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { updateIntegrationAgentSchema } from "@/modules/integrations/integrations.schema";
import {
  updateIntegrationAgent,
  toPublicShape,
} from "@/modules/integrations/integrations.service";

interface RouteParams {
  params: Promise<{ key: string }>;
}

/**
 * PATCH /api/integrations/[key]
 * Session auth, ADMIN-only — for the UI settings form.
 * Accepts partial updates to any editable field including isActive.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const parsed = updateIntegrationAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const agent = await updateIntegrationAgent(key, parsed.data);
    return NextResponse.json(toPublicShape(agent));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update integration";
    const status = message === "Integration agent not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
