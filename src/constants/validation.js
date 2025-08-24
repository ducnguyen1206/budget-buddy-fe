// Validation constants - These will be replaced by translation keys
export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: "validation.emailRequired",
    INVALID: "validation.emailInvalid",
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    REQUIRED: "validation.passwordRequired",
    MIN_LENGTH: "validation.passwordMinLength",
    LOWERCASE: "validation.passwordLowercase",
    UPPERCASE: "validation.passwordUppercase",
    NUMBER: "validation.passwordNumber",
    CONFIRM_REQUIRED: "validation.confirmPasswordRequired",
    MISMATCH: "validation.passwordsMismatch",
  },
};

// API error messages - These will be replaced by translation keys
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "errors.networkError",
  SERVER_CONNECTION_ERROR: "errors.serverConnectionError",
  INVALID_INPUT: "errors.invalidInput",
  EMAIL_EXISTS: "errors.emailExists",
  REGISTRATION_FAILED: "errors.registrationFailed",
  SERVER_ERROR: "errors.serverError",
  TIMEOUT_ERROR: "errors.timeoutError",
  TOKEN_INVALID: "errors.tokenInvalid",
  TOKEN_MISSING: "errors.tokenMissing",
  VERIFICATION_FAILED: "errors.verificationFailed",
  PASSWORD_RESET_FAILED: "errors.passwordResetFailed",
  USER_NOT_FOUND: "errors.userNotFound",
  INVALID_PASSWORD_REQUEST: "errors.invalidPasswordRequest",
  LOGIN_FAILED: "errors.loginFailed",
  INVALID_CREDENTIALS: "errors.invalidCredentials",
  REFRESH_TOKEN_FAILED: "errors.refreshTokenFailed",
  SESSION_EXPIRED: "errors.sessionExpired",
  UNAUTHORIZED: "errors.unauthorized",
  FETCH_CATEGORIES_FAILED: "errors.fetchCategoriesFailed",
};

// HTTP status codes
export const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  CONFLICT: 409,
};
