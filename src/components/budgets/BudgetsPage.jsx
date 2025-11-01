import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { fetchBudgets, deleteBudget } from "../../services/budgetService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function BudgetsPage() {
  // Hooks
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownPositions, setDropdownPositions] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch budgets from API on component mount
  useEffect(() => {
    loadBudgets();

    // Cleanup function to reset dropdown state when component unmounts
    return () => {
      setDropdownPositions({});
      setOpenDropdown(null);
    };
  }, []);

  // Filter budgets based on search input
  const filteredBudgets = budgets.filter((budget) =>
    budget.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load budgets from API
  const loadBudgets = async () => {
    setIsLoading(true);
    setError("");

    const result = await fetchBudgets(t);

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

  // Handle dropdown toggle with smart positioning
  const handleDropdownToggle = (id, event) => {
    // Close dropdown if it's already open for this item
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }

    // Calculate exact position for the dropdown
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Position dropdown above the button to ensure visibility
    setDropdownPositions((prev) => ({
      ...prev,
      [id]: {
        position: "fixed",
        top: `${buttonRect.top - 80}px`, // 80px above the button
        left: `${buttonRect.right - 192}px`, // Align to right edge (192px = w-48)
        zIndex: 50,
      },
    }));

    setOpenDropdown(id);
  };

  // Handle edit budget action
  const handleEdit = (id) => {
    navigate(`/budgets/edit/${id}`);
    setOpenDropdown(null);
  };

  // Handle delete budget action
  const handleDelete = (id) => {
    setDeleteConfirm(id);
    setOpenDropdown(null);
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
      <p className="text-red-600 text-sm">{error}</p>
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
        <div className="text-sm font-medium text-gray-900">
          {budget.categoryName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatAmount(budget.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatAmount(budget.spentAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-sm font-medium ${
            budget.remainingAmount < 0 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {formatAmount(budget.remainingAmount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatDate(budget.updatedAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {budget.currency}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative dropdown-container">
          {/* Three dots button */}
          <button
            onClick={(e) => handleDropdownToggle(budget.id, e)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {openDropdown === budget.id && (
            <div
              className="w-48 bg-white rounded-md shadow-xl border border-gray-200"
              style={dropdownPositions[budget.id]}
            >
              <div className="py-1">
                <button
                  onClick={() => handleEdit(budget.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  {t("common.delete")}
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <DashboardLayout activePage="budgets">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.budgets")}
          </h1>
        </div>

        {/* Search and New Button Row */}
        <div className="flex justify-between items-center mb-6">
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

          {/* New Budget Button */}
          <button
            onClick={() => navigate("/budgets/new")}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t("budgets.new")}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && renderErrorMessage()}

        {/* Loading State */}
        {isLoading && renderLoadingState()}

        {/* Budgets Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* Actions column header */}
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
                    filteredBudgets.map(renderBudgetRow)
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
