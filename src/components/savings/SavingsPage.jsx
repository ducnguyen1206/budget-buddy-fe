import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { fetchSavings, deleteSaving } from "../../services/savingService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function SavingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [savings, setSavings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("SGD");

  const currencies = useMemo(
    () => [
      { code: "", label: t("savings.allCurrencies") },
      { code: "SGD", label: "SGD" },
      { code: "VND", label: "VND" },
    ],
    [t]
  );

  useEffect(() => {
    loadSavings();
  }, [selectedCurrency]);

  const loadSavings = async () => {
    setIsLoading(true);
    setError("");

    const result = await fetchSavings(selectedCurrency, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      setSavings(result.data || []);
    } else {
      setError(result.error || t("errors.fetchSavingsFailed"));
    }

    setIsLoading(false);
  };

  const filteredSavings = savings.filter((saving) => {
    const term = searchTerm.toLowerCase();
    const name = (saving.name || "").toLowerCase();
    const account = (saving.accountName || "").toLowerCase();
    return name.includes(term) || account.includes(term);
  });

  const totalAmount = useMemo(() => {
    if (!selectedCurrency) return null;
    return filteredSavings.reduce(
      (acc, saving) => acc + (saving.amount || 0),
      0
    );
  }, [filteredSavings, selectedCurrency]);

  const handleEdit = (id) => {
    navigate(`/savings/edit/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    setError("");

    const result = await deleteSaving(deleteConfirm, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      setSavings((prev) => prev.filter((saving) => saving.id !== deleteConfirm));
      setDeleteConfirm(null);
    } else {
      setError(result.error || t("errors.deleteSavingFailed"));
    }

    setIsDeleting(false);
  };

  const cancelDelete = () => setDeleteConfirm(null);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).format(amount ?? 0);

  const formatDate = (value) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return value || "";
    }
  };

  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null;
    const saving = savings.find((item) => item.id === deleteConfirm);
    if (!saving) return null;

    const message = t("savings.deleteWarning").replace("{name}", saving.name || "");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("savings.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
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

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {searchTerm ? t("savings.noSavingsMatching") : t("savings.noSavingsFound")}
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    </div>
  );

  const renderErrorMessage = () => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 text-base">{error}</p>
    </div>
  );

  const renderSavingRow = (saving) => (
    <tr key={saving.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">{saving.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className={`text-base font-medium ${
            (saving.amount || 0) < 0 ? "text-red-600" : "text-green-700"
          }`}
        >
          {formatAmount(saving.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">{saving.accountName || "-"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">{saving.currency}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap max-w-xs">
        <div className="text-sm text-gray-700 truncate" title={saving.notes || ""}>
          {saving.notes || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-base font-medium text-gray-900">{formatDate(saving.updatedAt || saving.createdAt)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => handleEdit(saving.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={t("common.edit")}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(saving.id)}
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
    <DashboardLayout activePage="savings">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("savings.title")}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("savings.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
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

            <button
              onClick={() => navigate("/savings/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t("savings.new")}</span>
            </button>
          </div>
        </div>

        {error && renderErrorMessage()}
        {isLoading && renderLoadingState()}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.amount")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.account")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.currency")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.notes")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.updatedAt")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSavings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        {renderEmptyState()}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredSavings.map(renderSavingRow)}
                      {totalAmount !== null && (
                        <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                          <td className="px-6 py-5 whitespace-nowrap text-base font-bold text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div
                              className={`text-base font-bold ${
                                totalAmount < 0 ? "text-red-600" : "text-green-700"
                              }`}
                            >
                              {formatAmount(totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-base font-medium text-gray-900">{selectedCurrency}</div>
                          </td>
                          <td colSpan="4"></td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
