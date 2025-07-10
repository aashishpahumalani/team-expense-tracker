"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import {
  LogOut,
  User,
  DollarSign,
  BarChart3,
  FileText,
  CheckCircle,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-md shadow-2xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  ExpenseTracker
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-300 hover:text-red-400 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-900/20 group border border-transparent hover:border-red-500/30"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 order-2 lg:order-1 pb-20 lg:pb-0">
          {children}
        </div>

        {/* Right Sidebar - Now responsive */}
        <div className="w-full lg:w-80 bg-gray-900/80 backdrop-blur-md shadow-2xl border-t lg:border-t-0 lg:border-l border-gray-700/50 order-1 lg:order-2">
          <div className="p-4 sm:p-6">
            {/* User Profile Section - More compact on mobile */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-100 mb-3 sm:mb-4">User Profile</h2>
              <div className="bg-gradient-to-br from-gray-800/80 to-slate-800/80 rounded-xl p-3 sm:p-4 border border-gray-600/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-100 truncate">{user?.name}</div>
                    <span
                      className={`inline-block text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${
                        user?.role === "admin"
                          ? "bg-amber-900/60 text-amber-300 border border-amber-600/30"
                          : "bg-emerald-900/60 text-emerald-300 border border-emerald-600/30"
                      }`}
                    >
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between py-1">
                    <span>Status:</span>
                    <span className="text-emerald-300">Active</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Last Login:</span>
                    <span className="text-gray-300">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-100 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionButton
                  href="/dashboard/"
                  icon={<BarChart3 className="h-5 w-5" />}
                  text="Dashboard"
                  description="Dashboard overview"
                />
                <QuickActionButton
                  href="/dashboard/add-expense"
                  icon={<DollarSign className="h-5 w-5" />}
                  text="New Expense"
                  description="Add expense quickly"
                />
                <QuickActionButton
                  href="/dashboard/expenses"
                  icon={<FileText className="h-5 w-5" />}
                  text="View Reports"
                  description="Check your history"
                />
                {user?.role === "admin" && (
                  <QuickActionButton
                    href="/dashboard/approve"
                    icon={<CheckCircle className="h-5 w-5" />}
                    text="Approvals"
                    description="Pending requests"
                  />
                )}
              </div>
            </div>

            {/* Help Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-100 mb-4">Support</h2>
              <div className="bg-gradient-to-r from-gray-800/80 to-slate-800/80 rounded-xl p-4 border border-gray-600/30 shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-100 mb-1">Need Help?</h3>
                    <p className="text-xs text-gray-400 mb-3">Check our expense guide for tips and best practices.</p>
                    <button className="text-xs text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
                      View Documentation →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
        <div className={`grid gap-1 p-2 ${user?.role === "admin" ? "grid-cols-4" : "grid-cols-3"}`}>
          <MobileNavItem
            href="/dashboard"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Dashboard"
          />
          <MobileNavItem
            href="/dashboard/expenses"
            icon={<FileText className="h-5 w-5" />}
            label="Expenses"
          />
          <MobileNavItem
            href="/dashboard/add-expense"
            icon={<DollarSign className="h-5 w-5" />}
            label="Add"
          />
          {user?.role === "admin" && (
            <MobileNavItem
              href="/dashboard/approve"
              icon={<CheckCircle className="h-5 w-5" />}
              label="Approve"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  text,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  description: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full group flex items-center space-x-3 text-gray-300 hover:text-emerald-300 bg-gray-800/30 hover:bg-emerald-900/20 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-700/30 hover:border-emerald-500/30"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gray-700/50 group-hover:bg-emerald-900/40 rounded-lg flex items-center justify-center transition-colors duration-200">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-gray-100 group-hover:text-emerald-200">{text}</div>
        <div className="text-xs text-gray-400 group-hover:text-emerald-300">
          {description}
        </div>
      </div>
    </button>
  );
}


function MobileNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center py-2 px-1 text-gray-300 hover:text-emerald-300 transition-colors duration-200"
    >
      <div className="mb-1">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}