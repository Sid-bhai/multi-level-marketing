import { pgTable, text, serial, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced notifications table with HTML support
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  htmlContent: text("html_content"),
  createdAt: text("created_at").notNull().$default(() => new Date().toISOString()),
  read: boolean("read").notNull().default(false),
  sentBy: text("sent_by").notNull().default("system"),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status", { enum: ["pending", "completed"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull().$default(() => new Date().toISOString()),
  completedAt: text("completed_at"),
});

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "completed", "rejected"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull().$default(() => new Date().toISOString()),
  completedAt: text("completed_at"),
  commissionEarned: doublePrecision("commission_earned"),
});

// New table for commission rates based on rank
export const commissionRates = pgTable("commission_rates", {
  id: serial("id").primaryKey(),
  rank: text("rank").notNull().unique(),
  rate: doublePrecision("rate").notNull(),
  minimumReferrals: integer("minimum_referrals").notNull(),
  minimumTeamSize: integer("minimum_team_size").notNull(),
});

// Enhanced users table with commission tracking and role
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  state: text("state").notNull(),
  photoURL: text("photo_url"),
  referralCode: text("referral_code").unique().$default(() => Math.random().toString(36).substring(2, 8).toUpperCase()),
  referredBy: text("referred_by"),
  rank: text("rank").notNull().default("Newcomer"),
  role: text("role").notNull().default("user"),
  balance: doublePrecision("balance").notNull().default(0),
  totalPayout: doublePrecision("total_payout").notNull().default(0),
  totalCommissionEarned: doublePrecision("total_commission_earned").notNull().default(0),
  referralCount: integer("referral_count").notNull().default(0),
  teamSize: integer("team_size").notNull().default(0),
  lastLoginAt: text("last_login_at"),
  joinedAt: text("joined_at").notNull().$default(() => new Date().toISOString()),
  passwordStrength: integer("password_strength").notNull().default(0),
  firebaseUid: text("firebase_uid").unique(),
});

// Simplified referral tracking
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull().unique(),
  joinedAt: text("joined_at").notNull().$default(() => new Date().toISOString()),
});

// Enhanced schemas with validation
export const paymentRequestSchema = createInsertSchema(paymentRequests)
  .pick({
    amount: true,
    description: true,
  })
  .extend({
    amount: z.number().positive("Amount must be positive").min(100, "Minimum payment amount is ₹100"),
    description: z.string().min(10, "Please provide a detailed description"),
  });

export const withdrawalRequestSchema = createInsertSchema(withdrawalRequests)
  .pick({
    amount: true,
    upiId: true,
  })
  .extend({
    amount: z.number().positive("Amount must be positive").min(1000, "Minimum withdrawal amount is ₹1,000"),
    upiId: z.string().min(4, "Invalid UPI ID"),
  });

export const registerUserSchema = createInsertSchema(users)
  .pick({
    name: true,
    username: true,
    email: true,
    password: true,
    phone: true,
    state: true,
    referredBy: true,
  })
  .extend({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    username: z.string().min(3, "Username must be at least 3 characters"),
  });

export const loginUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Types
export type InsertMember = typeof referrals.$inferInsert;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Member = typeof referrals.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof paymentRequestSchema>;
export type CommissionRate = typeof commissionRates.$inferSelect;

export interface ReferralNode {
  user: User;
  referrals: ReferralNode[];
}