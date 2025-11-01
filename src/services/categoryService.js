import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";

export const fetchCategories = async (t = null, type = null) => {
  try {
    // Build URL with optional type query parameter
    let url = getApiUrl(API_ENDPOINTS.CATEGORIES);
    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }

    const response = await fetchWithAuth(
      url,
      {
        method: "GET",
        headers: getApiHeaders(true), // Include auth token
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

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

export const fetchCategoryById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.CATEGORIES)}/${id}`,
      {
        method: "GET",
        headers: getApiHeaders(true), // Include auth token
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 200) {
      try {
        const category = await response.json();
        return {
          success: true,
          data: category,
        };
      } catch (jsonError) {
        console.warn("JSON parsing failed for category response:", jsonError);
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("CATEGORY_NOT_FOUND", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("FETCH_CATEGORY_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Fetch category error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

export const createCategory = async (categoryData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.CATEGORIES),
      {
        method: "POST",
        headers: getApiHeaders(true), // Include auth token
        body: JSON.stringify(categoryData),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 201) {
      try {
        const newCategory = await response.json();
        return {
          success: true,
          data: newCategory,
        };
      } catch (jsonError) {
        console.warn(
          "JSON parsing failed for create category response:",
          jsonError
        );
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status === 400) {
      return {
        success: false,
        error: handleApiError("INVALID_CATEGORY_DATA", t),
      };
    } else if (response.status === 409) {
      return {
        success: false,
        error: handleApiError("CATEGORY_ALREADY_EXISTS", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("CREATE_CATEGORY_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Create category error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

export const updateCategory = async (id, categoryData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.CATEGORIES)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true), // Include auth token
        body: JSON.stringify(categoryData),
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 200) {
      try {
        const updatedCategory = await response.json();
        return {
          success: true,
          data: updatedCategory,
        };
      } catch (jsonError) {
        console.warn(
          "JSON parsing failed for update category response:",
          jsonError
        );
        return {
          success: false,
          error: "Invalid response format",
        };
      }
    } else if (response.status === 400) {
      return {
        success: false,
        error: handleApiError("INVALID_CATEGORY_DATA", t),
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("CATEGORY_NOT_FOUND", t),
      };
    } else if (response.status === 409) {
      return {
        success: false,
        error: handleApiError("CATEGORY_ALREADY_EXISTS", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("UPDATE_CATEGORY_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Update category error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};

export const deleteCategory = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.CATEGORIES)}/${id}`,
      {
        method: "DELETE",
        headers: getApiHeaders(true), // Include auth token
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    if (response.status === 204) {
      return {
        success: true,
        data: null,
      };
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("CATEGORY_NOT_FOUND", t),
      };
    } else if (response.status === 409) {
      return {
        success: false,
        error: handleApiError("CATEGORY_IN_USE", t),
      };
    } else if (response.status >= 500) {
      return {
        success: false,
        error: handleApiError("SERVER_ERROR", t),
      };
    } else {
      return {
        success: false,
        error: handleApiError("DELETE_CATEGORY_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Delete category error:", error);
    return {
      success: false,
      error: handleNetworkError(error, t),
    };
  }
};
