// SimpleCRM — one-time script: seed integration agent row
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🤖 Upserting facebook-messenger-primary...");
  const agent = await prisma.integrationAgent.upsert({
    where: { key: "facebook-messenger-primary" },
    update: {},
    create: {
      key: "facebook-messenger-primary",
      label: "Facebook Messenger",
      agentName: "Amir",
      businessName: "lbahi digital Agency",
      serviceDescription:
        "AI messaging integrations for real estate businesses — an AI agent that replies to a real estate agency's Facebook, Instagram, and WhatsApp messages automatically, qualifies incoming leads, and organizes them into a CRM pipeline so their sales team only has to call ready buyers instead of chasing cold inquiries.",
      requiredFields: ["phone", "businessLocation"],
      niceToHaveFields: ["businessName", "leadVolume", "decisionMaker", "painPoint", "timeline"],
      toneInstructions:
        "Warm, natural, never robotic or scripted-sounding. If the customer writes in Arabic, reply in friendly Algerian darija. If the customer writes in French, reply in French mixed with Algerian expressions, the way a real Algerian salesperson would text. Match whichever language/mix the customer uses — don't force one language. Keep replies short: 1-2 sentences, conversational, not a wall of text. If the customer's name isn't available, ask for it naturally early in the conversation.",
      isActive: false,
    },
  });
  console.log("✅ Done:", agent.id);
}

main()
  .catch((e) => { console.error("❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
