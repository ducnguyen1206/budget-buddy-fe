import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";

// Fetch all categories
export const fetchCategories = async (t = null) => {
  try {
    const response = await fetch(getApiUrl(API_ENDPOINTS.CATEGORIES), {
      method: "GET",
      headers: getApiHeaders(true), // Include auth token
    });

    if (response.status === 200) {
      try {
        const categories = await response.json();
        return {
          success: true,
          data: categories,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for categories response:", jsonError);
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status === 401) {
      return {
        success: false,
        error: handleApiError("UNAUTHORIZED", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("FETCH_CATEGORIES_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Fetch categories error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};
