// Token management utilities
const TOKEN_KEY = "auth_token";

// Store tokens in sessionStorage (more secure than localStorage)
// sessionStorage is cleared when the browser tab is closed
export const storeTokens = (token) => {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

// Get access token
export const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

// Remove tokens (logout)
export const removeTokens = () => {
  sessionStorage.removeItem(TOKEN_KEY);
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
