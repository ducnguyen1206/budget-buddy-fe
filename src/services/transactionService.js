import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
  getApiHeaders,
} from "../config/api";
import { fetchCategories } from "./categoryService";
import { fetchAccounts } from "./accountService";

// Fetch categories for transaction form (reusing existing service)
export const fetchCategoriesForTransaction = async () => {
  try {
    const result = await fetchCategories();

    if (shouldRedirectToLogin(result)) {
      return result;
    }

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Fetch accounts for transaction form (reusing existing service)
export const fetchAccountsForTransaction = async () => {
  try {
    const result = await fetchAccounts();

    if (shouldRedirectToLogin(result)) {
      return result;
    }

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch accounts");
    }
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

// Create transaction
export const createTransaction = async (transactionData) => {
  try {
    const response = await fetchWithAuth(getApiUrl(API_ENDPOINTS.TRANSACTION), {
      method: "POST",
      headers: getApiHeaders(true),
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Handle 201 Created with no content
    if (response.status === 201) {
      return { success: true, message: "Transaction created successfully" };
    }

    // Try to parse JSON for other success responses
    const data = await response.json().catch(() => ({}));

    if (shouldRedirectToLogin(data)) {
      return data;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

// Test API connectivity
export const testTransactionsAPI = async () => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: "0",
      size: "10",
      sortBy: "date",
      direction: "DESC",
    });

    const apiUrl = `${getApiUrl(
      API_ENDPOINTS.TRANSACTIONS_INQUIRY
    )}?${queryParams}`;

    const response = await fetchWithAuth(apiUrl, {
      method: "POST",
      headers: getApiHeaders(true),
    });
    return response.status;
  } catch (error) {
    console.error("Test API error:", error);
    throw error;
  }
};

// Fetch transactions
export const fetchTransactions = async (page = 0, size = 10, filters = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy: "date",
      direction: "DESC",
    });

    const apiUrl = `${getApiUrl(
      API_ENDPOINTS.TRANSACTIONS_INQUIRY
    )}?${queryParams}`;

    const headers = getApiHeaders(true);

    const response = await fetchWithAuth(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transactions API error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (shouldRedirectToLogin(data)) {
      return data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
