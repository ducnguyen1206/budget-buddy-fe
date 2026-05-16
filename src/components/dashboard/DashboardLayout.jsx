import { useState } from "react";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { removeTokens } from "../../utils/tokenManager";
import tokenRefreshManager from "../../utils/tokenRefreshManager";
import { logoutUser } from "../../services/authService";

export default function DashboardLayout({ children, activePage = "overview" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);

    // Timeout to ensure redirect happens even if API hangs
    const timeoutId = setTimeout(() => {
      performLocalLogout();
    }, 5000);

    const performLocalLogout = () => {
      clearTimeout(timeoutId);
      console.log("Performing local logout cleanup...");

      // Stop token refresh
      tokenRefreshManager.stop();

      // Remove tokens immediately
      removeTokens();
      console.log("Tokens removed");

      // Clear all cookies to remove refresh token and any other auth cookies
      document.cookie.split(";").forEach(cookie => {
        const cookieName = cookie.split("=")[0].trim();
        // Delete by setting to empty with past date
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      console.log("Cookies cleared");

      // Clear localStorage except user preferences
      const keysToKeep = ['themeDashboard', 'languagePreference'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      console.log("localStorage cleared");

      // Use window.location.href for a hard redirect to ensure clean state
      console.log("Redirecting to login page...");
      window.location.href = "/login";
    };

    try {
      console.log("User confirmed logout, calling API...");
      const result = await logoutUser(t);
      if (result.success) {
        console.log("Logout API successful");
      } else {
        console.warn("Logout API failed:", result.error);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      performLocalLogout();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="flex min-h-screen h-full bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on lg+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <DashboardSidebar
          activePage={activePage}
          onClose={() => setSidebarOpen(false)}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto w-full pb-safe">
        {/* Top bar with hamburger menu and language switcher */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 bg-gray-50 z-30">
          {/* Hamburger menu - visible on mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          <LanguageSwitcher />
        </div>

        <main className="px-3 sm:px-6 py-2 sm:py-4">{children}</main>
      </div>

      {/* Logout Confirmation Modal - rendered at layout level for full viewport */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("auth.confirmLogout")}
              </h3>
              <button
                type="button"
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
                  type="button"
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  {t("auth.cancel")}
                </button>
                <button
                  type="button"
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
