import React, { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Coins,
  PiggyBank,
  PieChart,
  List,
  LogOut,
  X,
  CreditCard,
  RefreshCw,
  Gauge,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { removeTokens } from "../../utils/tokenManager";
import tokenRefreshManager from "../../utils/tokenRefreshManager";
import { logoutUser } from "../../services/authService";

export default function DashboardSidebar({ activePage = "overview", onClose }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);

    try {
      console.log("User confirmed logout, calling API...");

      // Call logout API
      const result = await logoutUser(t);

      if (result.success) {
        console.log("Logout API successful");
      } else {
        console.warn("Logout API failed:", result.error);
        // Continue with logout even if API fails
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    } finally {
      // Always perform local logout regardless of API result
      // Stop token refresh manager
      tokenRefreshManager.stop();
      // Remove tokens
      removeTokens();
      // Redirect to login page
      navigate("/login");
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const navigationItems = [
    // {
    //   id: "overview",
    //   icon: LayoutDashboard,
    //   label: t("dashboard.nav.overview"),
    //   path: "/dashboard",
    // },
    {
      id: "accounts",
      icon: Building2,
      label: t("dashboard.nav.accounts"),
      path: "/accounts",
    },
    {
      id: "transactions",
      icon: Coins,
      label: t("dashboard.nav.transactions"),
      path: "/transactions",
    },
    {
      id: "savings",
      icon: PiggyBank,
      label: t("dashboard.nav.savings"),
      path: "/savings",
    },
    {
      id: "budgets",
      icon: PieChart,
      label: t("dashboard.nav.budgets"),
      path: "/budgets",
    },
    {
      id: "installments",
      icon: CreditCard,
      label: t("dashboard.nav.installments"),
      path: "/installments",
    },
    {
      id: "subscriptions",
      icon: RefreshCw,
      label: t("dashboard.nav.subscriptions"),
      path: "/subscriptions",
    },
    {
      id: "thresholds",
      icon: Gauge,
      label: t("dashboard.nav.thresholds"),
      path: "/thresholds",
    },
    {
      id: "categories",
      icon: List,
      label: t("dashboard.nav.categories"),
      path: "/categories",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className="w-64 h-screen lg:h-full lg:min-h-screen bg-blue-50 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Budget Buddy Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold text-gray-800 leading-none">
              {t("header.brandName")}
            </span>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-gray-600 hover:bg-blue-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.id === activePage;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-700" : "text-gray-600"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-blue-100">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
          <span className="font-medium">{t("auth.signOut")}</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("auth.confirmLogout")}
              </h3>
              <button
                onClick={handleLogoutCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                {t("auth.logoutConfirmationMessage")}
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  {t("auth.cancel")}
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    isLoggingOut
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isLoggingOut ? t("auth.signingOut") : t("auth.signOut")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
