import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { HTTP_STATUS, API_ERROR_MESSAGES } from "../constants/validation";
import {
  storeTokens,
  getRefreshToken,
  removeTokens,
} from "../utils/tokenManager";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import tokenRefreshManager from "../utils/tokenRefreshManager";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";

// Login service
export const loginUser = async (email, password, t = null) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: "POST",
      headers: getApiHeaders(false), // No auth needed for login
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      try {
        const responseData = await response.json();
        const { token, refreshToken } = responseData;

        // Store tokens in sessionStorage
        if (token || refreshToken) {
          storeTokens(token, refreshToken);
          // TODO: Uncomment when backend refresh token API is ready
          // tokenRefreshManager.start();

          // Dispatch custom event to notify other components
          window.dispatchEvent(
            new CustomEvent("authTokensStored", {
              detail: { token, refreshToken },
            })
          );
        }

        return {
          success: true,
          data: {
            email,
            token,
            refreshToken,
          },
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for login response:", jsonError);
        return { success: true, data: { email } };
      }
    } else if (response.status === 401) {
      return {
        success: false,
        error: handleApiError("INVALID_CREDENTIALS", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("LOGIN_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Registration service
export const registerUser = async (email, t = null) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
      method: "POST",
      headers: getApiHeaders(false), // No auth needed for registration
      body: JSON.stringify({ email }),
    });

    if (response.status === HTTP_STATUS.CREATED) {
      return { success: true, data: { email } };
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      const errorData = await response.json();
      // Try to extract specific error message from backend
      const errorMessage =
        errorData.message ||
        errorData.error ||
        handleApiError("INVALID_INPUT", t);
      return {
        success: false,
        error: errorMessage,
      };
    } else if (response.status === HTTP_STATUS.CONFLICT) {
      return {
        success: false,
        error: handleApiError("EMAIL_EXISTS", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("REGISTRATION_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Token verification service
export const verifyToken = async (token, t = null) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.VERIFY), {
      method: "POST",
      headers: getApiHeaders(false), // No auth needed for token verification
      body: JSON.stringify({ refreshToken: token }),
    });

    if (response.status === HTTP_STATUS.CREATED || response.status === 200) {
      try {
        const responseText = await response.text();

        // Check if response contains "verified" to confirm success
        if (responseText.includes("verified")) {
          return {
            success: true,
            data: {
              token,
            },
          };
        } else {
          return {
            success: false,
            error: handleApiError("VERIFICATION_FAILED", t),
          };
        }
      } catch (textError) {
        console.warn(
          "Text parsing failed for token verification response:",
          textError
        );
        return {
          success: true,
          data: {
            token,
          },
        };
      }
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      try {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          handleApiError("TOKEN_INVALID", t);
        return {
          success: false,
          error: errorMessage,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for error response:", jsonError);
        return {
          success: false,
          error: handleApiError("TOKEN_INVALID", t),
        };
      }
    } else if (response.status === 401) {
      return {
        success: false,
        error: handleApiError("TOKEN_INVALID", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("VERIFICATION_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Password reset service
export const resetPassword = async (
  token,
  password,
  reenterPassword,
  t = null
) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.RESET_PASSWORD), {
      method: "POST",
      headers: getApiHeaders(false), // No auth needed for password reset
      body: JSON.stringify({ token, password, reenterPassword }),
    });

    if (response.status === 204) {
      return { success: true };
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message ||
        errorData.error ||
        handleApiError("INVALID_PASSWORD_REQUEST", t);
      return {
        success: false,
        error: errorMessage,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("USER_NOT_FOUND", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("PASSWORD_RESET_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Refresh token service
export const refreshToken = async (t = null) => {
  try {
    const refreshTokenValue = getRefreshToken();

    if (!refreshTokenValue) {
      console.warn("No refresh token available");
      return {
        success: false,
        error: "No refresh token available",
      };
    }

    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.REFRESH_TOKEN),
      {
        method: "POST",
        headers: getApiHeaders(true), // Include auth token for refresh token API
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 200) {
      try {
        const responseData = await response.json();
        const { token, refreshToken: newRefreshToken } = responseData;

        // Store new tokens
        if (token || newRefreshToken) {
          storeTokens(token, newRefreshToken);
        }

        return {
          success: true,
          data: {
            token,
            refreshToken: newRefreshToken,
          },
        };
      } catch (jsonError) {
        console.warn(
          "JSON parsing failed for refresh token response:",
          jsonError
        );
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("REFRESH_TOKEN_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};
