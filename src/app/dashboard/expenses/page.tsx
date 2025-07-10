"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchExpenses, approveExpense } from "@/store/slices/expenseSlice";
import { AppDispatch, RootState } from "@/store";
import { Expense, ExpenseCategory, ExpenseStatus } from "@/types";
import { Eye, Filter, Plus, CheckCircle, XCircle } from "lucide-react";

const categories = [
  { value: "", label: "All Categories" },
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "training", label: "Training" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  const dispatch = useDispatch<AppDispatch>();
  const { expenses, pagination, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const convertFiltersForApi = (filters: {
    category: string;
    status: string;
    startDate: string;
    endDate: string;
    page: number;
  }) => ({
    category: filters.category
      ? (filters.category as ExpenseCategory)
      : undefined,
    status: filters.status ? (filters.status as ExpenseStatus) : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: 10,
  });

  useEffect(() => {
    if (token) {
      dispatch(
        fetchExpenses({ token, filters: convertFiltersForApi(filters) })
      );
    }
  }, [token, filters, dispatch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleApproveReject = async (
    expenseId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ) => {
    if (token) {
      await dispatch(
        approveExpense({ token, expenseId, status, rejectionReason })
      );
      dispatch(
        fetchExpenses({ token, filters: convertFiltersForApi(filters) })
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 text-xs rounded-full font-medium border";
    switch (status) {
      case "approved":
        return `${baseClass} bg-emerald-900/60 text-emerald-300 border-emerald-600/30`;
      case "rejected":
        return `${baseClass} bg-red-900/60 text-red-300 border-red-600/30`;
      case "pending":
        return `${baseClass} bg-amber-900/60 text-amber-300 border-amber-600/30`;
      default:
        return `${baseClass} bg-gray-700/60 text-gray-300 border-gray-600/30`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
              Expenses
            </h1>
            <p className="text-sm text-gray-400">
              {user?.role === "admin" ? "Manage team expenses" : "View and track your expenses"}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/add-expense")}
            className="w-full sm:w-auto group flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-emerald-500/20"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Add Expense</span>
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-gray-100">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800 text-gray-100">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value} className="bg-gray-800 text-gray-100">
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="block w-full px-3 py-2.5 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/60 border border-red-600/50 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="mt-2 text-gray-300">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="max-w-sm mx-auto">
                <div className="bg-gray-700/50 rounded-full p-6 w-fit mx-auto mb-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-300 mb-4">No expenses found.</p>
                <button
                  onClick={() => router.push("/dashboard/add-expense")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add your first expense
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-700/50">
                      <thead className="bg-gray-700/30">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          {user?.role === "admin" && (
                            <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Submitted By
                            </th>
                          )}
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {expenses.map((expense: Expense) => (
                          <tr key={expense._id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <div className="flex flex-col">
                                <span>{formatDate(expense.date)}</span>
                                <span className="sm:hidden text-xs text-gray-400 capitalize">
                                  {expense.category.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-200">
                              <div
                                className="max-w-xs truncate"
                                title={expense.description}
                              >
                                {expense.description}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <span className="capitalize">
                                {expense.category.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(expense.status)}>
                                {expense.status.charAt(0).toUpperCase() +
                                  expense.status.slice(1)}
                              </span>
                            </td>
                            {user?.role === "admin" && (
                              <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {expense.userId || "Unknown User"}
                              </td>
                            )}
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-1 sm:space-x-2">
                                {expense.receiptUrl && (
                                  <a
                                    href={expense.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 rounded transition-all"
                                    title="View Receipt"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                )}

                                {user?.role === "admin" &&
                                  expense.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleApproveReject(
                                            expense._id,
                                            "approved"
                                          )
                                        }
                                        className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 rounded transition-all"
                                        title="Approve"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt(
                                            "Enter rejection reason:"
                                          );
                                          if (reason) {
                                            handleApproveReject(
                                              expense._id,
                                              "rejected",
                                              reason
                                            );
                                          }
                                        }}
                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-all"
                                        title="Reject"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}

                                {/* Show placeholder if no actions available */}
                                {!expense.receiptUrl &&
                                  !(
                                    user?.role === "admin" &&
                                    expense.status === "pending"
                                  ) && <span className="text-gray-500">—</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-700/50 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-700/20 space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-300 text-center sm:text-left">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="flex justify-center sm:justify-end space-x-2">
                    <button
                      onClick={() =>
                        handleFilterChange("page", String(filters.page - 1))
                      }
                      disabled={filters.page <= 1}
                      className="px-3 sm:px-4 py-2 border border-gray-600/50 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="px-3 sm:px-4 py-2 text-sm text-gray-300 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      Page {filters.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        handleFilterChange("page", String(filters.page + 1))
                      }
                      disabled={filters.page >= pagination.pages}
                      className="px-3 sm:px-4 py-2 border border-gray-600/50 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
