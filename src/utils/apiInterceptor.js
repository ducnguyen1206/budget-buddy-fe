import { removeTokens } from "./tokenManager";
import tokenRefreshManager from "./tokenRefreshManager";

// Global API interceptor to handle 401 errors
export const handleApiResponse = async (response, t = null) => {
  if (response.status === 401 || response.status === 403) {
    // Stop token refresh manager
    tokenRefreshManager.stop();

    // Clear all tokens
    removeTokens();

    // Redirect to login page
    window.location.href = "/login";

    // Return a standardized error response
    return {
      success: false,
      error: t
        ? t("errors.unauthorized")
        : "You are not authorized to access this resource. Please login again.",
      shouldRedirect: true,
    };
  }

  return response;
};

// Wrapper function for fetch that includes 401/403 handling
export const fetchWithAuth = async (url, options = {}, t = null) => {
  try {
    const response = await fetch(url, options);

    // Check for 401 and handle globally
    if (response.status === 401 || response.status === 403) {
      return await handleApiResponse(response, t);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Utility to check if a response should trigger redirect
export const shouldRedirectToLogin = (result) => {
  return result && result.shouldRedirect === true;
};
