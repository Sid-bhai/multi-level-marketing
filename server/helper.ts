import { storage } from "./storage";
import { db } from "./db";
import { referrals, users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Get the count of members who were referred by the given user
 */
export async function getMemberCount(userId: number): Promise<number> {
  // Get user's referral code
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user || !user.referralCode) {
    return 0;
  }

  // Count users who were referred by this user
  const referredUsers = await db
    .select()
    .from(users)
    .where(eq(users.referredBy, user.referralCode));

  return referredUsers.length;
}