import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Check username availability
  app.get("/api/check-username", async (req, res) => {
    const username = req.query.username as string;
    const existingUser = await storage.getUserByUsername(username);
    res.json({ available: !existingUser });
  });

  // Check unique fields (email and phone)
  app.get("/api/check-unique", async (req, res) => {
    const { field, value } = req.query;
    if (!field || !value) {
      return res.status(400).json({ error: "Missing field or value" });
    }

    const users = await storage.getAllUsers();
    const exists = users.some(user => user[field as keyof typeof user] === value);

    res.json({ available: !exists });
  });

  // Get referral tree for a user
  app.get("/api/referrals/:userId", async (req, res) => {
    const tree = await storage.getReferralTree(parseInt(req.params.userId));
    res.json(tree);
  });

  // Get user's transactions
  app.get("/api/transactions/:userId", async (req, res) => {
    const transactions = await storage.getTransactions(parseInt(req.params.userId));
    res.json(transactions);
  });

  // Create new transaction
  app.post("/api/transactions", async (req, res) => {
    const data = insertTransactionSchema.parse(req.body);
    const transaction = await storage.createTransaction(data);
    res.status(201).json(transaction);
  });

  // Admin only: Get all users
  app.get("/api/admin/users", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Admin only: Send notifications
  app.post("/api/admin/notifications", async (req, res) => {
    if (!req.user?.isAdmin) return res.sendStatus(403);

    const schema = z.object({
      title: z.string(),
      message: z.string(),
      userIds: z.array(z.number()).optional(),
    });

    const { title, message, userIds } = schema.parse(req.body);

    if (userIds) {
      // Send to specific users
      for (const userId of userIds) {
        await storage.createNotification({ userId, title, message });
      }
    } else {
      // Send to all users
      const users = await storage.getAllUsers();
      for (const user of users) {
        await storage.createNotification({ userId: user.id, title, message });
      }
    }

    res.sendStatus(201);
  });

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const notifications = await storage.getUserNotifications(req.user.id);
    res.json(notifications);
  });

  const httpServer = createServer(app);
  return httpServer;
}