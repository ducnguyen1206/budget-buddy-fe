import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";

export default function BudgetsPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout activePage="budgets">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.budgets")}
          </h1>
          <p className="text-gray-600">
            Create and manage your spending budgets.
          </p>
        </div>

        {/* Budgets Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Budgets
          </h3>
          <p className="text-gray-600">
            Budget creation and tracking features will be implemented here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
