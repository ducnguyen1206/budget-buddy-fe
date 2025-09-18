import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";
import { API_BASE_URL, getApiHeaders } from "../config/api";

export const fetchTransactions = async (
  page = 0,
  size = 10,
  sortBy = "",
  direction = ""
) => {
  try {
    const url = `${API_BASE_URL}/api/v1/transaction/inquiry`;

    const requestBody = {
      page,
      size,
      sortBy,
      direction,
    };

    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        shouldRedirectToLogin();
        throw new Error("Unauthorized");
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch transactions");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
