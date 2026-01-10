import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { fetchBudgets, deleteBudget } from "../../services/budgetService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function BudgetsPage() {
  // Hooks
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("SGD");

  // Common currencies list
  const currencies = [
    { code: "", label: t("budgets.allCurrencies") },
    { code: "SGD", label: "SGD" },
    { code: "VND", label: "VND" },
  ];

  // Fetch budgets from API on component mount or when currency changes
  useEffect(() => {
    loadBudgets();
  }, [selectedCurrency]);

  // Filter budgets based on search input
  const filteredBudgets = budgets.filter((budget) =>
    budget.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals when currency is selected
  const calculateTotals = () => {
    if (!selectedCurrency || filteredBudgets.length === 0) {
      return null;
    }

    const totals = filteredBudgets.reduce(
      (acc, budget) => ({
        totalBudget: acc.totalBudget + (budget.amount || 0),
        totalSpent: acc.totalSpent + (budget.spentAmount || 0),
        totalRemaining: acc.totalRemaining + (budget.remainingAmount || 0),
      }),
      { totalBudget: 0, totalSpent: 0, totalRemaining: 0 }
    );

    return totals;
  };

  const totals = calculateTotals();

  // Load budgets from API
  const loadBudgets = async () => {
    setIsLoading(true);
    setError("");

    const result = await fetchBudgets(selectedCurrency, t);

    // Check if the result indicates a redirect should happen
    if (shouldRedirectToLogin(result)) {
      return; // The redirect will be handled by the API interceptor
    }

    if (result.success) {
      setBudgets(result.data || []);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // Handle edit budget action
  const handleEdit = (id) => {
    navigate(`/budgets/edit/${id}`);
  };

  // Handle delete budget action
  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    setError("");

    try {
      const result = await deleteBudget(deleteConfirm, t);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        // Remove from local state on successful deletion
        setBudgets((prev) =>
          prev.filter((budget) => budget.id !== deleteConfirm)
        );
        setDeleteConfirm(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Delete budget error:", error);
      setError(t("errors.deleteBudgetFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Format amount as number only (without currency symbol)
  const formatAmount = (amount) => {
    // Format with exact decimal places - preserve the exact number without rounding
    // Use high maximumFractionDigits to preserve all precision from the API
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10, // Allow up to 10 decimal places to show exact values
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    </div>
  );

  // Render error message
  const renderErrorMessage = () => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 text-base">{error}</p>
    </div>
  );

  // Render delete confirmation dialog
  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null;

    const budgetToDelete = budgets.find(
      (budget) => budget.id === deleteConfirm
    );
    if (!budgetToDelete) return null;

    // Replace the {name} placeholder with the actual category name
    const deleteWarningText = t("budgets.deleteWarning").replace(
      "{name}",
      budgetToDelete.categoryName
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("budgets.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">{deleteWarningText}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {searchTerm
          ? t("budgets.noBudgetsMatching")
          : t("budgets.noBudgetsFound")}
      </p>
    </div>
  );

  // Render budget row
  const renderBudgetRow = (budget) => (
    <tr key={budget.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">
          {budget.categoryName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">
          {formatAmount(budget.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-base font-medium ${
            budget.spentAmount < 0 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {formatAmount(budget.spentAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-base font-medium ${
            budget.remainingAmount < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatAmount(budget.remainingAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">
          {formatDate(budget.updatedAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">
          {budget.currency}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => handleEdit(budget.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={t("common.edit")}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(budget.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title={t("common.delete")}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <DashboardLayout activePage="budgets">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.budgets")}
          </h1>
        </div>

        {/* Search and New Button Row */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("budgets.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Currency Filter */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.label}
                </option>
              ))}
            </select>

            {/* New Budget Button */}
            <button
              onClick={() => navigate("/budgets/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t("budgets.new")}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && renderErrorMessage()}

        {/* Loading State */}
        {isLoading && renderLoadingState()}

        {/* Budgets Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                {/* Table Header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.category")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.budget")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.dispensed")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.remaining")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.updatedAt")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("budgets.currency")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBudgets.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        {renderEmptyState()}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredBudgets.map(renderBudgetRow)}

                      {/* Totals Row - Only show when currency is selected */}
                      {totals && (
                        <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                          <td className="px-6 py-5 whitespace-nowrap text-xl font-bold text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xl font-bold text-gray-900">
                              {formatAmount(totals.totalBudget)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-xl font-bold ${
                                totals.totalSpent < 0
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {formatAmount(totals.totalSpent)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-xl font-bold ${
                                totals.totalRemaining < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {formatAmount(totals.totalRemaining)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xl font-bold text-gray-900">
                              -
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-xl font-bold text-gray-900">
                              {selectedCurrency}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">-</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
