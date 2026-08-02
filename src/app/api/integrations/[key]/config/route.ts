// SimpleCRM — api/integrations/[key]/config/route.ts
import { NextResponse, type NextRequest } from "next/server";
import {
  getIntegrationAgentByKey,
  toPublicShape,
} from "@/modules/integrations/integrations.service";

interface RouteParams {
  params: Promise<{ key: string }>;
}

/**
 * GET /api/integrations/[key]/config
 * x-api-key auth (INTEGRATIONS_API_KEY) — for external tools like n8n.
 * Returns the full public config for the agent, excluding internal DB fields.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { key } = await params;

  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.INTEGRATIONS_API_KEY;

  if (!expectedKey || !apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agent = await getIntegrationAgentByKey(key);
    if (!agent) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json(toPublicShape(agent));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
