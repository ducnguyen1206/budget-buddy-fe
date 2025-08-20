import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../layout/Layout";
import FormField from "../common/FormField";
import ErrorMessage from "../common/ErrorMessage";
import PasswordStrengthMeter from "../common/PasswordStrengthMeter";
import { resetPassword } from "../../services/authService";
import {
  validatePassword,
  validateConfirmPassword,
  isPasswordFormValid,
} from "../../utils/passwordValidation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token exists in location state
  useEffect(() => {
    if (!location.state?.token) {
      navigate("/register");
    }
  }, [location.state, navigate]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time password matching validation
    if (name === "confirmPassword" && value && formData.password) {
      const confirmError = validateConfirmPassword(value, formData.password);
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setValidationErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(formData.confirmPassword, value)
          : "",
      }));
    }
    if (name === "confirmPassword") {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.password),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    if (passwordError || confirmPasswordError) {
      setValidationErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setIsLoading(true);
    setError("");

    // Get token from location state
    const token = location.state?.token;

    if (!token) {
      setError("No verification token found. Please try again.");
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(
      token,
      formData.password,
      formData.confirmPassword,
      t
    );

    if (result.success) {
      navigate("/registration-success");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // Form validation
  const formIsValid = isPasswordFormValid(formData, validationErrors);

  return (
    <Layout className="flex items-center justify-center px-3 max-w-full mx-auto">
      <div className="w-full max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 font-inter mb-4">
            {t("registration.inputPassword")}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {t("registration.setNewPassword")}
          </p>
        </div>

        <ErrorMessage message={error} />

        {/* Password Reset Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col items-center"
        >
          {/* New Password Field */}
          <div className="w-[500px]">
            <FormField
              label={t("auth.newPassword")}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={validationErrors.password}
              disabled={isLoading}
              placeholder={t("auth.passwordPlaceholder")}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </FormField>
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Confirm Password Field */}
          <div className="w-[500px]">
            <FormField
              label={t("auth.confirmPassword")}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={validationErrors.confirmPassword}
              disabled={isLoading}
              placeholder={t("auth.confirmPasswordPlaceholder")}
            >
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </FormField>
          </div>

          {/* Submit Button */}
          <div className="w-[500px]">
            <button
              type="submit"
              disabled={isLoading || !formIsValid}
              className={`w-full py-3 rounded-2xl font-medium transition-colors ${
                isLoading || !formIsValid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-secondary"
              }`}
            >
              {isLoading ? t("auth.resetting") : t("common.confirm")}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
