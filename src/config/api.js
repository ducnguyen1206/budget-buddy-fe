import { getAuthHeader } from "../utils/tokenManager";

// API Configuration
// Use environment variable or fallback to localhost for development
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: "/api/v1/auth/token",
  LOGIN: "/api/v1/auth/login",
  VERIFY: "/api/v1/auth/verify",
  RESET_PASSWORD: "/api/v1/auth/reset-password",
  REFRESH_TOKEN: "/api/v1/auth/refresh-token",
  CATEGORIES: "/api/v1/categories",
  ACCOUNTS: "/api/v1/accounts",
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
