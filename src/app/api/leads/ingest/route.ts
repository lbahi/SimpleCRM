// SimpleCRM — api/leads/ingest/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ingestLeadSchema } from "@/modules/leads-ingest/leads-ingest.schema";
import { ingestLead } from "@/modules/leads-ingest/leads-ingest.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.LEADS_INGEST_API_KEY;

  if (!expectedApiKey || !apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(request, { key: "leads:ingest", limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = ingestLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await ingestLead(parsed.data);
    return NextResponse.json(result, { status: result.isNew ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
