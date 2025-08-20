import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import FormField from "../common/FormField";
import SocialButton from "../common/SocialButton";
import ErrorMessage from "../common/ErrorMessage";
import { registerUser } from "../../services/authService";
import { validateEmail, isFormValid } from "../../utils/validation";
import { SOCIAL_PROVIDERS } from "../../constants/socialProviders";
import { useLanguage } from "../../contexts/LanguageContext";

export default function RegisterPage() {
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

    const result = await registerUser(formData.email, t);

    if (result.success) {
      navigate("/verify-email", { state: { email: formData.email } });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // Form validation
  const formIsValid = isFormValid(formData, validationErrors);

  return (
    <Layout className="flex items-center justify-center px-3 max-w-xl mx-auto">
      <div className="w-full max-w-md py-8">
        {/* Header with Piggy Bank Icon */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Budget Buddy Mascot"
            className="mx-auto mb-4 w-14 h-14"
          />
          <h1 className="text-2xl font-bold text-gray-800 font-inter">
            {t("registration.title")}
          </h1>
        </div>

        <ErrorMessage message={error} />

        {/* Registration Form */}
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
            {isLoading ? t("auth.registering") : t("auth.continue")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-lg font-inter">
            {t("auth.orSignUpWith")}
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social Registration Buttons */}
        <div className="space-y-3 flex flex-col">
          {SOCIAL_PROVIDERS.map((provider) => (
            <SocialButton
              key={provider.id}
              {...provider}
              onClick={() => console.log("Register with", provider.id)}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-md text-gray-600 text-center font-inter">
          {t("auth.haveAccount")}{" "}
          <a href="/login" className="text-primary hover:underline">
            {t("auth.signIn")}
          </a>
        </p>
      </div>
    </Layout>
  );
}
