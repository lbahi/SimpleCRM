// SimpleCRM — settings api
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role } from "@prisma/client";
import * as z from "zod";

export const dynamic = "force-dynamic";

const settingsPatchSchema = z.object({
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  logoUrl: z
    .union([z.string().url(), z.string().regex(/^\/[a-zA-Z0-9_\-./]+$/)])
    .optional()
    .nullable(),
});

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json({
        logoUrl: null,
        brandColor: "#171717",
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = settingsPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Upsert the singleton AppSettings
    const settings = await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: {
        id: "singleton",
        brandColor: parsed.data.brandColor ?? "#171717",
        logoUrl: parsed.data.logoUrl ?? null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
