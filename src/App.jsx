import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import ForgotPasswordPage from "./components/register/ForgotPasswordPage";
import EmailVerificationPage from "./components/register/EmailVerificationPage";
import TokenVerificationPage from "./components/register/TokenVerificationPage";
import PasswordResetPage from "./components/register/PasswordResetPage";
import RegistrationSuccessPage from "./components/register/RegistrationSuccessPage";
import DashboardPage from "./components/dashboard/DashboardPage";
import AccountsPage from "./components/accounts/AccountsPage";
import TransactionsPage from "./components/transactions/TransactionsPage";
import BudgetsPage from "./components/budgets/BudgetsPage";
import CategoriesPage from "./components/categories/CategoriesPage";
import CategoryForm from "./components/categories/CategoryForm";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
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
          <Route path="/transactions" element={<TransactionsPage />} />
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
