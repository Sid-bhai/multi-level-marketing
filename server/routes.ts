import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { registerUserSchema, type RegisterUser, loginUserSchema, withdrawalRequestSchema } from "@shared/schema";
import { z } from "zod";
import { getMemberCount } from "./helper";
import { auth } from "./firebase-admin";

declare module "express-session" {
  interface SessionData {
    userId: number;
    isAdmin: boolean;
  }
}

const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const adminCredentials = {
  username: "adminsid",
  email: "bsid4961@gmail.com",
  password: "Sidbhai09#"
};

// Middleware to check if user is authenticated
const isAuthenticated = async (req: any, res: any, next: any) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized" });
  }
};

interface ReferralNode {
  user: any;
  referrals: Array<{ user: any; referrals: ReferralNode[] }>;
}

export async function registerRoutes(app: Express) {
  // Check username availability
  app.get("/api/check-username/:username", async (req, res) => {
    const { username } = req.params;
    const existingUser = await storage.getUserByUsername(username);

    if (existingUser) {
      // Generate suggestions by adding numbers
      const suggestions = Array.from({ length: 3 }, (_, i) =>
        `${username}${Math.floor(Math.random() * 1000)}`
      );
      res.json({ available: false, suggestions });
    } else {
      res.json({ available: true });
    }
  });

  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      // First validate the request body
      const userData = registerUserSchema.parse(req.body);
      const { firebaseUid, ...userDataWithoutFirebaseId } = userData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email) ||
                        await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === userData.email ?
            "Email already registered" :
            "Username already taken"
        });
      }

      // Verify Firebase token if provided
      if (firebaseUid) {
        try {
          await auth.getUser(firebaseUid);
        } catch (error) {
          console.error('Firebase auth error:', error);
          return res.status(401).json({ message: "Invalid Firebase authentication" });
        }
      }

      // Check referral code if provided
      if (userData.referredBy) {
        const referrer = await storage.getUserByReferralCode(userData.referredBy);
        if (!referrer) {
          return res.status(400).json({ message: "Invalid referral code" });
        }
      }

      // Create user in database
      const user = await storage.createUser(userDataWithoutFirebaseId);

      // Create welcome notification
      await storage.createNotification({
        userId: user.id,
        subject: "Welcome to our platform!",
        message: `Welcome ${user.name}! We're excited to have you join our community.`,
        htmlContent: `
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #3454D1;">Welcome aboard, ${user.name}! 🎉</h1>
            <p style="font-size: 16px; margin: 20px 0;">
              We're thrilled to have you join our community. Here's what you can do next:
            </p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">✨ Complete your profile</li>
              <li style="margin: 10px 0;">👥 Invite friends using your referral code</li>
              <li style="margin: 10px 0;">💰 Start earning rewards</li>
            </ul>
            <p style="font-size: 14px; color: #666;">
              Your referral code: <strong>${user.referralCode}</strong>
            </p>
          </div>
        `,
        createdAt: new Date().toISOString(),
        read: false,
      });

      // Set session
      req.session.userId = user.id;

      // Return user data
      res.status(201).json(user);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ 
        message: "Internal server error", 
        error: (error as Error).message 
      });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const credentials = adminLoginSchema.parse(req.body);

      if (credentials.username === adminCredentials.username &&
          credentials.password === adminCredentials.password) {
        req.session.isAdmin = true;
        res.json({ message: "Admin logged in successfully" });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Check admin status
  app.get("/api/admin/check", (req, res) => {
    res.json(req.session.isAdmin === true);
  });

  // Admin logout
  app.post("/api/admin/logout", isAdmin, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Could not log out" });
      } else {
        res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getUsers();
    const usersWithReferralCount = await Promise.all(
      users.map(async user => ({
        ...user,
        referralCount: await getMemberCount(user.id)
      }))
    );
    res.json(usersWithReferralCount);
  });

  // Get user's notifications
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const notifications = await storage.getNotifications(req.session.userId!);
    res.json(notifications);
  });

  // Mark notification as read
  app.patch("/api/notifications/:id", isAuthenticated, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const notification = await storage.updateNotification(notificationId, { read: true });
    res.json(notification);
  });

  // Admin: Send notification to user
  app.post("/api/admin/notifications", isAdmin, async (req, res) => {
    try {
      const { userId, subject, message, htmlContent } = notificationSchema.parse(req.body);
      const notification = await storage.createNotification({
        userId,
        subject,
        message,
        htmlContent,
        createdAt: new Date().toISOString(),
        read: false,
      });
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  // Update the login route to properly handle authentication
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(loginData.username);

      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session data
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        // Return user data without sensitive information
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // Protected routes
  app.use(["/api/user", "/api/users", "/api/members"], isAuthenticated);

  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const referralCount = await getMemberCount(user.id);
    if (user.referralCount !== referralCount) {
      await storage.updateUser(user.id, { referralCount });
      user.referralCount = referralCount;
    }

    res.json(user);
  });

  app.get("/api/users", async (req, res) => {
    const users = await storage.getUsers();
    const usersMap = Object.fromEntries(users.map(user => [user.id, user]));
    res.json(usersMap);
  });

  app.get("/api/members", async (req, res) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  // User withdrawal routes
  app.get("/api/withdrawals", isAuthenticated, async (req, res) => {
    const withdrawals = await storage.getWithdrawalRequests(req.session.userId!);
    res.json(withdrawals);
  });

  // Update withdrawal notification
  app.post("/api/withdrawals", isAuthenticated, async (req, res) => {
    try {
      const data = withdrawalRequestSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (data.amount > user.balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const withdrawal = await storage.createWithdrawalRequest({
        userId: req.session.userId!,
        amount: data.amount,
        upiId: data.upiId,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Update user balance
      await storage.updateUser(user.id, {
        balance: user.balance - data.amount
      });

      // Create notification with subject
      await storage.createNotification({
        userId: user.id,
        subject: "Withdrawal Request Submitted",
        message: `Your withdrawal request of ₹${data.amount} has been submitted.`,
        htmlContent: `
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #3454D1;">Withdrawal Request Submitted</h2>
            <p style="font-size: 16px; margin: 20px 0;">
              Your withdrawal request of <strong>₹${data.amount}</strong> has been submitted successfully.
            </p>
            <p style="font-size: 14px; color: #666;">
              UPI ID: ${data.upiId}<br>
              Status: Pending
            </p>
          </div>
        `,
        createdAt: new Date().toISOString(),
        read: false,
      });

      res.status(201).json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid withdrawal data", errors: error.errors });
      } else {
        res.status(400).json({ message: (error as Error).message });
      }
    }
  });

  // Admin withdrawal routes
  app.get("/api/admin/withdrawals", isAdmin, async (req, res) => {
    const withdrawals = await storage.getAllWithdrawalRequests();
    // Get user details for each withdrawal
    const withdrawalsWithUser = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const user = await storage.getUser(withdrawal.userId);
        return { ...withdrawal, user };
      })
    );
    res.json(withdrawalsWithUser);
  });

  // Update withdrawal completion notification
  app.post("/api/admin/withdrawals/:id/complete", isAdmin, async (req, res) => {
    const withdrawalId = parseInt(req.params.id);
    const withdrawal = await storage.getWithdrawalRequest(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status === "completed") {
      return res.status(400).json({ message: "Withdrawal already completed" });
    }

    const updatedWithdrawal = await storage.updateWithdrawalRequest(withdrawalId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    const user = await storage.getUser(withdrawal.userId);
    if (user) {
      // Update user's total payout
      await storage.updateUser(user.id, {
        totalPayout: user.totalPayout + withdrawal.amount,
      });

      // Create notification
      await storage.createNotification({
        userId: user.id,
        subject: "Withdrawal Request Completed",
        message: `Your withdrawal request of ₹${withdrawal.amount} has been completed.`,
        htmlContent: `
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #22c55e;">Withdrawal Completed</h2>
            <p style="font-size: 16px; margin: 20px 0;">
              Your withdrawal request of <strong>₹${withdrawal.amount}</strong> has been processed and completed.
            </p>
            <p style="font-size: 14px; color: #666;">
              UPI ID: ${withdrawal.upiId}<br>
              Status: Completed<br>
              Completed At: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    res.json(updatedWithdrawal);
  });

  // Add this route to handle user profile updates with avatar
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.session.userId!, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Get referral tree for the current user
  app.get("/api/referrals/tree", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all users who were referred by this user
      const referrals = await storage.getUsers();
      const referredUsers = referrals.filter(u => u.referredBy === user.referralCode);

      // Create the tree structure
      const tree: ReferralNode = {
        user,
        referrals: await Promise.all(referredUsers.map(async (referredUser) => ({
          user: referredUser,
          referrals: [] // For now, we're only showing direct referrals
        })))
      };

      res.json(tree);
    } catch (error) {
      console.error('Error getting referral tree:', error);
      res.status(500).json({ message: "Failed to get referral tree" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}