import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useEffect } from "react";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import ForgotPasswordPage from "./components/register/ForgotPasswordPage";
import EmailVerificationPage from "./components/register/EmailVerificationPage";
import TokenVerificationPage from "./components/register/TokenVerificationPage";
import PasswordResetPage from "./components/register/PasswordResetPage";
import RegistrationSuccessPage from "./components/register/RegistrationSuccessPage";
import AccountsPage from "./components/accounts/AccountsPage";
import AccountForm from "./components/accounts/AccountForm";
import TransactionsPage from "./components/transactions/TransactionsPage";
import TransactionForm from "./components/transactions/TransactionForm";
import BudgetsPage from "./components/budgets/BudgetsPage";
import BudgetForm from "./components/budgets/BudgetForm";
import SavingsPage from "./components/savings/SavingsPage";
import SavingForm from "./components/savings/SavingForm";
import InstallmentsPage from "./components/installments/InstallmentsPage";
import InstallmentForm from "./components/installments/InstallmentForm";
import CategoriesPage from "./components/categories/CategoriesPage";
import CategoryForm from "./components/categories/CategoryForm";
import tokenRefreshManager from "./utils/tokenRefreshManager";
import { isAuthenticated } from "./utils/tokenManager";
import { GOOGLE_CLIENT_ID } from "./constants/socialProviders";

function ProtectedRoutes() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnly({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/transactions" replace />;
  }

  return children;
}

function TokenRefreshHandler() {
  useEffect(() => {
    const checkAuthAndManageRefresh = () => {
      if (isAuthenticated()) {
        tokenRefreshManager.start();
      } else {
        tokenRefreshManager.stop();
      }
    };

    checkAuthAndManageRefresh();

    const handleTokensStored = () => {
      checkAuthAndManageRefresh();
    };

    window.addEventListener("authTokensStored", handleTokensStored);

    const authCheckInterval = setInterval(checkAuthAndManageRefresh, 30000);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener("authTokensStored", handleTokensStored);
      tokenRefreshManager.stop();
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <BrowserRouter>
          <TokenRefreshHandler />
          <Routes>
            {/* Public auth routes */}
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            {/* Protected app routes */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/accounts/new" element={<AccountForm />} />
              <Route path="/accounts/edit/:id" element={<AccountForm />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route
                path="/transactions/edit/:id"
                element={<TransactionForm />}
              />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/savings/new" element={<SavingForm />} />
              <Route path="/savings/edit/:id" element={<SavingForm />} />
              <Route path="/installments" element={<InstallmentsPage />} />
              <Route path="/installments/new" element={<InstallmentForm />} />
              <Route path="/installments/edit/:id" element={<InstallmentForm />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/budgets/new" element={<BudgetForm />} />
              <Route path="/budgets/edit/:id" element={<BudgetForm />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/edit/:id" element={<CategoryForm />} />
            </Route>

            {/* Root path redirect */}
            <Route
              path="/"
              element={
                <Navigate
                  to={isAuthenticated() ? "/transactions" : "/login"}
                  replace
                />
              }
            />
            {/* Catch-all redirect for any undefined routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated() ? "/transactions" : "/login"}
                  replace
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
