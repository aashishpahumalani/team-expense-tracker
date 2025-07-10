/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB, User, Expense } from "@/lib/db";
import {
  User as UserType,
  Expense as ExpenseType,
  ExpenseCategory,
  ExpenseStatus,
  CategoryStats,
  MonthlyStats,
  StatusStats,
} from "@/types";

export const UserModel = {
  create: async (userData: Omit<UserType, "_id" | "createdAt" | "updatedAt">) => {
    await connectDB();
    const user = await User.create(userData);
    return user._id.toString();
  },

  findByEmail: async (email: string) => {
    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as "employee" | "admin",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as UserType;
    }
    return null;
  },

  findById: async (id: string) => {
    await connectDB();
    const user = await User.findById(id);
    if (user) {
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as "employee" | "admin",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } as UserType;
    }
    return null;
  },
};

export const ExpenseModel = {
  create: async (expenseData: Omit<ExpenseType, "_id" | "createdAt" | "updatedAt">) => {
    await connectDB();
    const expense = await Expense.create(expenseData);
    return expense._id.toString();
  },

  findWithFilters: async (filters: {
    userId?: string;
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => {
    await connectDB();
    
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    let queryBuilder = Expense.find(query).sort({ createdAt: -1 });

    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
      if (filters.offset) {
        queryBuilder = queryBuilder.skip(filters.offset);
      }
    }

    const expenses = await queryBuilder.exec();

    return expenses.map((expense: any) => ({
      _id: expense._id.toString(),
      userId: expense.userId.toString(),
      amount: expense.amount,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      date: expense.date,
      status: expense.status as ExpenseStatus,
      receiptUrl: expense.receiptUrl,
      approvedBy: expense.approvedBy?.toString(),
      approvedAt: expense.approvedAt,
      rejectionReason: expense.rejectionReason,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    })) as ExpenseType[];
  },

  countWithFilters: async (filters: {
    userId?: string;
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    await connectDB();
    
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.date.$lte = new Date(filters.endDate);
      }
    }

    const count = await Expense.countDocuments(query);
    return count;
  },

  findById: async (id: string) => {
    await connectDB();
    const expense = await Expense.findById(id);
    if (expense) {
      return {
        _id: expense._id.toString(),
        userId: expense.userId.toString(),
        amount: expense.amount,
        category: expense.category as ExpenseCategory,
        description: expense.description,
        date: expense.date,
        status: expense.status as ExpenseStatus,
        receiptUrl: expense.receiptUrl,
        approvedBy: expense.approvedBy?.toString(),
        approvedAt: expense.approvedAt,
        rejectionReason: expense.rejectionReason,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      } as ExpenseType;
    }
    return null;
  },

  updateStatus: async (
    id: string,
    status: ExpenseStatus,
    approvedBy?: string,
    rejectionReason?: string
  ) => {
    await connectDB();
    
    const updateData: any = {
      status,
      rejectionReason: rejectionReason || null,
    };

    if (status === "approved") {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    } else if (status === "rejected") {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }

    const result = await Expense.findByIdAndUpdate(id, updateData, { new: true });
    return !!result;
  },

  getAnalytics: async (userId?: string) => {
    await connectDB();
    
    const matchStage = userId ? { userId } : {};

    // Summary stats
    const summaryPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          averageExpense: { $avg: "$amount" },
        },
      },
    ];

    const summaryResult = await Expense.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalExpenses: 0,
      totalCount: 0,
      averageExpense: 0,
    };

    // Category stats
    const categoryPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 as const } },
    ];

    const categoryResults = await Expense.aggregate(categoryPipeline);
    const categoryStats = categoryResults.map((result: any) => ({
      category: result._id,
      totalAmount: result.totalAmount,
      count: result.count,
      averageAmount: result.averageAmount,
    })) as CategoryStats[];

    // Monthly stats (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyPipeline = [
      {
        $match: {
          ...matchStage,
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1 as const, "_id.month": -1 as const } },
    ];

    const monthlyResults = await Expense.aggregate(monthlyPipeline);
    const monthlyStats = monthlyResults.map((result: any) => ({
      month: `${result._id.year}-${String(result._id.month).padStart(2, '0')}`,
      totalAmount: result.totalAmount,
      count: result.count,
    })) as MonthlyStats[];

    // Status breakdown (only for admin view)
    let statusBreakdown: StatusStats[] = [];
    if (!userId) {
      const statusPipeline = [
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ];

      const statusResults = await Expense.aggregate(statusPipeline);
      statusBreakdown = statusResults.map((result: any) => ({
        status: result._id,
        count: result.count,
        totalAmount: result.totalAmount,
      })) as StatusStats[];
    }

    return {
      summary: {
        totalExpenses: summary.totalExpenses,
        totalCount: summary.totalCount,
        averageExpense: summary.averageExpense,
      },
      categoryStats,
      monthlyStats,
      statusBreakdown,
    };
  },
};
