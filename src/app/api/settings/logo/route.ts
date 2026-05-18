// SimpleCRM — settings logo api
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Role } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPEG, and SVG are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = file.type.split("/")[1];
    if (ext === "svg+xml") {
      ext = "svg";
    } else if (ext === "jpeg") {
      ext = "jpg";
    }

    const filename = `logo.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    
    // Ensure uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const logoUrl = `/uploads/${filename}`;

    // Update settings table with new logoUrl
    await prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: { logoUrl },
      create: {
        id: "singleton",
        logoUrl,
        brandColor: "#171717",
      },
    });

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error("Failed to upload logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}
