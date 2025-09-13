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
    console.log("🚫 Token refresh manager disabled - backend API not ready");
    return;

    /*
    const token = getToken();
    console.log("🚀 Token refresh manager start() called");
    console.log("🚀 Token exists:", !!token);
    console.log("🚀 Current interval:", !!this.refreshInterval);
    
    if (!token) {
      console.log("❌ Token refresh manager: No token found, cannot start");
      return;
    }

    if (this.refreshInterval) {
      console.log("⚠️ Token refresh manager: Already running, skipping start");
      return;
    }

    console.log(
      "🚀 Starting token refresh manager - refreshing every 30 seconds (testing)"
    );
    console.log("🚀 Refresh interval set to:", this.REFRESH_INTERVAL_MS, "ms");

    this.refreshInterval = setInterval(async () => {
      console.log(
        "⏰ Token refresh interval triggered at:",
        new Date().toISOString()
      );
      await this.performRefresh();
    }, this.REFRESH_INTERVAL_MS);

    console.log("✅ Token refresh manager started successfully");
    */
  }

  // Stop the token refresh interval
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log("Token refresh manager stopped");
    } else {
      console.log("Token refresh manager: Not running, nothing to stop");
    }
  }

  // Perform the actual token refresh
  async performRefresh() {
    // TODO: Uncomment when backend refresh token API is ready
    console.log("🚫 Token refresh disabled - backend API not ready");
    return;

    /*
    if (this.isRefreshing) {
      console.log("Token refresh already in progress, skipping...");
      return;
    }

    this.isRefreshing = true;
    console.log("🔄 Starting token refresh process...");

    try {
      console.log("🔄 Calling refreshToken service...");
      const result = await refreshToken();
      console.log("🔄 Refresh token result:", result);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        console.log(
          "Token refresh returned redirect response - user will be redirected to login"
        );
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        console.log("Token refreshed successfully");
      } else {
        console.error("Token refresh failed:", result.error);

        // If refresh token is invalid, stop the manager and clear tokens
        if (
          result.error.includes("Session expired") ||
          result.error.includes("invalid")
        ) {
          console.log(
            "Invalid refresh token, stopping manager and clearing tokens"
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
    */
  }

  // Manually trigger a token refresh (useful for testing)
  async manualRefresh() {
    // TODO: Uncomment when backend refresh token API is ready
    console.log("🚫 Manual token refresh disabled - backend API not ready");
    return;

    /*
    console.log("Manual token refresh triggered");
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
