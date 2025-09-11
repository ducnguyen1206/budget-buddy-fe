import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import FormField from "../common/FormField";
import ErrorMessage from "../common/ErrorMessage";
import Button from "../common/Button";
import { ArrowLeft, Mail } from "lucide-react";
import { registerUser } from "../../services/authService";
import { validateEmail, isFormValid } from "../../utils/validation";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Form state management
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validate on blur (when user moves out of the field)
    if (name === "email") {
      setValidationErrors((prev) => ({
        ...prev,
        email: validateEmail(value, t),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email, t);

    if (emailError) {
      setValidationErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setError("");

    // Use the same API as registration to send password reset email
    const result = await registerUser(formData.email, t);

    if (result.success) {
      // Navigate to email verification page with success message
      navigate("/verify-email", {
        state: {
          email: formData.email,
          isPasswordReset: true,
        },
      });
    } else {
      setError(result.error);
    } 

    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // Form validation
  const formIsValid = isFormValid(formData, validationErrors);

  return (
    <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
      <div className="w-full max-w-md py-8">
        {/* Header with Email Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 font-inter mb-4">
            {t("forgotPassword.title")}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {t("forgotPassword.description")}
          </p>
        </div>

        <ErrorMessage message={error} />

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label={t("auth.email")}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={validationErrors.email}
            disabled={isLoading}
            placeholder={t("auth.emailPlaceholder")}
          />

          <button
            type="submit"
            disabled={isLoading || !formIsValid}
            className={`w-full py-3 rounded-2xl font-medium transition-colors ${
              isLoading || !formIsValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-secondary"
            }`}
          >
            {isLoading
              ? t("forgotPassword.sending")
              : t("forgotPassword.sendEmail")}
          </button>
        </form>

        {/* Back to Login Button */}
        <div className="mt-6">
          <Button
            onClick={handleBackToLogin}
            className="w-full py-3 text-lg text-gray-500 hover:text-gray-700 flex items-center justify-center"
            variant="text"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("forgotPassword.backToLogin")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
