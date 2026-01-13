import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError, handleNetworkError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

// Fetch installments list
export const fetchInstallments = async (t = null) => {
  try {
    const url = getApiUrl(API_ENDPOINTS.INSTALLMENTS);

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
        console.warn("JSON parsing failed for installments response:", jsonError);
        return { success: false, error: handleApiError("FETCH_INSTALLMENTS_FAILED", t) };
      }
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_INSTALLMENTS_FAILED", t) };
  } catch (error) {
    console.error("Fetch installments error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Fetch single installment by ID
export const fetchInstallmentById = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.INSTALLMENTS)}/${id}`,
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
        console.warn("JSON parsing failed for installment response:", jsonError);
        return { success: false, error: handleApiError("FETCH_INSTALLMENT_FAILED", t) };
      }
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("INSTALLMENT_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("FETCH_INSTALLMENT_FAILED", t) };
  } catch (error) {
    console.error("Fetch installment error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Create an installment
export const createInstallment = async (installmentData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.INSTALLMENTS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(installmentData),
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
      return { success: false, error: handleApiError("INVALID_INSTALLMENT_DATA", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("CREATE_INSTALLMENT_FAILED", t) };
  } catch (error) {
    console.error("Create installment error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Update installment
export const updateInstallment = async (id, installmentData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.INSTALLMENTS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(installmentData),
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
      return { success: false, error: handleApiError("INVALID_INSTALLMENT_DATA", t) };
    }

    if (response.status === HTTP_STATUS.NOT_FOUND) {
      return { success: false, error: handleApiError("INSTALLMENT_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("UPDATE_INSTALLMENT_FAILED", t) };
  } catch (error) {
    console.error("Update installment error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Delete installment
export const deleteInstallment = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.INSTALLMENTS)}/${id}`,
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
      return { success: false, error: handleApiError("INSTALLMENT_NOT_FOUND", t) };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("DELETE_INSTALLMENT_FAILED", t) };
  } catch (error) {
    console.error("Delete installment error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};

// Bulk delete installments
export const bulkDeleteInstallments = async (ids, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.INSTALLMENTS),
      {
        method: "DELETE",
        headers: getApiHeaders(true),
        body: JSON.stringify(ids),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.NO_CONTENT || response.status === 200) {
      return { success: true, data: null };
    }

    if (response.status >= 500) {
      return { success: false, error: handleApiError("SERVER_ERROR", t) };
    }

    return { success: false, error: handleApiError("DELETE_INSTALLMENT_FAILED", t) };
  } catch (error) {
    console.error("Bulk delete installments error:", error);
    return { success: false, error: handleNetworkError(error, t) };
  }
};
