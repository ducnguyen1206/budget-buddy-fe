import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

// Fetch savings list (optionally filtered by currency)
export const fetchSavings = async (currency = "", t = null) => {
  try {
    let url = getApiUrl(API_ENDPOINTS.SAVINGS);
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

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.CREATED || response.status === HTTP_STATUS.NO_CONTENT) {
      // Some APIs might return 201/204 for empty lists; treat as success with empty array
      return { success: true, data: [] };
    }

    if (response.status === 200) {
      try {
        const data = await response.json();
        return { success: true, data: data || [] };
      } catch (jsonError) {
        console.warn("JSON parsing failed for savings response:", jsonError);
        return { success: false, error: handleApiError("FETCH_SAVINGS_FAILED", t) };
      }
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_SAVINGS_FAILED", t) };
  } catch (error) {
    console.error("Fetch savings error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Fetch single saving by ID
export const fetchSavingById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SAVINGS)}/${id}`,
      {
        method: "GET",
        headers: getApiHeaders(true),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const data = await response.json();
        return { success: true, data };
      } catch (jsonError) {
        console.warn("JSON parsing failed for saving response:", jsonError);
        return { success: false, error: handleApiError("FETCH_SAVING_FAILED", t) };
      }
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("SAVING_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_SAVING_FAILED", t) };
  } catch (error) {
    console.error("Fetch saving error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Create a saving
export const createSaving = async (savingData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.SAVINGS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(savingData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.CREATED) {
      // Consider creation successful regardless of body content
      return { success: true, data: null };
    }

    if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return { success: false, error: handleApiError("INVALID_SAVING_DATA", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("CREATE_SAVING_FAILED", t) };
  } catch (error) {
    console.error("Create saving error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Update saving
export const updateSaving = async (id, savingData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SAVINGS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(savingData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200 || response.status === HTTP_STATUS.NO_CONTENT) {
      return { success: true, data: null };
    }

    if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return { success: false, error: handleApiError("INVALID_SAVING_DATA", t) };
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("SAVING_NOT_FOUND", t) };
    }

    if (response.status === HTTP_STATUS.CONFLICT) {
      return { success: false, error: handleApiError("SAVING_IN_USE", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("UPDATE_SAVING_FAILED", t) };
  } catch (error) {
    console.error("Update saving error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Delete saving
export const deleteSaving = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SAVINGS)}/${id}`,
      {
        method: "DELETE",
        headers: getApiHeaders(true),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.NO_CONTENT || response.status === 200) {
      return { success: true, data: null };
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("SAVING_NOT_FOUND", t) };
    }

    if (response.status === HTTP_STATUS.CONFLICT) {
      return { success: false, error: handleApiError("SAVING_IN_USE", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("DELETE_SAVING_FAILED", t) };
  } catch (error) {
    console.error("Delete saving error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};
