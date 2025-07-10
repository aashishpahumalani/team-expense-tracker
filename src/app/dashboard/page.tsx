"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchAnalytics, fetchExpenses } from "@/store/slices/expenseSlice";
import { AppDispatch, RootState } from "@/store";
import { CategoryStat, MonthlyStat, StatusBreakdown } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#10B981", // emerald-500
  "#06B6D4", // cyan-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#3B82F6", // blue-500
  "#EC4899", // pink-500
];

interface ChartData {
  name: string;
  value: number;
  count: number;
}

interface MonthlyChartData {
  month: string;
  amount: number;
  count: number;
}

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, expenses, isLoading } = useSelector(
    (state: RootState) => state.expenses
  );
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchAnalytics({ token }));
      dispatch(fetchExpenses({ token, filters: { limit: 5 } }));
    }
  }, [token, dispatch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalExpenses: number = expenses?.reduce(
    (total: number, expense: { amount: number }) => total + expense.amount,
    0
  ) || 0;
  
  const categoryData: ChartData[] =  
    analytics?.categoryStats?.map((stat: CategoryStat) => ({
      name: stat.category
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: stat.totalAmount,
      count: stat.count,
    })) || [];

  const monthlyData: MonthlyChartData[] =
    analytics?.monthlyStats?.map((stat: MonthlyStat) => ({
      month: stat.month,
      amount: stat.totalAmount,
      count: stat.count,
    })) || [];

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border w-fit ${
                  user?.role === "admin"
                    ? "bg-amber-900/60 text-amber-300 border-amber-600/30"
                    : "bg-emerald-900/60 text-emerald-300 border-emerald-600/30"
                }`}
              >
                {user?.role === "admin" ? "Team View" : "Personal View"}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {user?.role === "admin"
                ? "Organization-wide analytics and insights"
                : "Your personal expense analytics"}
            </p>
          </div>
          <div className="text-sm text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 w-full sm:w-auto text-center sm:text-left">
            Welcome back, <span className="text-emerald-300 font-semibold">{user?.name}</span>!
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-2 text-gray-300">Loading analytics...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">
                      Total Expenses {user?.role === "employee" && "(Your)"}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100 truncate">
                      {totalExpenses
                        ? formatCurrency(totalExpenses)
                        : "$0.00"}
                    </p>
                  </div>
                  <div className="text-emerald-400 bg-emerald-900/30 p-2 sm:p-3 rounded-xl ml-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">
                      Total Count {user?.role === "employee" && "(Your)"}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100">
                      {expenses.length || 0}
                    </p>
                  </div>
                  <div className="text-cyan-400 bg-cyan-900/30 p-2 sm:p-3 rounded-xl ml-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">
                      Average Expense {user?.role === "employee" && "(Your)"}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-100 truncate">
                      {totalExpenses / expenses.length
                        ? formatCurrency(totalExpenses / expenses.length)
                        : "$0.00"}
                    </p>
                  </div>
                  <div className="text-amber-400 bg-amber-900/30 p-2 sm:p-3 rounded-xl ml-3 flex-shrink-0">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {user?.role === "admin" && analytics?.statusBreakdown && (
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-400 truncate">
                        Pending Approval
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-100">
                        {analytics.statusBreakdown.find(
                          (s: StatusBreakdown) => s.status === "pending"
                        )?.count || 0}
                      </p>
                    </div>
                    <div className="text-orange-400 bg-orange-900/30 p-2 sm:p-3 rounded-xl ml-3 flex-shrink-0">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  {user?.role === "admin" ? "Team " : "Your "}Expenses by
                  Category
                </h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry: ChartData, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No data available. Add some expenses to see analytics.
                  </div>
                )}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  {user?.role === "admin" ? "Team " : "Your "}Monthly Spending
                  Trends
                </h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                      <YAxis tickFormatter={(value) => `$${value}`} stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="amount" fill="#10B981" name="Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No monthly data available yet.
                  </div>
                )}
              </div>
            </div>

            {categoryData.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl overflow-hidden mb-6 border border-gray-700/50">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-medium text-gray-100">
                    {user?.role === "admin" ? "Team " : "Your "}Category
                    Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Average
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {analytics?.categoryStats?.map(
                        (stat: CategoryStat, index: number) => (
                          <tr key={stat.category} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      COLORS[index % COLORS.length],
                                  }}
                                ></div>
                                <span className="text-sm font-medium text-gray-100 capitalize">
                                  {stat.category.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              {formatCurrency(stat.totalAmount)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              {stat.count}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              {formatCurrency(stat.averageAmount)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {user?.role === "admin" && analytics?.statusBreakdown && (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-700/50">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  Status Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.statusBreakdown.map((status: StatusBreakdown) => (
                    <div key={status.status} className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <p className="text-sm font-medium text-gray-400 capitalize">
                            {status.status}
                          </p>
                          <p className="text-lg font-bold text-gray-100">
                            {status.count} expenses
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-gray-400">Total</p>
                          <p className="text-lg font-semibold text-gray-200">
                            {formatCurrency(status.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
