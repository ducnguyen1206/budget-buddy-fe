import { getApiUrl, getApiHeaders } from "../config/api";

// Generic API service for authenticated requests
export const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    includeAuth = true,
    ...otherOptions
  } = options;

  const config = {
    method,
    headers: getApiHeaders(includeAuth),
    ...otherOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(getApiUrl(endpoint), config);
    return response;
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
};

// Convenience methods for common HTTP methods
export const apiGet = (endpoint, options = {}) =>
  apiCall(endpoint, { method: "GET", ...options });

export const apiPost = (endpoint, body, options = {}) =>
  apiCall(endpoint, { method: "POST", body, ...options });

export const apiPut = (endpoint, body, options = {}) =>
  apiCall(endpoint, { method: "PUT", body, ...options });

export const apiDelete = (endpoint, options = {}) =>
  apiCall(endpoint, { method: "DELETE", ...options });

export const apiPatch = (endpoint, body, options = {}) =>
  apiCall(endpoint, { method: "PATCH", body, ...options });
