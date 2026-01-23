import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

// Fetch subscriptions list
export const fetchSubscriptions = async (t = null) => {
  try {
    const url = getApiUrl(API_ENDPOINTS.SUBSCRIPTIONS);

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
        console.warn("JSON parsing failed for subscriptions response:", jsonError);
        return { success: false, error: handleApiError("FETCH_SUBSCRIPTIONS_FAILED", t) };
      }
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_SUBSCRIPTIONS_FAILED", t) };
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Fetch single subscription by ID
export const fetchSubscriptionById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SUBSCRIPTIONS)}/${id}`,
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
        console.warn("JSON parsing failed for subscription response:", jsonError);
        return { success: false, error: handleApiError("FETCH_SUBSCRIPTION_FAILED", t) };
      }
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("SUBSCRIPTION_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_SUBSCRIPTION_FAILED", t) };
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Create a subscription
export const createSubscription = async (subscriptionData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.SUBSCRIPTIONS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(subscriptionData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.CREATED) {
      return { success: true, data: null };
    }

    if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return { success: false, error: handleApiError("INVALID_SUBSCRIPTION_DATA", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("CREATE_SUBSCRIPTION_FAILED", t) };
  } catch (error) {
    console.error("Create subscription error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Update subscription
export const updateSubscription = async (id, subscriptionData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SUBSCRIPTIONS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(subscriptionData),
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
      return { success: false, error: handleApiError("INVALID_SUBSCRIPTION_DATA", t) };
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("SUBSCRIPTION_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("UPDATE_SUBSCRIPTION_FAILED", t) };
  } catch (error) {
    console.error("Update subscription error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Delete subscription
export const deleteSubscription = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.SUBSCRIPTIONS)}/${id}`,
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
      return { success: false, error: handleApiError("SUBSCRIPTION_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("DELETE_SUBSCRIPTION_FAILED", t) };
  } catch (error) {
    console.error("Delete subscription error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};
