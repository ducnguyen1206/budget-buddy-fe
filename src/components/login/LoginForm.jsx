import { useState } from "react";
import FormField from "../common/FormField";
import ErrorMessage from "../common/ErrorMessage";
import SocialButton from "../common/SocialButton";
import {
  validateEmail,
  validatePassword,
  isLoginFormValid,
} from "../../utils/validation";
import { LOGIN_SOCIAL_PROVIDERS } from "../../constants/socialProviders";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      setValidationErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
    if (name === "password") {
      setValidationErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setValidationErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual login API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login success:", formData);
    }, 1000);
  };

  // Form validation
  const formIsValid = isLoginFormValid(formData, validationErrors);

  return (
    <div className="p-8 w-full max-w-7xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-inter">
          Welcome back
        </h1>
        <p className="text-gray-600 text-lg font-normal font-inter">
          Enter your details to get signed in to your account.
        </p>
      </div>

      <ErrorMessage message={error} />

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={validationErrors.email}
          disabled={isLoading}
          placeholder="e.g. username@kinety.com"
        />

        <FormField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={validationErrors.password}
          disabled={isLoading}
          placeholder="Enter your password"
        >
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </FormField>

        {/* Forgot Password Link */}
        <div className="text-left -mt-2">
          <a
            href="#"
            className="text-primary hover:text-secondary text-md font-medium font-inter"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formIsValid}
          className={`w-full py-3 px-6 rounded-2xl font-semibold text-lg font-inter ${
            isLoading || !formIsValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-secondary"
          }`}
        >
          {isLoading ? "Signing in..." : "Continue"}
        </button>
      </form>

      {/* Social Login Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-lg text-gray-500 font-inter">
          Or sign in with
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-4">
        {LOGIN_SOCIAL_PROVIDERS.map((provider) => (
          <SocialButton
            key={provider.id}
            {...provider}
            onClick={() => console.log("Social:", provider.id)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
