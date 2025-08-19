import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/login/LoginPage";
import RegisterPage from "./components/register/RegisterPage";
import EmailVerificationPage from "./components/register/EmailVerificationPage";
import TokenVerificationPage from "./components/register/TokenVerificationPage";
import PasswordResetPage from "./components/register/PasswordResetPage";
import RegistrationSuccessPage from "./components/register/RegistrationSuccessPage";

export default function App() {
  return (
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
        {/* Default redirect */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
