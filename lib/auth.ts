import { verify } from "jsonwebtoken"

interface DecodedToken {
  userId: string
}

export function verifyToken(token: string): DecodedToken {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}

