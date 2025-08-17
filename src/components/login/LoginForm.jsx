import { useState } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    email: "kenendy@kinety.com",
    password: "Feb@1234",
  });

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Password strength validation function
  const validatePassword = (password) => {
    const errors = [];

    if (!password) {
      return "Password is required";
    }

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("At least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("At least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("At least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("At least one special character (@$!%*?&)");
    }

    return errors.length > 0 ? errors.join(", ") : "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear general error when user starts typing
    if (error) {
      setError("");
    }

    // Validate in real-time
    if (name === "email") {
      const emailError = validateEmail(value);
      setValidationErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setValidationErrors((prev) => ({
        ...prev,
        password: passwordError,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setValidationErrors({
      email: emailError,
      password: passwordError,
    });

    // If there are validation errors, don't submit
    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call with delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate invalid credentials for testing
          if (
            formData.email === "invalid@example.com" ||
            formData.password === "wrongpassword"
          ) {
            reject(new Error("Invalid email or password. Please try again."));
          } else {
            resolve({ success: true });
          }
        }, 1000);
      });

      // Success case
      console.log("Login successful:", formData);
      // TODO: Handle successful login (redirect, set auth state, etc.)
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Add social login API call here
    console.log("Social login:", provider);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      !validationErrors.email &&
      !validationErrors.password
    );
  };

  return (
    <div className="p-8 w-full max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-inter">
          Welcome back
        </h1>
        <p className="text-gray-600 text-lg font-normal font-inter whitespace-nowrap">
          Enter your details to get sign in to your account.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-error"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-error text-base font-medium font-inter">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-lg font-semibold text-gray-700 mb-3 font-inter"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-6 py-3 border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-white text-lg font-inter font-normal ${
              validationErrors.email || error
                ? "border-error focus:ring-error"
                : "border-gray-300"
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-2 text-error text-sm font-inter">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-lg font-semibold text-gray-700 mb-3 font-inter"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors bg-white text-lg font-inter font-normal ${
                validationErrors.password || error
                  ? "border-error focus:ring-error"
                  : "border-gray-300"
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {validationErrors.password && (
            <p className="mt-2 text-error text-sm font-inter">
              {validationErrors.password}
            </p>
          )}

          {/* Password Strength Indicator */}
          {formData.password && !validationErrors.password && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 text-sm font-medium font-inter">
                  Strong password ✓
                </span>
              </div>
            </div>
          )}

          {/* Forgot Password - moved closer to password field */}
          <div className="text-left mt-2">
            <button
              type="button"
              className="text-primary hover:text-secondary text-base font-normal font-inter disabled:opacity-50"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className={`w-full py-3 px-6 rounded-2xl font-semibold transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 text-lg font-inter ${
            isLoading || !isFormValid()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-secondary"
          }`}
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Signing in...</span>
            </div>
          ) : (
            "Continue"
          )}
        </button>
      </form>

      {/* Separator */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-lg text-gray-500 font-inter font-normal">
          Or sign in with
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter disabled:opacity-50"
          disabled={isLoading}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Google
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("apple")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter disabled:opacity-50"
          disabled={isLoading}
        >
          <img src="/apple.png" alt="Apple" className="w-5 h-5" />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Apple
          </span>
        </button>
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center space-x-2 py-4 px-5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors bg-white font-inter disabled:opacity-50"
          disabled={isLoading}
        >
          <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
          <span className="text-lg font-medium text-gray-700 font-inter">
            Facebook
          </span>
        </button>
      </div>
    </div>
  );
}
