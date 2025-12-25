import { getAuthHeader } from "../utils/tokenManager";

// API Configuration
// Use environment variable or fallback to localhost for development
export const API_BASE_URL =  "budget-buddy-be-11xo2-web.budget-buddy-be-11xo2.svc.cluster.local";
//
// export const API_BASE_URL = "https://18.142.242.248.nip.io";

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: "/api/v1/auth/token",
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  VERIFY: "/api/v1/auth/verify",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
  REFRESH_TOKEN: "/api/v1/auth/refresh-token",
  CATEGORIES: "/api/v1/categories",
  ACCOUNTS: "/api/v1/accounts",
  BUDGETS: "/api/v1/budgets",
  TRANSACTIONS_INQUIRY: "/api/v1/transaction/inquiry",
  TRANSACTION: "/api/v1/transaction",
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// API request configuration
export const API_CONFIG = {
  headers: {
    "Content-Type": "application/json",
    accept: "*/*",
  },
};

// Get API headers with authentication (if available)
export const getApiHeaders = (includeAuth = true) => {
  const baseHeaders = {
    "Content-Type": "application/json",
    accept: "*/*",
  };

  if (includeAuth) {
    const authHeader = getAuthHeader();
    return { ...baseHeaders, ...authHeader };
  }

  return baseHeaders;
};
