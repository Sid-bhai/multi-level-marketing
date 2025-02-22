import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import dbConnect from "@/lib/db"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: Request) {
  try {
    const token = cookies().get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await req.json()
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    await dbConnect()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.bankDetails) {
      return NextResponse.json({ error: "Bank details not found" }, { status: 400 })
    }

    if (user.earnings.available < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Update user balance and create withdrawal record
    user.earnings.available -= amount
    user.earnings.pendingWithdrawals = (user.earnings.pendingWithdrawals || 0) + amount
    await user.save()

    return NextResponse.json({
      message: "Withdrawal request submitted successfully",
      newBalance: user.earnings.available,
    })
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

