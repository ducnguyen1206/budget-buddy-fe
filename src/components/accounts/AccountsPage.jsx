import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AccountsPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout activePage="accounts">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.accounts")}
          </h1>
          <p className="text-gray-600">
            Manage your bank accounts and financial institutions.
          </p>
        </div>

        {/* Accounts Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Accounts
          </h3>
          <p className="text-gray-600">
            Account management features will be implemented here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
