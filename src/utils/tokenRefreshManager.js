import { refreshToken } from "../services/authService";
import { getToken, removeTokens } from "./tokenManager";
import { shouldRedirectToLogin } from "./apiInterceptor";

class TokenRefreshManager {
  constructor() {
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.REFRESH_INTERVAL_MS = 30 * 1000; // 30 seconds for testing (normally 5 minutes)
  }

  // Start the token refresh interval
  start() {
    // TODO: Uncomment when backend refresh token API is ready
    return;

    /*
    const token = getToken();
    
    if (!token) {
      return;
    }

    if (this.refreshInterval) {
      return;
    }

    this.refreshInterval = setInterval(async () => {
      await this.performRefresh();
    }, this.REFRESH_INTERVAL_MS);
    */
  }

  // Stop the token refresh interval
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Perform the actual token refresh
  async performRefresh() {
    // TODO: Uncomment when backend refresh token API is ready
    return;

    /*
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
      const result = await refreshToken();

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
      } else {
        console.error("Token refresh failed:", result.error);

        // If refresh token is invalid, stop the manager and clear tokens
        if (
          result.error.includes("Session expired") ||
          result.error.includes("invalid")
        ) {
          this.stop();
          removeTokens();
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    } finally {
      this.isRefreshing = false;
    }
    */
  }

  // Manually trigger a token refresh (useful for testing)
  async manualRefresh() {
    // TODO: Uncomment when backend refresh token API is ready
    return;

    /*
    await this.performRefresh();
    */
  }

  // Check if the manager is currently running
  isRunning() {
    return !!this.refreshInterval;
  }
}

// Create a singleton instance
const tokenRefreshManager = new TokenRefreshManager();

export default tokenRefreshManager;
