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
  CATEGORY: {
    NAME_REQUIRED: "validation.nameRequired",
    TYPE_REQUIRED: "validation.categoryTypeRequired",
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
  FETCH_CATEGORY_FAILED: "errors.fetchCategoryFailed",
  CREATE_CATEGORY_FAILED: "errors.createCategoryFailed",
  UPDATE_CATEGORY_FAILED: "errors.updateCategoryFailed",
  DELETE_CATEGORY_FAILED: "errors.deleteCategoryFailed",
  INVALID_CATEGORY_DATA: "errors.invalidCategoryData",
  CATEGORY_ALREADY_EXISTS: "errors.categoryAlreadyExists",
  CATEGORY_NOT_FOUND: "errors.categoryNotFound",
  CATEGORY_IN_USE: "errors.categoryInUse",
  FETCH_ACCOUNTS_FAILED: "errors.fetchAccountsFailed",
  FETCH_ACCOUNT_FAILED: "errors.fetchAccountFailed",
  CREATE_ACCOUNT_FAILED: "errors.createAccountFailed",
  UPDATE_ACCOUNT_FAILED: "errors.updateAccountFailed",
  DELETE_ACCOUNT_FAILED: "errors.deleteAccountFailed",
  INVALID_ACCOUNT_DATA: "errors.invalidAccountData",
  ACCOUNT_ALREADY_EXISTS: "errors.accountAlreadyExists",
  ACCOUNT_NOT_FOUND: "errors.accountNotFound",
  ACCOUNT_IN_USE: "errors.accountInUse",
};

// HTTP status codes
export const HTTP_STATUS = {
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  NO_CONTENT: 204,
};
