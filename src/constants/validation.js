// Validation constants
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: "Please enter your email address",
    INVALID: "Please enter a valid email address (e.g., user@example.com)",
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    REQUIRED: "Password is required",
    MIN_LENGTH: "Password must be at least 8 characters",
    LOWERCASE: "Password must contain at least one lowercase letter",
    UPPERCASE: "Password must contain at least one uppercase letter",
    NUMBER: "Password must contain at least one number",
    CONFIRM_REQUIRED: "Please re-enter your password",
    MISMATCH: "Passwords do not match",
  },
};

// API error messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Connection issue detected. Please check your internet connection and try again.",
  SERVER_CONNECTION_ERROR:
    "We're having trouble connecting to our servers. Please try again in a few moments.",
  INVALID_INPUT: "Please enter a valid email address (e.g., user@example.com).",
  EMAIL_EXISTS:
    "This email is already registered. Would you like to sign in instead?",
  REGISTRATION_FAILED:
    "Something went wrong. Please try again or contact support if the problem persists.",
  SERVER_ERROR:
    "Our servers are experiencing issues. Please try again in a few minutes.",
  TIMEOUT_ERROR:
    "Request timed out. Please check your connection and try again.",
  TOKEN_INVALID:
    "This verification link is invalid or has expired. Please request a new one.",
  TOKEN_MISSING:
    "No verification token provided. Please check your email for the correct link.",
  VERIFICATION_FAILED:
    "Email verification failed. Please try again or contact support.",
  PASSWORD_RESET_FAILED:
    "Password reset failed. Please try again or contact support.",
  USER_NOT_FOUND: "User not found. Please check your email and try again.",
  INVALID_PASSWORD_REQUEST: "Invalid password reset request. Please try again.",
};

// HTTP status codes
export const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
};
