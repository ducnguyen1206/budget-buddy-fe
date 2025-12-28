import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../common/ErrorMessage";
import { loginWithGoogle } from "../../services/authService";
import { useLanguage } from "../../contexts/LanguageContext";
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState("");

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage || t("auth.googleLoginFailed") || "Google login failed. Please try again.");
  };

  return (
    <div className="p-8 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="mb-8">
          <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 font-inter">
          {t("auth.welcomeBack")}
        </h1>
        <p className="text-gray-600 text-xl font-normal font-inter leading-relaxed">
          {t("auth.signInWithGoogle")}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Google Login Button */}
      <div className="flex flex-col items-center space-y-">
        <div className="w-full flex justify-center transform scale-125 py-4">
          <GoogleLoginButton
            onError={handleGoogleError}
          />
        </div>
      </div>
    </div>
  );
}
