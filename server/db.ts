import mongoose from 'mongoose';

// MongoDB connection URI - we'll use a free MongoDB Atlas cluster
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Sid:aTcWrkehiy5xvfDA@cluster0.xw242.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

// Configure Mongoose to use new URL parser and unified topology
mongoose.set('strictQuery', false);

// Export the mongoose connection
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};