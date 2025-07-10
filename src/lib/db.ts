import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/expense_tracker";

declare global {
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  } | undefined;
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose!;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB");
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['employee', 'admin'],
  },
}, {
  timestamps: true,
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['travel', 'meals', 'office_supplies', 'software', 'training', 'marketing', 'other'],
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  receiptUrl: {
    type: String,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create indexes for better performance
expenseSchema.index({ userId: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

// Seed function to create default users
export async function seedDatabase() {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'supratim.admin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync("Admin123", 10);
      await User.create({
        name: "supratim Admin",
        email: "supratim.admin@gmail.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Admin user created");
    }

    const employeeExists = await User.findOne({ email: 'Aashish@gmail.com' });
    if (!employeeExists) {
      const empPassword = bcrypt.hashSync("Aashish123", 10);
      await User.create({
        name: "Aashish P",
        email: "Aashish@gmail.com",
        password: empPassword,
        role: "employee"
      });
      console.log("Employee user created");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export default mongoose;
