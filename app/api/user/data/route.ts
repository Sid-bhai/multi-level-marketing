import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(req: Request) {
  try {
    await dbConnect()

    // **Get JWT Token from Cookies**
    const token = req.headers.get("cookie")?.split("auth-token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // **Verify JWT**
    let decoded: any
    try {
      decoded = verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // **Find User in Database**
    const user = await User.findById(decoded.userId).populate("referrals", "fullName email createdAt")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // **Send User Data**
    return NextResponse.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      referralCode: user.referralCode,
      earnings: user.earnings,
      referrals: user.referrals,
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
