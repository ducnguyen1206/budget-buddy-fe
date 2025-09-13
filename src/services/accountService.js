import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { handleApiError } from "../utils/errorHandler";
import { HTTP_STATUS } from "../constants/validation";

/**
 * Fetch available account types
 * @param {Function} t - Translation function
 * @returns {Promise<Object>} - Success/error result
 */
export const fetchAccountTypes = async (t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl("/api/v1/accounts/types"),
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
        const accountTypesData = await response.json();
        return { success: true, data: accountTypesData };
      } catch (jsonError) {
        console.error("Error parsing account types JSON:", jsonError);
        return {
          success: false,
          error: handleApiError("FETCH_ACCOUNT_TYPES_FAILED", t),
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
        error: handleApiError("FETCH_ACCOUNT_TYPES_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error fetching account types:", error);
    return {
      success: false,
      error: handleApiError("NETWORK_ERROR", t),
    };
  }
};

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

export const fetchAccount = async (id, t = null) => {
  try {
    console.log("🔍 Fetching account with ID:", id);
    const response = await fetchWithAuth(
      `${getApiUrl(API_ENDPOINTS.ACCOUNTS)}/${id}`,
      { method: "GET", headers: getApiHeaders(true) },
      t
    );

    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response:", response);

    if (shouldRedirectToLogin(response)) {
      console.log("🔍 Should redirect to login");
      return response;
    }

    if (response.status === 200) {
      try {
        const responseData = await response.json();
        console.log("🔍 Response data:", responseData);

        // The API returns { accountType: "...", accounts: [...] }
        // We need to extract the first account from the accounts array
        const account =
          responseData.accounts && responseData.accounts.length > 0
            ? responseData.accounts[0]
            : null;

        console.log("🔍 Extracted account:", account);

        if (!account) {
          console.log("🔍 No account found in response");
          return {
            success: false,
            error: handleApiError("ACCOUNT_NOT_FOUND", t),
          };
        }

        // Add the accountType to the account object for the form
        const accountWithType = {
          ...account,
          type: responseData.accountType,
        };

        console.log("🔍 Account with type:", accountWithType);
        return { success: true, data: accountWithType };
      } catch (jsonError) {
        console.error("Error parsing account JSON:", jsonError);
        return {
          success: false,
          error: handleApiError("FETCH_ACCOUNT_FAILED", t),
        };
      }
    } else if (response.status === 404) {
      return {
        success: false,
        error: handleApiError("ACCOUNT_NOT_FOUND", t),
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
        error: handleApiError("FETCH_ACCOUNT_FAILED", t),
      };
    }
  } catch (error) {
    console.error("Network error fetching account:", error);
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
      // POST /accounts API returns 201 without response body
      return { success: true, data: null };
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
    } else if (response.status === HTTP_STATUS.NO_CONTENT) {
      // PUT /accounts/{id} API returns 204 without response body
      return { success: true, data: null };
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
