import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { verify } from "jsonwebtoken"
import dbConnect from "@/lib/db"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(req: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split("Bearer ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    await dbConnect()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      availableBalance: user.earnings.available,
      pendingWithdrawals: user.earnings.pendingWithdrawals || 0,
      bankDetails: user.bankDetails,
    })
  } catch (error) {
    console.error("Withdraw info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

