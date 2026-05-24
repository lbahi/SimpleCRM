import { defineConfig } from "prisma/config";

const dbUrl = process.env["DATABASE_URL"];

// Debug logging (will appear in Coolify deployment logs)
console.error("[Prisma Config] DATABASE_URL present:", !!dbUrl);
if (dbUrl) {
  // Show URL scheme and masked URL for debugging
  const scheme = dbUrl.split(":")[0];
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":***@");
  console.error("[Prisma Config] URL scheme:", scheme);
  console.error("[Prisma Config] Masked URL:", maskedUrl);
  console.error("[Prisma Config] URL length:", dbUrl.length);
  console.error("[Prisma Config] First 30 chars:", dbUrl.substring(0, 30));
}

// Validate URL has correct scheme
if (!dbUrl || (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://"))) {
  console.error("[Prisma Config] ERROR: DATABASE_URL must start with postgresql:// or postgres://");
  console.error("[Prisma Config] Current value type:", typeof dbUrl);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: dbUrl,
  },
});
