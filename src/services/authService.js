import { getApiUrl, API_ENDPOINTS, API_CONFIG } from "../config/api";
import { HTTP_STATUS, API_ERROR_MESSAGES } from "../constants/validation";

// Registration service
export const registerUser = async (email) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
      method: "POST",
      headers: API_CONFIG.headers,
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
        API_ERROR_MESSAGES.INVALID_INPUT;
      return {
        success: false,
        error: errorMessage,
      };
    } else if (response.status === HTTP_STATUS.CONFLICT) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.EMAIL_EXISTS,
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_ERROR,
      };
    } else {
      return {
        success: false,
        error: API_ERROR_MESSAGES.REGISTRATION_FAILED,
      };
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        success: false,
        error:
          "Unable to reach our servers. Please check your internet connection and try again.",
      };
    }

    if (
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_NETWORK")
    ) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_CONNECTION_ERROR,
      };
    }

    return {
      success: false,
      error: API_ERROR_MESSAGES.NETWORK_ERROR,
    };
  }
};

// Token verification service
export const verifyToken = async (token) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.VERIFY), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ refreshToken: token }),
    });

    if (response.status === HTTP_STATUS.CREATED || response.status === 200) {
      try {
        const responseText = await response.text();
        console.log("Token verification response:", responseText);

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
            error: API_ERROR_MESSAGES.VERIFICATION_FAILED,
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
          API_ERROR_MESSAGES.TOKEN_INVALID;
        return {
          success: false,
          error: errorMessage,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for error response:", jsonError);
        return {
          success: false,
          error: API_ERROR_MESSAGES.TOKEN_INVALID,
        };
      }
    } else if (response.status === 401) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.TOKEN_INVALID,
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_ERROR,
      };
    } else {
      return {
        success: false,
        error: API_ERROR_MESSAGES.VERIFICATION_FAILED,
      };
    }
  } catch (error) {
    console.error("Token verification error:", error);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        success: false,
        error:
          "Unable to reach our servers. Please check your internet connection and try again.",
      };
    }

    if (
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_NETWORK")
    ) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_CONNECTION_ERROR,
      };
    }

    return {
      success: false,
      error: API_ERROR_MESSAGES.NETWORK_ERROR,
    };
  }
};

// Password reset service
export const resetPassword = async (token, password, reenterPassword) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.RESET_PASSWORD), {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ token, password, reenterPassword }),
    });

    if (response.status === 204) {
      return { success: true };
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      const errorData = await response.json();
      const errorMessage =
        errorData.message ||
        errorData.error ||
        API_ERROR_MESSAGES.INVALID_PASSWORD_REQUEST;
      return {
        success: false,
        error: errorMessage,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.USER_NOT_FOUND,
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_ERROR,
      };
    } else {
      return {
        success: false,
        error: API_ERROR_MESSAGES.PASSWORD_RESET_FAILED,
      };
    }
  } catch (error) {
    console.error("Password reset error:", error);

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        success: false,
        error:
          "Unable to reach our servers. Please check your internet connection and try again.",
      };
    }

    if (
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_NETWORK")
    ) {
      return {
        success: false,
        error: API_ERROR_MESSAGES.SERVER_CONNECTION_ERROR,
      };
    }

    return {
      success: false,
      error: API_ERROR_MESSAGES.NETWORK_ERROR,
    };
  }
};
