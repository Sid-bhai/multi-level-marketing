import { Schema, model, Document } from 'mongoose';
import { z } from "zod";

// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  state: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  referrer: { type: Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  referralCode: { type: String, required: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['commission', 'withdrawal', 'deposit'],
    required: true 
  },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Zod Schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string(),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  state: z.string(),
  referralCode: z.string().optional(),
  referrer: z.string().optional(),
  avatarUrl: z.string().url().optional()
});

export const insertTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.enum(['commission', 'withdrawal', 'deposit'])
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string()
});

// Models
export const User = model('User', userSchema);
export const Transaction = model('Transaction', transactionSchema);
export const Notification = model('Notification', notificationSchema);

// Types
export interface UserDocument extends Document {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string | null;
  state: string;
  isAdmin: boolean;
  referrer?: Schema.Types.ObjectId;
  balance: number;
  referralCode: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface TransactionDocument extends Document {
  user: Schema.Types.ObjectId;
  amount: number;
  type: 'commission' | 'withdrawal' | 'deposit';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface NotificationDocument extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;