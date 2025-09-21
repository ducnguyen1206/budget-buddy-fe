import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const TransactionTable = ({ transactions, loading, error, onRetry }) => {
  const { t } = useLanguage();
  const formatAmount = (amount) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  const getAmountColor = (amount) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {t("transactions.noTransactionsFound")}
        </div>
        <div className="text-sm text-gray-400">
          {t("transactions.noTransactionsMatching")}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.name")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.amount")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.currency")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.date")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.category")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.account")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.type")}
            </th>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.remarks")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                {transaction.name}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-base font-medium ${getAmountColor(
                  transaction.amount
                )}`}
              >
                {formatAmount(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {transaction.currency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {transaction.categoryName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {transaction.sourceAccountName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                    transaction.categoryType === "INCOME"
                      ? "bg-green-100 text-green-800"
                      : transaction.categoryType === "EXPENSE"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {transaction.categoryType === "INCOME"
                    ? t("transactions.income")
                    : transaction.categoryType === "EXPENSE"
                    ? t("transactions.expense")
                    : t("transactions.transfer")}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {transaction.remarks || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
