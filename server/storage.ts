import { IStorage } from "./types";
import { 
  User, UserDocument, 
  Transaction, TransactionDocument,
  Notification, NotificationDocument,
  InsertUser, 
  InsertTransaction 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";
import { Types } from "mongoose";

const MemoryStore = createMemoryStore(session);

export class MongoDBStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<UserDocument | null> {
    try {
      return await User.findById(id).populate('referrer').exec();
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ username }).populate('referrer').exec();
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }

  async createUser(insertUser: InsertUser): Promise<UserDocument> {
    try {
      const referralCode = randomBytes(4).toString("hex");
      // Handle phone number - make it null if not provided
      const userData = {
        ...insertUser,
        phone: insertUser.phone || null,
        referralCode,
        isAdmin: false,
        balance: 0,
      };

      const user = new User(userData);

      if (insertUser.referralCode) {
        const referrer = await User.findOne({ referralCode: insertUser.referralCode });
        if (referrer) {
          user.referrer = referrer._id;
        }
      }

      return await user.save();
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error; // Re-throw to handle in the route
    }
  }

  async getReferralTree(userId: string): Promise<UserDocument[]> {
    try {
      return await User.find({ referrer: new Types.ObjectId(userId) })
        .populate('referrer')
        .exec();
    } catch (error) {
      console.error('Error in getReferralTree:', error);
      return [];
    }
  }

  async getCompleteReferralNetwork(userId: string): Promise<UserDocument[]> {
    try {
      const network = [];
      const queue = [userId];
      const visited = new Set();

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!visited.has(currentId)) {
          visited.add(currentId);
          const referrals = await User.find({ referrer: new Types.ObjectId(currentId) })
            .populate('referrer')
            .exec();
          network.push(...referrals);
          queue.push(...referrals.map(r => r._id.toString()));
        }
      }

      return network;
    } catch (error) {
      console.error('Error in getCompleteReferralNetwork:', error);
      return [];
    }
  }

  async getAllUsers(): Promise<UserDocument[]> {
    try {
      return await User.find().populate('referrer').exec();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  async getTransactions(userId: string): Promise<TransactionDocument[]> {
    try {
      return await Transaction.find({ user: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  async createTransaction(data: InsertTransaction): Promise<TransactionDocument> {
    const transaction = new Transaction({
      user: new Types.ObjectId(data.userId),
      amount: data.amount,
      type: data.type,
      status: "pending"
    });
    return await transaction.save();
  }

  async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
    try {
      return await Notification.find({ user: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  async createNotification(data: { userId: string, title: string, message: string }): Promise<NotificationDocument> {
    const notification = new Notification({
      user: new Types.ObjectId(data.userId),
      title: data.title,
      message: data.message,
      read: false
    });
    return await notification.save();
  }

  async markNotificationsAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { user: new Types.ObjectId(userId), read: false },
        { $set: { read: true } }
      );
    } catch (error) {
      console.error('Error in markNotificationsAsRead:', error);
    }
  }

  async updateUserProfile(userId: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    try {
      const updateData: any = { ...data };

      if (data.avatar) {
        // Convert base64 to buffer if avatar is provided as base64
        const base64Data = data.avatar.toString().replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        updateData.avatar = {
          data: buffer,
          contentType: data.avatar.toString().split(';')[0].split(':')[1]
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).populate('referrer');

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  }

  async updateAvatar(userId: string, file: { buffer: Buffer, mimetype: string }): Promise<UserDocument | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            avatar: {
              data: file.buffer,
              contentType: file.mimetype
            }
          } 
        },
        { new: true }
      ).populate('referrer');

      return updatedUser;
    } catch (error) {
      console.error('Error in updateAvatar:', error);
      return null;
    }
  }
}

export const storage = new MongoDBStorage();