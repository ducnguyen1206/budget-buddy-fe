# API 401 Error Handling System

This document explains how the application handles 401 (Unauthorized) errors globally and automatically redirects users to the login page.

## 🎯 Overview

When any API endpoint returns a 401 status code, the system automatically:

1. **Stops the token refresh manager**
2. **Clears all stored tokens**
3. **Redirects the user to the login page**
4. **Logs the action for debugging**

## 🔧 Implementation

### 1. API Interceptor (`src/utils/apiInterceptor.js`)

The core of the 401 handling system is the `apiInterceptor.js` utility:

```javascript
// Global API interceptor to handle 401 errors
export const handleApiResponse = async (response, t = null) => {
  if (response.status === 401) {
    console.log("API returned 401 - User unauthorized, redirecting to login");

    // Stop token refresh manager
    tokenRefreshManager.stop();

    // Clear all tokens
    removeTokens();

    // Redirect to login page
    window.location.href = "/login";

    return {
      success: false,
      error: t ? t("errors.unauthorized") : "You are not authorized...",
      shouldRedirect: true,
    };
  }

  return response;
};
```

### 2. Fetch Wrapper (`fetchWithAuth`)

Use `fetchWithAuth` instead of regular `fetch` for authenticated endpoints:

```javascript
import { fetchWithAuth, shouldRedirectToLogin } from "../utils/apiInterceptor";

const response = await fetchWithAuth(url, options, t);

// Check if redirect is needed
if (shouldRedirectToLogin(response)) {
  return response; // Redirect will be handled automatically
}
```

## 🔄 Token Refresh & Usage

### Automatic Token Refresh

The system automatically refreshes tokens every 5 minutes to maintain user sessions:

```javascript
// Token refresh manager runs every 5 minutes
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// After successful refresh, new tokens are stored
if (token || newRefreshToken) {
  storeTokens(token, newRefreshToken);
  console.log(
    "Token refreshed successfully - new token will be used for subsequent API calls"
  );
}
```

### Token Usage After Refresh

After a successful token refresh, the new token is automatically used for all subsequent API calls:

```javascript
// getApiHeaders() automatically uses the latest token
export const getApiHeaders = (includeAuth = true) => {
  const baseHeaders = {
    "Content-Type": "application/json",
    accept: "*/*",
  };

  if (includeAuth) {
    const authHeader = getAuthHeader(); // Gets latest token from storage
    if (authHeader.Authorization) {
      console.log("Using authentication token for API call");
    }
    return { ...baseHeaders, ...authHeader };
  }

  return baseHeaders;
};
```

### Flow Diagram

```
1. User logs in → Tokens stored in sessionStorage
2. Token refresh manager starts → Runs every 5 minutes
3. API call made → Uses current token from sessionStorage
4. If token expires → 401 response triggers refresh
5. New tokens received → Stored in sessionStorage
6. Subsequent API calls → Automatically use new token
```

## 📝 Usage Examples

### Example 1: Categories Service

```javascript
// src/services/categoryService.js
export const fetchCategories = async (t = null) => {
  try {
    const response = await fetchWithAuth(
      getApiUrl(API_ENDPOINTS.CATEGORIES),
      {
        method: "GET",
        headers: getApiHeaders(true), // Include auth token
      },
      t
    );

    // Check if response indicates a redirect should happen
    if (shouldRedirectToLogin(response)) {
      return response; // Return the redirect response
    }

    // Process normal response...
    if (response.status === 200) {
      const categories = await response.json();
      return { success: true, data: categories };
    }
  } catch (error) {
    // Handle network errors...
  }
};
```

### Example 2: Component Usage

```javascript
// In a React component
const loadCategories = async () => {
  const result = await fetchCategories(t);

  // Check if the result indicates a redirect should happen
  if (shouldRedirectToLogin(result)) {
    console.log(
      "Categories API returned redirect response - user will be redirected to login"
    );
    return; // The redirect will be handled by the API interceptor
  }

  if (result.success) {
    setCategories(result.data);
  } else {
    setError(result.error);
  }
};
```

## 🔄 Token Refresh Integration

The token refresh manager also uses the 401 handling system:

```javascript
// src/utils/tokenRefreshManager.js
const result = await refreshToken();

// Check if the result indicates a redirect should happen
if (shouldRedirectToLogin(result)) {
  console.log(
    "Token refresh returned redirect response - user will be redirected to login"
  );
  return; // The redirect will be handled by the API interceptor
}
```

## 🧪 Testing Token Refresh & Usage

### Debug Panel

The dashboard includes a debug panel (development only) with testing tools:

```javascript
// Test manual token refresh
const handleManualRefresh = async () => {
  await tokenRefreshManager.manualRefresh();
};

// Test API call with current token
const handleTestApiCall = async () => {
  const result = await fetchCategories(t);
  console.log("API call result:", result);
};

// Test complete token refresh flow
const handleTestTokenFlow = async () => {
  await testTokenRefreshFlow(t);
};
```

### Test Utilities

```javascript
// src/utils/tokenTest.js
export const testTokenRefreshFlow = async (t = null) => {
  // 1. Check current tokens
  // 2. Perform token refresh
  // 3. Verify new tokens are stored
  // 4. Test API call with new token
  // 5. Verify token is being used
};

export const testTokenUsage = async (t = null) => {
  // Test that current token is being used in API calls
};
```

## 🛠️ Available Utilities

### Core Functions

- **`fetchWithAuth(url, options, t)`**: Wrapper for fetch with 401 handling
- **`handleApiResponse(response, t)`**: Process response and handle 401
- **`shouldRedirectToLogin(result)`**: Check if result indicates redirect
- **`processApiResponse(response, t)`**: Process API responses with 401 handling

### Helper Functions

- **`createApiService(baseUrl, endpoint, options)`**: Create standardized API service functions
- **`testTokenRefreshFlow(t)`**: Test complete token refresh flow
- **`testTokenUsage(t)`**: Test token usage in API calls

## 🎨 Error Messages

The system supports internationalized error messages:

```javascript
// English (src/translations/en.json)
"errors.unauthorized": "You are not authorized to access this resource. Please login again."

// Vietnamese (src/translations/vi.json)
"errors.unauthorized": "Bạn không có quyền truy cập tài nguyên này. Vui lòng đăng nhập lại."
```

## 🔍 Debugging

### Console Logs

The system provides detailed console logs:

```
"Starting token refresh process..."
"Storing new tokens after successful refresh"
"New token stored successfully: Token available"
"Token refreshed successfully - new token will be used for subsequent API calls"
"Using authentication token for API call"
"API returned 401 - User unauthorized, redirecting to login"
"Token refresh manager stopped"
```

### Debug Panel

In development mode, the dashboard shows a debug panel with:

- Token refresh manager status
- Authentication status
- Token previews
- Manual refresh button
- API call testing
- Complete flow testing

## 📋 Best Practices

### 1. Always Use `fetchWithAuth` for Authenticated Endpoints

```javascript
// ✅ Good
const response = await fetchWithAuth(url, options, t);

// ❌ Bad
const response = await fetch(url, options);
```

### 2. Check for Redirect Responses

```javascript
// ✅ Good
if (shouldRedirectToLogin(result)) {
  return result;
}

// ❌ Bad
if (result.error && result.error.includes("unauthorized")) {
  // Manual handling
}
```

### 3. Handle Redirects in Components

```javascript
// ✅ Good
const result = await fetchCategories(t);
if (shouldRedirectToLogin(result)) {
  return; // Let the interceptor handle it
}

// ❌ Bad
const result = await fetchCategories(t);
if (result.shouldRedirect) {
  window.location.href = "/login"; // Manual redirect
}
```

### 4. Trust the Token System

```javascript
// ✅ Good - Let the system handle token refresh automatically
const result = await fetchCategories(t);

// ❌ Bad - Don't manually check token expiration
if (isTokenExpired()) {
  await refreshToken();
}
```

## 🚀 Migration Guide

### For Existing Services

1. **Import the interceptor**:

   ```javascript
   import {
     fetchWithAuth,
     shouldRedirectToLogin,
   } from "../utils/apiInterceptor";
   ```

2. **Replace fetch calls**:

   ```javascript
   // Before
   const response = await fetch(url, options);

   // After
   const response = await fetchWithAuth(url, options, t);
   ```

3. **Add redirect checks**:

   ```javascript
   if (shouldRedirectToLogin(response)) {
     return response;
   }
   ```

4. **Remove manual 401 handling**:
   ```javascript
   // Remove this
   if (response.status === 401) {
     // Manual 401 handling
   }
   ```

## 🔒 Security Considerations

- **Automatic token cleanup**: All tokens are cleared on 401
- **Token refresh manager stopped**: Prevents further API calls
- **Immediate redirect**: User is redirected to login immediately
- **No sensitive data exposure**: Error messages don't expose internal details
- **Automatic token refresh**: Tokens are refreshed every 5 minutes
- **Seamless token usage**: New tokens are automatically used for API calls

## 🐛 Troubleshooting

### Common Issues

1. **Redirect not happening**: Check if `fetchWithAuth` is being used
2. **Tokens not cleared**: Verify `removeTokens()` is called
3. **Token refresh still running**: Ensure `tokenRefreshManager.stop()` is called
4. **New tokens not used**: Verify `storeTokens()` is called after refresh

### Debug Steps

1. Check browser console for token refresh logs
2. Verify tokens are stored in sessionStorage
3. Test token refresh flow using debug panel
4. Check if new tokens are being used in API calls
5. Ensure all services use the interceptor

### Testing Token Flow

1. **Login to the application**
2. **Navigate to dashboard** (`/dashboard`)
3. **Use debug panel buttons**:
   - "🔄 Test Manual Refresh" - Test token refresh
   - "🧪 Test API Call" - Test current token usage
   - "🔄 Test Full Flow" - Test complete refresh flow
   - "🎯 Test Token Usage" - Test token usage verification

---

This system ensures that users are automatically redirected to login whenever their session expires, while maintaining seamless token refresh and usage for continuous authentication.
