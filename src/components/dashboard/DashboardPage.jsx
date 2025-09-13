import DashboardLayout from "./DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import tokenRefreshManager from "../../utils/tokenRefreshManager";

export default function DashboardPage() {
  const { t } = useLanguage();

  const handleTestRefresh = () => {
    console.log("🧪 Manual refresh token test triggered");
    tokenRefreshManager.manualRefresh();
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

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("dashboard.welcome")}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {t("dashboard.tokenReady")}
            </p>
            <button
              onClick={handleTestRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🧪 Test Refresh Token
            </button>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("dashboard.quickStats")}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("dashboard.statsComingSoon")}
            </p>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("dashboard.recentActivity")}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("dashboard.activityComingSoon")}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
