import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { HTTP_STATUS, API_ERROR_MESSAGES } from "../constants/validation";
import {
  storeTokens,
} from "../utils/tokenManager";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import tokenRefreshManager from "../utils/tokenRefreshManager";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";

// Google login service
export const loginWithGoogle = async (code, t = null) => {
  try {
    const url = `${getApiUrl(API_ENDPOINTS.GOOGLE_LOGIN)}?code=${encodeURIComponent(code)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(false),
      credentials: "include",
    });

    if (response.status === 200) {
      try {
        const responseData = await response.json();
        const { token } = responseData;

        // Store tokens in sessionStorage
        if (token) {
          storeTokens(token);
          // Start token refresh manager
          tokenRefreshManager.start();

          // Dispatch custom event to notify other components
          window.dispatchEvent(
            new CustomEvent("authTokensStored", {
              detail: { token },
            })
          );
        }

        return {
          success: true,
          data: responseData,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for Google login response:", jsonError);
        return { success: true, data: {} };
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
    console.error("Google login error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

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
        const { token } = responseData;

        // Store tokens in sessionStorage
        if (token) {
          storeTokens(token);
          // Start token refresh manager
          tokenRefreshManager.start();

          // Dispatch custom event to notify other components
          window.dispatchEvent(
            new CustomEvent("authTokensStored", {
              detail: { token },
            })
          );
        }

        return {
          success: true,
          data: {
            email,
            token,
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
      body: JSON.stringify({ token }),
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
   

    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.REFRESH_TOKEN),
      {
        method: "POST",
        headers: getApiHeaders(true), // Include auth token for refresh token API
        credentials: "include",
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
        const { token } = responseData;

        // Store new tokens
        if (token) {
          storeTokens(token);
        }

        return {
          success: true,
          data: {
            token,
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

// Logout service
export const logoutUser = async (t = null) => {
  try {
    console.log("Calling logout API...");

    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.LOGOUT),
      {
        method: "POST",
        headers: getApiHeaders(true), // Include auth token for logout API
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 200 || response.status === 204) {
      console.log("Logout API call successful");
      return {
        success: true,
        data: { message: "Logged out successfully" },
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("LOGOUT_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};
