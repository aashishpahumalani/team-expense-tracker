"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchExpenses, approveExpense } from "@/store/slices/expenseSlice";
import { AppDispatch, RootState } from "@/store";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { Expense } from "@/types";

export default function ApproveExpensesPage() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { expenses, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && user?.role === "admin") {
      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );
    }
  }, [token, user, dispatch]);

  const handleApprove = async (expenseId: string) => {
    if (token) {
      await dispatch(
        approveExpense({
          token,
          expenseId,
          status: "approved",
        })
      );

      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );
    }
  };

  const handleReject = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const confirmReject = async () => {
    if (token && selectedExpense && rejectionReason.trim()) {
      await dispatch(
        approveExpense({
          token,
          expenseId: selectedExpense._id,
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        })
      );

      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );

      setShowModal(false);
      setSelectedExpense(null);
      setRejectionReason("");
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

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-red-900/60 rounded-full p-6 w-fit mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-300" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Access Denied
            </h1>
            <p className="text-gray-400">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <div className="p-2 bg-amber-900/40 rounded-xl">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Pending Approvals
            </h1>
            <p className="text-sm text-gray-400">Review and approve team expense submissions</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/60 border border-red-600/50 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
          {isLoading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-2 text-gray-300">Loading pending expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="bg-emerald-900/40 rounded-full p-6 w-fit mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-400">
                No expenses are waiting for approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {expenses.map((expense: Expense) => (
                <div key={expense._id} className="p-4 sm:p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-100 break-words">
                            {expense.description}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Submitted on {formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xl sm:text-2xl font-bold text-gray-100">
                            {formatCurrency(expense.amount)}
                          </p>
                          <p className="text-sm text-gray-400 capitalize">
                            {expense.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Expense Date
                          </p>
                          <p className="text-sm text-gray-200">
                            {formatDate(expense.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Category
                          </p>
                          <p className="text-sm text-gray-200 capitalize">
                            {expense.category.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            Amount
                          </p>
                          <p className="text-sm text-gray-200">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-300 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-200 bg-gray-700/50 p-3 rounded-lg border border-gray-600/30 break-words">
                          {expense.description}
                        </p>
                      </div>

                      {expense.receiptUrl && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">
                            Receipt
                          </p>
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 px-3 py-2 rounded-lg transition-all break-all"
                          >
                            <Eye className="h-4 w-4 flex-shrink-0" />
                            <span>View Receipt</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => handleReject(expense)}
                      className="w-full sm:w-auto group flex items-center justify-center space-x-2 px-6 py-3 border border-red-600/50 text-red-400 rounded-xl hover:bg-red-900/30 hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    >
                      <XCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(expense._id)}
                      className="w-full sm:w-auto group flex items-center justify-center space-x-2 px-6 py-3 border border-transparent text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    >
                      <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md mx-auto">
              <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 shadow-2xl rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-100 mb-2">
                    Reject Expense
                  </h3>
                  <p className="text-sm text-gray-400">
                    Please provide a reason for rejecting this expense:
                  </p>
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm placeholder-gray-400 transition-all resize-none text-sm"
                  rows={4}
                  placeholder="Enter rejection reason..."
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedExpense(null);
                      setRejectionReason("");
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-600/50 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={!rejectionReason.trim()}
                    className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Reject Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
