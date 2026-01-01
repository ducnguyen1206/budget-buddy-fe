// Token management utilities
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Store tokens in sessionStorage (more secure than localStorage)
// sessionStorage is cleared when the browser tab is closed
export const storeTokens = (token, refreshToken) => {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

// Get access token
export const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

// Get refresh token
export const getRefreshToken = () => {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

// Remove tokens (logout)
export const removeTokens = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get authorization header
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
