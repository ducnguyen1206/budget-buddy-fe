import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TransactionsPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout activePage="transactions">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.transactions")}
          </h1>
          <p className="text-gray-600">
            View and manage your financial transactions.
          </p>
        </div>

        {/* Transactions Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <p className="text-gray-600">
            Transaction history and management features will be implemented
            here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
