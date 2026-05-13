import { NextResponse, type NextRequest } from "next/server";
import { receiveInboundEmail } from "@/modules/inbox/inbox.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, subject, body: emailBody } = body;

    if (!leadId || !subject || !emailBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await receiveInboundEmail(leadId, subject, emailBody);
    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
