import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import EmailVerificationPage from "./components/register/EmailVerificationPage";
import TokenVerificationPage from "./components/register/TokenVerificationPage";
import PasswordResetPage from "./components/register/PasswordResetPage";
import RegistrationSuccessPage from "./components/register/RegistrationSuccessPage";

// Temporary Dashboard component for testing
const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600">{t("dashboard.welcome")}</p>
        <p className="text-sm text-gray-500 mt-2">
          {t("dashboard.tokenReady")}
        </p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/token/:token" element={<TokenVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route
            path="/registration-success"
            element={<RegistrationSuccessPage />}
          />
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Root path redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Catch-all redirect for any undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
