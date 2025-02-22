import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { verify } from "jsonwebtoken"
import dbConnect from "@/lib/db"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Helper function to retrieve JWT token from Authorization header
const getTokenFromHeaders = (): string | null => {
  const headersList = headers()
  return headersList.get("authorization")?.split("Bearer ")[1] || null
}

export async function GET(req: Request) {
  try {
    await dbConnect()

    // Get JWT Token
    const token = getTokenFromHeaders()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT
    let decoded: any
    try {
      decoded = verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Find User
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send Response
    return NextResponse.json({
      availableBalance: user.earnings?.available || 0,
      pendingWithdrawals: user.earnings?.pendingWithdrawals || 0,
      bankDetails: user.bankDetails || null,
    })
  } catch (error) {
    console.error("Withdraw info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
