import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import ForgotPasswordPage from "./components/register/ForgotPasswordPage";
import EmailVerificationPage from "./components/register/EmailVerificationPage";
import TokenVerificationPage from "./components/register/TokenVerificationPage";
import PasswordResetPage from "./components/register/PasswordResetPage";
import RegistrationSuccessPage from "./components/register/RegistrationSuccessPage";
import DashboardPage from "./components/dashboard/DashboardPage";
import AccountsPage from "./components/accounts/AccountsPage";
import AccountForm from "./components/accounts/AccountForm";
import TransactionsPage from "./components/transactions/TransactionsPage";
import TransactionForm from "./components/transactions/TransactionForm";
import BudgetsPage from "./components/budgets/BudgetsPage";
import CategoriesPage from "./components/categories/CategoriesPage";
import CategoryForm from "./components/categories/CategoryForm";
import tokenRefreshManager from "./utils/tokenRefreshManager";
import { isAuthenticated, getToken } from "./utils/tokenManager";

// Component to handle token refresh
function TokenRefreshHandler() {
  useEffect(() => {
    // Check authentication status and start/stop token refresh manager accordingly
    const checkAuthAndManageRefresh = () => {
      const hasToken = isAuthenticated();

      if (hasToken) {
        tokenRefreshManager.start();
      } else {
        tokenRefreshManager.stop();
      }
    };

    // Initial check
    checkAuthAndManageRefresh();

    // Listen for token storage events (immediate trigger)
    const handleTokensStored = () => {
      checkAuthAndManageRefresh();
    };

    window.addEventListener("authTokensStored", handleTokensStored);

    // Set up an interval to check authentication status every 30 seconds
    // This ensures the token refresh manager starts when user logs in
    const authCheckInterval = setInterval(checkAuthAndManageRefresh, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener("authTokensStored", handleTokensStored);
      tokenRefreshManager.stop();
    };
  }, []);

  return null; // This component doesn't render anything
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <TokenRefreshHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/token/:token" element={<TokenVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route
            path="/registration-success"
            element={<RegistrationSuccessPage />}
          />
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/new" element={<AccountForm />} />
          <Route path="/accounts/edit/:id" element={<AccountForm />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/edit/:id" element={<CategoryForm />} />
          {/* Root path redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch-all redirect for any undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
