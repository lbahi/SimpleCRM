// SimpleCRM — meta-capi
import { createHash } from "crypto";

// ─── Types ───────────────────────────────────────────────────

export type MetaCapiLead = {
  email?: string | null;
  phone: string;
  name?: string | null;
};

export type MetaCapiOptions = {
  actionSource?: "system_generated" | "website" | "app" | "email" | "other";
  customData?: Record<string, unknown>;
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

function hashName(name: string): { fn?: string[]; ln?: string[] } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return {};
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return {
    fn: [sha256hex(firstName.toLowerCase().trim())],
    ...(lastName ? { ln: [sha256hex(lastName.toLowerCase().trim())] } : {}),
  };
}

// ─── Constants ───────────────────────────────────────────────

const DATASET_ID = "1087116592250492";
const API_VERSION = "v26.0";
const ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events`;

// ─── Main export ─────────────────────────────────────────────

export async function sendMetaCapiEvent(
  lead: MetaCapiLead,
  eventName: string,
  options: MetaCapiOptions = {}
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

    // Build user_data with hashed parameters
    const userData: Record<string, string[]> = {};

    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, "") : "";
    if (cleanPhone) {
      userData.ph = [hashPhone(lead.phone)];
    }

    if (lead.email && lead.email.trim()) {
      userData.em = [hashEmail(lead.email)];
    }

    if (lead.name && lead.name.trim()) {
      const nameHashes = hashName(lead.name);
      if (nameHashes.fn) userData.fn = nameHashes.fn;
      if (nameHashes.ln) userData.ln = nameHashes.ln;
    }

    const payload = {
      data: [
        {
          action_source: options.actionSource || "system_generated",
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          custom_data: {
            event_source: "crm",
            lead_event_source: "SimpleCRM",
            ...(options.customData || {}),
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

