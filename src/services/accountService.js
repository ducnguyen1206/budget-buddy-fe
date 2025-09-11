import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

/**
 * Fetch all accounts grouped by account type
 * @param {Function} t - Translation function
 * @returns {Promise<Object>} - Success/error result
 */
export const fetchAccounts = async (t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.ACCOUNTS),
      {
        method: "GET",
        headers: getApiHeaders(true),
      },
      t
    );

    // Check if we should redirect to login
    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const accountsData = await response.json();
        return { success: true, data: accountsData };
      } catch (jsonError) {
        console.error("Error parsing accounts JSON:", jsonError);
        return {
          success: false,
          error: handleApiError("FETCH_ACCOUNTS_FAILED", t),
        };
      }
    } else if (response.status === 401 || response.status === 403) {
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
        error: handleApiError("FETCH_ACCOUNTS_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error fetching accounts:", error);
    return {
      success: false,
      error: handleApiError("NETWORK_ERROR", t),
    };
  }
};

/**
 * Create a new account
 * @param {Object} accountData - Account data
 * @param {Function} t - Translation function
 * @returns {Promise<Object>} - Success/error result
 */
export const createAccount = async (accountData, t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.ACCOUNTS),
      {
        method: "POST",
        headers: getApiHeaders(true),
        body: JSON.stringify(accountData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.CREATED) {
      try {
        const newAccount = await response.json();
        return { success: true, data: newAccount };
      } catch (jsonError) {
        console.error("Error parsing create account JSON:", jsonError);
        return {
          success: false,
          error: handleApiError("CREATE_ACCOUNT_FAILED", t),
        };
      }
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return {
        success: false,
        error: handleApiError("INVALID_ACCOUNT_DATA", t),
      };
    } else if (response.status === HTTP_STATUS.CONFLICT) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_ALREADY_EXISTS", t),
      };
    } else if (response.status === 401 || response.status === 403) {
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
        error: handleApiError("CREATE_ACCOUNT_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error creating account:", error);
    return {
      success: false,
      error: handleApiError("NETWORK_ERROR", t),
    };
  }
};

/**
 * Update an existing account
 * @param {number} id - Account ID
 * @param {Object} accountData - Updated account data
 * @param {Function} t - Translation function
 * @returns {Promise<Object>} - Success/error result
 */
export const updateAccount = async (id, accountData, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.ACCOUNTS)}/${id}`,
      {
        method: "PUT",
        headers: getApiHeaders(true),
        body: JSON.stringify(accountData),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === 200) {
      try {
        const updatedAccount = await response.json();
        return { success: true, data: updatedAccount };
      } catch (jsonError) {
        console.error("Error parsing update account JSON:", jsonError);
        return {
          success: false,
          error: handleApiError("UPDATE_ACCOUNT_FAILED", t),
        };
      }
    } else if (response.status === HTTP_STATUS.BAD_REQUEST) {
      return {
        success: false,
        error: handleApiError("INVALID_ACCOUNT_DATA", t),
      };
    } else if (response.status === HTTP_STATUS.NOT_FOUND) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_NOT_FOUND", t),
      };
    } else if (response.status === HTTP_STATUS.CONFLICT) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_ALREADY_EXISTS", t),
      };
    } else if (response.status === 401 || response.status === 403) {
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
        error: handleApiError("UPDATE_ACCOUNT_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error updating account:", error);
    return {
      success: false,
      error: handleApiError("NETWORK_ERROR", t),
    };
  }
};

/**
 * Delete an account
 * @param {number} id - Account ID
 * @param {Function} t - Translation function
 * @returns {Promise<Object>} - Success/error result
 */
export const deleteAccount = async (id, t = null) => {
  try {
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.ACCOUNTS)}/${id}`,
      {
        method: "DELETE",
        headers: getApiHeaders(true),
      },
      t
    );

    if (shouldRedirectToLogin(response)) {
      return response;
    }

    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return { success: true, data: null };
    } else if (response.status === HTTP_STATUS.NOT_FOUND) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_NOT_FOUND", t),
      };
    } else if (response.status === HTTP_STATUS.CONFLICT) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_IN_USE", t),
      };
    } else if (response.status === 401 || response.status === 403) {
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
        error: handleApiError("DELETE_ACCOUNT_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error deleting account:", error);
    return {
      success: false,
      error: handleApiError("NETWORK_ERROR", t),
    };
  }
};
