import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { receiveInboundEmail } from "@/modules/inbox/inbox.service";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyHmac(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.INBOUND_EMAIL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("INBOUND_EMAIL_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature =
    req.headers.get("x-webhook-signature") ||
    req.headers.get("x-inbound-signature");

  if (!verifyHmac(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { leadId?: string; subject?: string; body?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { leadId, subject, body: emailBody } = payload;

  if (!leadId || !subject || !emailBody) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (subject.length > 998 || emailBody.length > 100_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const message = await receiveInboundEmail(leadId, subject, emailBody);
    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
