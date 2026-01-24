import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  fetchThresholds,
  updateThreshold,
  deleteThreshold,
} from "../../services/thresholdService";

export default function ThresholdsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [thresholds, setThresholds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchThresholds(t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setThresholds(result.data || []);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const filteredThresholds = useMemo(() => {
    if (!searchTerm) return thresholds;

    const lowerSearch = searchTerm.toLowerCase();
    return thresholds.filter((threshold) =>
      threshold.categoryName?.toLowerCase().includes(lowerSearch)
    );
  }, [thresholds, searchTerm]);

  const handleEdit = (id) => {
    navigate(`/thresholds/edit/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const result = await deleteThreshold(deleteConfirm, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setThresholds((prev) => prev.filter((th) => th.id !== deleteConfirm));
      setDeleteConfirm(null);
    } else {
      setError(result.error);
    }

    setIsDeleting(false);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Inline editing functions
  const beginEdit = (threshold, field) => {
    if (savingId) return;
    setEditingCell({ id: threshold.id, field });
    setDraftValue(threshold[field] ?? "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const commitEdit = async (threshold) => {
    if (!editingCell) return;

    const { field } = editingCell;
    const oldValue = threshold[field];

    if (String(draftValue) === String(oldValue)) {
      cancelEdit();
      return;
    }

    setSavingId(threshold.id);

    const updateData = {
      categoryId: threshold.categoryId,
      threshold: field === "threshold" ? (parseFloat(draftValue) || 0) : threshold.threshold,
    };

    const result = await updateThreshold(threshold.id, updateData, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      await loadThresholds();
    } else {
      setError(result.error);
    }

    setSavingId(null);
    cancelEdit();
  };

  const isCellEditing = (id, field) =>
    editingCell?.id === id && editingCell?.field === field;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

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

  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null;

    const thresholdToDelete = thresholds.find((th) => th.id === deleteConfirm);
    if (!thresholdToDelete) return null;

    const deleteWarningText = t("thresholds.deleteWarning").replace(
      "{name}",
      thresholdToDelete.categoryName
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("thresholds.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">{deleteWarningText}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderThresholdRow = (threshold) => (
    <tr key={threshold.id} className="hover:bg-gray-50">
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className="text-sm sm:text-base font-medium text-gray-900">
          {threshold.categoryName}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(threshold.id, "threshold") ? (
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={draftValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) {
                setDraftValue(val);
              }
            }}
            onBlur={() => commitEdit(threshold)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(threshold);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === threshold.id}
            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(threshold, "threshold")}
            disabled={savingId === threshold.id}
          >
            {formatAmount(threshold.threshold)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-sm sm:text-base text-gray-500">
          {threshold.currency || "SGD"}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleEdit(threshold.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
            title={t("common.edit")}
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleDelete(threshold.id)}
            className="text-red-600 hover:text-red-800 transition-colors p-1"
            title={t("common.delete")}
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <DashboardLayout activePage="thresholds">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("thresholds.title")}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("thresholds.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/thresholds/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t("thresholds.new")}</span>
            </button>
          </div>
        </div>

        {error && renderErrorMessage()}
        {isLoading && renderLoadingState()}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] sm:min-w-[400px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("thresholds.categoryName")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("thresholds.threshold")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("thresholds.currency")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredThresholds.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {searchTerm
                            ? t("thresholds.noThresholdsMatching")
                            : t("thresholds.noThresholdsFound")}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredThresholds.map(renderThresholdRow)
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
