// SimpleCRM — health check (delete after debugging)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const dbUrl = process.env.DATABASE_URL?.replace(
      /:([^@]+)@/,
      ":***@"
    )
    return NextResponse.json({ 
      ok: true,
      userCount,
      dbUrl,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
