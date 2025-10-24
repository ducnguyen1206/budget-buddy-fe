import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import tokenRefreshManager from "../../utils/tokenRefreshManager";
import { getToken, getRefreshToken } from "../../utils/tokenManager";
import { refreshToken } from "../../services/authService";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [authStatus, setAuthStatus] = useState({
    hasToken: false,
    hasRefreshToken: false,
    refreshManagerRunning: false,
    lastRefresh: null,
    refreshCount: 0,
  });

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = getToken();
      const refreshTokenValue = getRefreshToken();

      setAuthStatus((prev) => ({
        ...prev,
        hasToken: !!token,
        hasRefreshToken: !!refreshTokenValue,
        refreshManagerRunning: tokenRefreshManager.isRunning(),
      }));
    };

    checkAuthStatus();

    // Listen for token refresh events
    const handleTokenRefresh = (event) => {
      setAuthStatus((prev) => ({
        ...prev,
        lastRefresh: event.detail.timestamp,
        refreshCount: prev.refreshCount + 1,
      }));
    };

    window.addEventListener("tokenRefreshed", handleTokenRefresh);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
    };
  }, []);

  const handleTestRefresh = async () => {
    console.log("🧪 Testing manual token refresh...");
    try {
      await tokenRefreshManager.manualRefresh();
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  const handleStartRefreshManager = () => {
    console.log("🚀 Starting token refresh manager...");
    tokenRefreshManager.start();
    setAuthStatus((prev) => ({
      ...prev,
      refreshManagerRunning: tokenRefreshManager.isRunning(),
    }));
  };

  const handleStopRefreshManager = () => {
    console.log("⏹️ Stopping token refresh manager...");
    tokenRefreshManager.stop();
    setAuthStatus((prev) => ({
      ...prev,
      refreshManagerRunning: false,
    }));
  };

  const handleDirectRefresh = async () => {
    console.log("🔄 Testing direct refresh token API...");
    try {
      const result = await refreshToken();
      console.log("Direct refresh result:", result);

      if (result.success) {
        setAuthStatus((prev) => ({
          ...prev,
          lastRefresh: new Date().toISOString(),
          refreshCount: prev.refreshCount + 1,
        }));
      }
    } catch (error) {
      console.error("Direct refresh failed:", error);
    }
  };

  return (
    <DashboardLayout activePage="overview">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.overview")}
          </h1>
          <p className="text-gray-600">{t("dashboard.overviewDescription")}</p>
        </div>

        {/* Authentication Status */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            🔐 Authentication Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    authStatus.hasToken ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span className="text-sm font-medium">Access Token</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {authStatus.hasToken ? "Present" : "Missing"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    authStatus.hasRefreshToken ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span className="text-sm font-medium">Refresh Token</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {authStatus.hasRefreshToken ? "Present" : "Missing"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    authStatus.refreshManagerRunning
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
                <span className="text-sm font-medium">Refresh Manager</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {authStatus.refreshManagerRunning ? "Running" : "Stopped"}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm font-medium">Refresh Count</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {authStatus.refreshCount} times
              </p>
            </div>
          </div>

          {authStatus.lastRefresh && (
            <div className="mt-4 bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">
                <strong>Last Refresh:</strong>{" "}
                {new Date(authStatus.lastRefresh).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Token Refresh Testing */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🧪 Token Refresh Testing
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleTestRefresh}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Manual Refresh
              </button>
              <button
                onClick={handleDirectRefresh}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Direct API Call
              </button>
              <button
                onClick={handleStartRefreshManager}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Start Manager
              </button>
              <button
                onClick={handleStopRefreshManager}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Stop Manager
              </button>
            </div>
          </div>

          {/* Authentication Flow */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Authentication Flow
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Login → Store Tokens</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Start Refresh Manager</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Auto Refresh (1min)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>401 Error → Redirect</span>
              </div>
            </div>
          </div>

          {/* Console Logs */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Console Logs
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Open browser console to see detailed logs:
            </p>
            <div className="bg-gray-100 rounded p-3 text-xs font-mono">
              <div className="text-green-600">✓ Token refresh successful</div>
              <div className="text-blue-600">
                ℹ Starting token refresh manager
              </div>
              <div className="text-yellow-600">
                ⚠ Token refresh already in progress
              </div>
              <div className="text-red-600">✗ Token refresh failed</div>
            </div>
          </div>
        </div>

        {/* Mock Run Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            🎯 Mock Run Instructions
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                1
              </span>
              <div>
                <strong>Login:</strong> Go to login page and authenticate with
                valid credentials
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                2
              </span>
              <div>
                <strong>Check Status:</strong> Verify tokens are present and
                refresh manager is running
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                3
              </span>
              <div>
                <strong>Test Manual Refresh:</strong> Click "Manual Refresh"
                button and check console logs
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                4
              </span>
              <div>
                <strong>Wait for Auto Refresh:</strong> Wait 1 minute to see
                automatic token refresh
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                5
              </span>
              <div>
                <strong>Test 401 Handling:</strong> Simulate expired token to
                test redirect behavior
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
