import { refreshToken } from "../services/authService";
import { getToken, removeTokens } from "./tokenManager";

class TokenRefreshManager {
  constructor() {
    this.refreshInterval = null;
    this.isRefreshing = false;
    this.REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  // Start the token refresh interval
  start() {
    // Only start if user is authenticated and not already running
    if (!getToken() || this.refreshInterval) {
      return;
    }

    console.log("Starting token refresh manager - refreshing every 5 minutes");

    // Initial refresh after 5 minutes
    this.refreshInterval = setInterval(async () => {
      await this.performRefresh();
    }, this.REFRESH_INTERVAL_MS);
  }

  // Stop the token refresh interval
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log("Token refresh manager stopped");
    }
  }

  // Perform the actual token refresh
  async performRefresh() {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      console.log("Token refresh already in progress, skipping...");
      return;
    }

    this.isRefreshing = true;

    try {
      console.log("Refreshing token...");
      const result = await refreshToken();

      if (result.success) {
        console.log("Token refreshed successfully");
      } else {
        console.error("Token refresh failed:", result.error);

        // If refresh token is invalid, stop the manager and clear tokens
        if (
          result.error.includes("Session expired") ||
          result.error.includes("invalid")
        ) {
          this.stop();
          removeTokens();
          // Optionally redirect to login page
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
