import { getApiUrl, getApiHeaders } from "../config/api";
import { API_ENDPOINTS } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";

// Fetch budgets from API
export const fetchBudgets = async (currency = "", t = null) => {
  try {
    console.log("Fetching budgets from API...");

    // Build URL with currency parameter if provided
    let url = getApiUrl(API_ENDPOINTS.BUDGETS);
    if (currency) {
      url += `?currency=${encodeURIComponent(currency)}`;
    }

    const response = await fetchWithAuth(
      url,
      {
        method: "GET",
        headers: getApiHeaders(true),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const data = await response.json();
        console.log("Budgets fetched successfully:", data);
        return {
          success: true,
          data: data,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for budgets response:", jsonError);
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status >= 500) {
      return {
        success: false,
        error: t ? t("errors.serverError") : "Server error occurred",
      };
    } else {
      return {
        success: false,
        error: t ? t("errors.fetchBudgetsFailed") : "Failed to fetch budgets",
      };
    }
  } catch (error) {
    console.error("Fetch budgets error:", error);
    return {
      success: false,
      error: t ? t("errors.networkError") : "Network error occurred",
    };
  }
};

// Fetch single budget by ID
export const fetchBudgetById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.BUDGETS)}/${id}`,
      {
        method: "GET",
        headers: getApiHeaders(true),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for budget response:", jsonError);
        return {
          success: false,
          error: handleApiError("FETCH_BUDGET_FAILED", t),
        };
      }
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("BUDGET_NOT_FOUND", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("FETCH_BUDGET_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Fetch budget error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Update budget
export const updateBudget = async (id, budgetData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.BUDGETS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(budgetData),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const responseText = await response.text();

        if (!responseText || responseText.trim() === "") {
          return {
            success: true,
            data: null,
          };
        }

        const updatedBudget = JSON.parse(responseText);
        return {
          success: true,
          data: updatedBudget || null,
        };
      } catch (error) {
        console.warn("Failed to parse update budget response:", error);
        return {
          success: true,
          data: null,
        };
      }
    } else if (response.status === 204) {
      return {
        success: true,
        data: null,
      };
    } else if (response.status === 400) {
      return {
        success: false,
        error: handleApiError("INVALID_BUDGET_DATA", t),
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("BUDGET_NOT_FOUND", t),
      };
    } else if (response.status === 409) {
      return {
        success: false,
        error: handleApiError("BUDGET_IN_USE", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("UPDATE_BUDGET_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Update budget error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Create budget
export const createBudget = async (budgetData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.BUDGETS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(budgetData),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 201) {
      // Check if response has content
      const contentLength = response.headers.get("content-length");

      // If content-length is 0, response body is empty - return success
      if (contentLength === "0") {
        return {
          success: true,
          data: null,
        };
      }

      // Try to parse as JSON, but handle empty response gracefully
      try {
        // Read response as text first to check if it's empty
        const responseText = await response.text();

        // If response is empty, return success with no data
        if (!responseText || responseText.trim() === "") {
          return {
            success: true,
            data: null,
          };
        }

        // Try to parse as JSON
        try {
          const newBudget = JSON.parse(responseText);
          return {
            success: true,
            data: newBudget || null,
          };
        } catch (parseError) {
          // If parsing fails but we have text, return success with null data
          // Status 201 means creation was successful regardless of response body
          return {
            success: true,
            data: null,
          };
        }
      } catch (error) {
        // If reading response fails, still consider it successful since status is 201
        console.warn(
          "Failed to read create budget response (but status is 201):",
          error
        );
        return {
          success: true,
          data: null,
        };
      }
    } else if (response.status === 400) {
      return {
        success: false,
        error: handleApiError("INVALID_BUDGET_DATA", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("CREATE_BUDGET_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Create budget error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

// Delete budget
export const deleteBudget = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.BUDGETS)}/${id}`,
      {
        method: "DELETE",
        headers: getApiHeaders(true),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 204 || response.status === 200) {
      // 204 No Content or 200 OK means deletion was successful
      return {
        success: true,
        data: null,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("BUDGET_NOT_FOUND", t),
      };
    } else if (response.status === 409) {
      return {
        success: false,
        error: handleApiError("BUDGET_IN_USE", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("DELETE_BUDGET_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Delete budget error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};
