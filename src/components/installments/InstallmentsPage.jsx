import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  fetchInstallments,
  deleteInstallment,
  updateInstallment,
} from "../../services/installmentService";

export default function InstallmentsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [installments, setInstallments] = useState([]);
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
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchInstallments(t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setInstallments(result.data || []);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const filteredInstallments = useMemo(() => {
    if (!searchTerm) return installments;

    const lowerSearch = searchTerm.toLowerCase();
    return installments.filter(
      (installment) =>
        installment.name?.toLowerCase().includes(lowerSearch) ||
        installment.accountName?.toLowerCase().includes(lowerSearch)
    );
  }, [installments, searchTerm]);

  const totals = useMemo(() => {
    return filteredInstallments.reduce(
      (acc, installment) => ({
        totalAmount: acc.totalAmount + (installment.totalAmount || 0),
        amountPaid: acc.amountPaid + (installment.amountPaid || 0),
        outstandingAmount: acc.outstandingAmount + (installment.outstandingAmount || 0),
      }),
      { totalAmount: 0, amountPaid: 0, outstandingAmount: 0 }
    );
  }, [filteredInstallments]);

  const handleEdit = (id) => {
    navigate(`/installments/edit/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const result = await deleteInstallment(deleteConfirm, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setInstallments((prev) => prev.filter((i) => i.id !== deleteConfirm));
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
  const beginEdit = (installment, field) => {
    if (savingId) return;
    setEditingCell({ id: installment.id, field });
    setDraftValue(installment[field] ?? "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const commitEdit = async (installment) => {
    if (!editingCell) return;

    const { field } = editingCell;
    const oldValue = installment[field];

    if (String(draftValue) === String(oldValue)) {
      cancelEdit();
      return;
    }

    setSavingId(installment.id);

    const updateData = {
      name: installment.name,
      totalAmount: installment.totalAmount,
      amountPaid: installment.amountPaid,
      dueDate: installment.dueDate,
      accountId: installment.accountId,
    };

    if (field === "totalAmount" || field === "amountPaid") {
      updateData[field] = parseFloat(draftValue) || 0;
    } else {
      updateData[field] = draftValue;
    }

    const result = await updateInstallment(installment.id, updateData, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      await loadInstallments();
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
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

    const installmentToDelete = installments.find((i) => i.id === deleteConfirm);
    if (!installmentToDelete) return null;

    const deleteWarningText = t("installments.deleteWarning").replace(
      "{name}",
      installmentToDelete.name
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("installments.confirmDelete")}
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

  const renderInstallmentRow = (installment) => (
    <tr key={installment.id} className="hover:bg-gray-50">
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(installment.id, "name") ? (
          <input
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(installment)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(installment);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === installment.id}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(installment, "name")}
            disabled={savingId === installment.id}
          >
            {installment.name}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(installment.id, "totalAmount") ? (
          <input
            type="number"
            step="0.01"
            min="0"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(installment)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(installment);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === installment.id}
            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(installment, "totalAmount")}
            disabled={savingId === installment.id}
          >
            {formatAmount(installment.totalAmount)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        {isCellEditing(installment.id, "amountPaid") ? (
          <input
            type="number"
            step="0.01"
            min="0"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(installment)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(installment);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === installment.id}
            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-green-600"
            onClick={() => beginEdit(installment, "amountPaid")}
            disabled={savingId === installment.id}
          >
            {formatAmount(installment.amountPaid)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span
          className={`text-sm sm:text-base font-medium ${
            installment.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatAmount(installment.outstandingAmount)}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
        {isCellEditing(installment.id, "dueDate") ? (
          <input
            type="date"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(installment)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(installment);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === installment.id}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(installment, "dueDate")}
            disabled={savingId === installment.id}
          >
            {formatDate(installment.dueDate)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-sm sm:text-base text-gray-500">
          {installment.accountName || "-"}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-sm sm:text-base text-gray-500">
          {installment.currency || "-"}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleEdit(installment.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
            title={t("common.edit")}
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleDelete(installment.id)}
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
    <DashboardLayout activePage="installments">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("installments.title")}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("installments.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/installments/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t("installments.new")}</span>
            </button>
          </div>
        </div>

        {error && renderErrorMessage()}
        {isLoading && renderLoadingState()}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] sm:min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("installments.name")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("installments.totalAmount")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("installments.amountPaid")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("installments.outstandingAmount")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t("installments.dueDate")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("installments.account")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("installments.currency")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInstallments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {searchTerm
                            ? t("installments.noInstallmentsMatching")
                            : t("installments.noInstallmentsFound")}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInstallments.map(renderInstallmentRow)
                  )}
                </tbody>
                {filteredInstallments.length > 0 && (
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-base sm:text-xl font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                        <div className="text-base sm:text-xl font-bold text-gray-900">
                          {formatAmount(totals.totalAmount)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-base sm:text-xl font-bold text-green-600">
                          {formatAmount(totals.amountPaid)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                        <div
                          className={`text-base sm:text-xl font-bold ${
                            totals.outstandingAmount > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatAmount(totals.outstandingAmount)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap hidden md:table-cell">
                        <div className="text-base sm:text-xl font-bold text-gray-900">-</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-base sm:text-xl font-bold text-gray-900">-</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-base sm:text-xl font-bold text-gray-900">-</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">-</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
