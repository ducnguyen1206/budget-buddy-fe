import { refreshToken } from "../services/authService";
import { getToken, removeTokens } from "./tokenManager";
import { shouldRedirectToLogin } from "./apiInterceptor";

class TokenRefreshManager {
  constructor() {
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.REFRESH_INTERVAL_MS = 60 * 1000; // 1 minute
  }

  // Start the token refresh interval
  start() {
    const token = getToken();

    if (!token) {
      console.log("No token available, skipping refresh manager start");
      return;
    }

    if (this.refreshInterval) {
      console.log("Token refresh manager already running");
      return;
    }

    console.log(
      "Starting token refresh manager with interval:",
      this.REFRESH_INTERVAL_MS
    );
    this.refreshInterval = setInterval(async () => {
      await this.performRefresh();
    }, this.REFRESH_INTERVAL_MS);
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
    if (this.isRefreshing) {
      console.log("Token refresh already in progress, skipping");
      return;
    }

    this.isRefreshing = true;
    console.log("Performing token refresh...");

    try {
      const result = await refreshToken();

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        console.log("Token refresh failed, redirecting to login");
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        console.log("Token refresh successful");
        // Dispatch event to notify components
        window.dispatchEvent(
          new CustomEvent("tokenRefreshed", {
            detail: { success: true, timestamp: new Date().toISOString() },
          })
        );
      } else {
        console.error("Token refresh failed:", result.error);

        // If refresh token is invalid, stop the manager and clear tokens
        if (
          result.error.includes("Session expired") ||
          result.error.includes("invalid") ||
          result.error.includes("expired")
        ) {
          console.log(
            "Refresh token invalid, stopping manager and redirecting"
          );
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
  }

  // Manually trigger a token refresh (useful for testing)
  async manualRefresh() {
    console.log("Manual token refresh triggered");
    await this.performRefresh();
  }

  // Check if the manager is currently running
  isRunning() {
    return !!this.refreshInterval;
  }
}

// Create a singleton instance
const tokenRefreshManager = new TokenRefreshManager();

export default tokenRefreshManager;
