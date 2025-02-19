import { 
  users, notifications, withdrawalRequests, paymentRequests, commissionRates, referrals,
  type User, type Notification, type InsertNotification,
  type WithdrawalRequest, type InsertWithdrawalRequest, type CommissionRate,
  type RegisterUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  createUser(user: RegisterUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getUsers(): Promise<User[]>;

  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, data: Partial<Notification>): Promise<Notification>;

  // Withdrawal methods
  getWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]>;
  getAllWithdrawalRequests(): Promise<WithdrawalRequest[]>;
  getWithdrawalRequest(id: number): Promise<WithdrawalRequest | undefined>;
  createWithdrawalRequest(withdrawal: InsertWithdrawalRequest & { userId: number }): Promise<WithdrawalRequest>;
  updateWithdrawalRequest(id: number, data: Partial<WithdrawalRequest>): Promise<WithdrawalRequest>;

  // Commission methods
  getCommissionRules(): Promise<CommissionRate[]>;
  createCommissionRule(rule: Omit<CommissionRate, "id">): Promise<CommissionRate>;
  updateCommissionRule(id: number, data: Partial<CommissionRate>): Promise<CommissionRate>;
  getCommissionRate(rank: string): Promise<number>;

  // Session store
  sessionStore: session.Store;

  // Password methods
  hashPassword(password: string): Promise<string>;
  comparePasswords(supplied: string, stored: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  async comparePasswords(supplied: string, stored: string): Promise<boolean> {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  async createUser(registerUser: RegisterUser): Promise<User> {
    const hashedPassword = await this.hashPassword(registerUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...registerUser,
        password: hashedPassword,
        joinedAt: new Date().toISOString(),
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getWithdrawalRequests(userId: number): Promise<WithdrawalRequest[]> {
    return db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt));
  }

  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return db
      .select()
      .from(withdrawalRequests)
      .orderBy(desc(withdrawalRequests.createdAt));
  }

  async getWithdrawalRequest(id: number): Promise<WithdrawalRequest | undefined> {
    const [request] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id));
    return request;
  }

  async createWithdrawalRequest(withdrawal: InsertWithdrawalRequest & { userId: number }): Promise<WithdrawalRequest> {
    const [request] = await db
      .insert(withdrawalRequests)
      .values(withdrawal)
      .returning();
    return request;
  }

  async updateWithdrawalRequest(id: number, data: Partial<WithdrawalRequest>): Promise<WithdrawalRequest> {
    const [request] = await db
      .update(withdrawalRequests)
      .set(data)
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request;
  }

  async getCommissionRules(): Promise<CommissionRate[]> {
    return db
      .select()
      .from(commissionRates)
      .orderBy(desc(commissionRates.rate));
  }

  async createCommissionRule(rule: Omit<CommissionRate, "id">): Promise<CommissionRate> {
    const [newRule] = await db
      .insert(commissionRates)
      .values(rule)
      .returning();
    return newRule;
  }

  async updateCommissionRule(id: number, data: Partial<CommissionRate>): Promise<CommissionRate> {
    const [rule] = await db
      .update(commissionRates)
      .set(data)
      .where(eq(commissionRates.id, id))
      .returning();
    return rule;
  }

  async getCommissionRate(rank: string): Promise<number> {
    const [rule] = await db
      .select()
      .from(commissionRates)
      .where(eq(commissionRates.rank, rank));
    return rule?.rate ?? 0;
  }
}

export const storage = new DatabaseStorage();