// SimpleCRM — one-time seed route (delete after use)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const existing = await prisma.user.findFirst({
      where: { email: "admin@simplecrm.com" }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: "Already seeded" }, 
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash("admin1234", 12)
    
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@simplecrm.com",
        passwordHash: hash,
        role: "ADMIN",
        avatarInitials: "AD",
        isActive: true,
      }
    })

    return NextResponse.json({ 
      ok: true, 
      message: "Admin created successfully" 
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) }, 
      { status: 500 }
    )
  }
}
