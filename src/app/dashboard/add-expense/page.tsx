"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createExpense } from "@/store/slices/expenseSlice";
import { AppDispatch, RootState } from "@/store";
import { ExpenseCategory } from "@/types";

const categories = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "software", label: "Software" },
  { value: "training", label: "Training" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

export default function AddExpensePage() {
  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: getTodayDate(),
    receiptUrl: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    const result = await dispatch(
      createExpense({
        token,
        expenseData: {
          ...formData,
          amount: parseFloat(formData.amount),
          category: formData.category as ExpenseCategory,
        },
      })
    );

    if (result.type === "expenses/createExpense/fulfilled") {
      router.push("/dashboard/expenses");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "date") {
      const selectedDate = new Date(value);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 1);
      const today = new Date();

      if (selectedDate < minDate) {
        alert("Date cannot be older than one year");
        return;
      }

      if (selectedDate > today) {
        alert("Date cannot be in the future");
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
            Add New Expense
          </h1>
          <p className="text-sm text-gray-400">Submit a new expense for approval</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-900/60 border border-red-600/50 text-red-300 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="break-words">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-300"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                    $
                  </span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="block w-full pl-8 pr-3 py-2.5 sm:py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm placeholder-gray-400 transition-all text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-300"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 sm:py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm sm:text-base"
                >
                  <option value="" className="bg-gray-800 text-gray-100">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-800 text-gray-100">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-300"
              >
                Date *
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                max={getTodayDate()}
                className="block w-full px-3 py-2.5 sm:py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm transition-all text-sm sm:text-base"
              />
              <p className="mt-1 text-xs text-gray-400">
                Date must be within the last year and not in the future
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 sm:py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm placeholder-gray-400 transition-all resize-none text-sm sm:text-base"
                placeholder="Enter expense description..."
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="receiptUrl"
                className="block text-sm font-medium text-gray-300"
              >
                Receipt URL (Optional)
              </label>
              <input
                id="receiptUrl"
                name="receiptUrl"
                type="url"
                value={formData.receiptUrl}
                onChange={handleChange}
                className="block w-full px-3 py-2.5 sm:py-3 border border-gray-600/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-gray-100 bg-gray-700/50 backdrop-blur-sm placeholder-gray-400 transition-all text-sm sm:text-base"
                placeholder="https://example.com/receipt.jpg"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard/expenses")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-600/50 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto group px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Add Expense"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
