// SimpleCRM — meta-capi
import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────

export type MetaCapiLead = {
  email?: string | null;
  phone: string;
  name?: string | null;
};

// ─── Hashing helpers ─────────────────────────────────────────

function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string): string {
  return sha256hex(email.toLowerCase().trim());
}

function hashPhone(phone: string): string {
  return sha256hex(phone.replace(/\D/g, ""));
}

// ─── Constants ───────────────────────────────────────────────

const DATASET_ID = "1087116592250492";
const API_VERSION = "v26.0";
const ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events`;

// ─── Main export ─────────────────────────────────────────────

export async function sendMetaCapiEvent(
  lead: MetaCapiLead,
  eventName: string
): Promise<void> {
  try {
    const token = process.env.META_CAPI_ACCESS_TOKEN;
    if (!token) {
      console.warn(
        "[meta-capi] META_CAPI_ACCESS_TOKEN is not set — skipping CAPI event"
      );
      return;
    }

    const testEventCode = process.env.META_CAPI_TEST_CODE;

    const userData: Record<string, string[]> = {
      ph: [hashPhone(lead.phone)],
    };
    if (lead.email) {
      userData.em = [hashEmail(lead.email)];
    }

    const payload = {
      data: [
        {
          action_source: "system_generated",
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          custom_data: {
            event_source: "crm",
            lead_event_source: "SimpleCRM",
          },
          user_data: userData,
          ...(testEventCode && { test_event_code: testEventCode }),
        },
      ],
    };

    const url = `${ENDPOINT}?access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "(unreadable)");
      console.error(
        `[meta-capi] Non-OK response ${response.status} for event "${eventName}":`,
        text
      );
    } else {
      console.log(
        `[meta-capi] Event "${eventName}" sent — HTTP ${response.status}`
      );
    }
  } catch (err) {
    console.error("[meta-capi] Failed to send CAPI event:", err);
  }
}
