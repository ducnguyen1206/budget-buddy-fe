import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

// Fetch thresholds list
export const fetchThresholds = async (t = null) => {
  try {
    const url = getApiUrl(API_ENDPOINTS.THRESHOLDS);

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
      return { success: true, data: [] };
    }

    if (response.status === 200) {
      try {
        const data = await response.json();
        return { success: true, data: data || [] };
      } catch (jsonError) {
        console.warn("JSON parsing failed for thresholds response:", jsonError);
        return { success: false, error: handleApiError("FETCH_THRESHOLDS_FAILED", t) };
      }
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_THRESHOLDS_FAILED", t) };
  } catch (error) {
    console.error("Fetch thresholds error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Fetch single threshold by ID
export const fetchThresholdById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.THRESHOLDS)}/${id}`,
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
        console.warn("JSON parsing failed for threshold response:", jsonError);
        return { success: false, error: handleApiError("FETCH_THRESHOLD_FAILED", t) };
      }
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("THRESHOLD_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_THRESHOLD_FAILED", t) };
  } catch (error) {
    console.error("Fetch threshold error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Create a threshold
export const createThreshold = async (thresholdData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.THRESHOLDS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(thresholdData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.CREATED || response.status === 200) {
      try {
        const data = await response.json();
        return { success: true, data };
      } catch {
        return { success: true, data: null };
      }
    }

    if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return { success: false, error: handleApiError("INVALID_THRESHOLD_DATA", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("CREATE_THRESHOLD_FAILED", t) };
  } catch (error) {
    console.error("Create threshold error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Update threshold
export const updateThreshold = async (id, thresholdData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.THRESHOLDS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(thresholdData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200 || response.status === HTTP_STATUS.NO_CONTENT) {
      try {
        const data = await response.json();
        return { success: true, data };
      } catch {
        return { success: true, data: null };
      }
    }

    if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return { success: false, error: handleApiError("INVALID_THRESHOLD_DATA", t) };
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("THRESHOLD_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("UPDATE_THRESHOLD_FAILED", t) };
  } catch (error) {
    console.error("Update threshold error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Delete threshold
export const deleteThreshold = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.THRESHOLDS)}/${id}`,
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
      return { success: false, error: handleApiError("THRESHOLD_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("DELETE_THRESHOLD_FAILED", t) };
  } catch (error) {
    console.error("Delete threshold error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};
