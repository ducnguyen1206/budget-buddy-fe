import { API_ERROR_MESSAGES } from "../constants/validation";

// Error handler that can work with or without translation function
export const handleApiError = (errorKey, t = null) => {
  const errorMessage = API_ERROR_MESSAGES[errorKey];

  if (t && errorMessage) {
    return t(errorMessage);
  }

  // Fallback to key if no translation function or message not found
  return errorMessage || errorKey;
};

// Network error handler
export const handleNetworkError = (error, t = null) => {
  if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
    return t
      ? t("errors.networkError")
      : "Unable to reach our servers. Please check your internet connection and try again.";
  }

  if (
    error.message.includes("NetworkError") ||
    error.message.includes("ERR_NETWORK")
  ) {
    return t
      ? t("errors.serverConnectionError")
      : "We're having trouble connecting to our servers. Please try again in a few moments.";
  }

  return t
    ? t("errors.networkError")
    : "Connection issue detected. Please check your internet connection and try again.";
};
