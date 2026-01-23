import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  fetchSubscriptions,
  deleteSubscription,
  updateSubscription,
} from "../../services/subscriptionService";

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState([]);
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
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchSubscriptions(t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setSubscriptions(result.data || []);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm) return subscriptions;

    const lowerSearch = searchTerm.toLowerCase();
    return subscriptions.filter(
      (subscription) =>
        subscription.name?.toLowerCase().includes(lowerSearch) ||
        subscription.accountName?.toLowerCase().includes(lowerSearch)
    );
  }, [subscriptions, searchTerm]);

  const totalAmount = useMemo(() => {
    return filteredSubscriptions.reduce(
      (acc, subscription) => acc + (subscription.amount || 0),
      0
    );
  }, [filteredSubscriptions]);

  const handleEdit = (id) => {
    navigate(`/subscriptions/edit/${id}`);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const result = await deleteSubscription(deleteConfirm, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== deleteConfirm));
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
  const beginEdit = (subscription, field) => {
    if (savingId) return;
    setEditingCell({ id: subscription.id, field });
    setDraftValue(subscription[field] ?? "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const commitEdit = async (subscription) => {
    if (!editingCell) return;

    const { field } = editingCell;
    const oldValue = subscription[field];

    if (String(draftValue) === String(oldValue)) {
      cancelEdit();
      return;
    }

    setSavingId(subscription.id);

    const updateData = {
      name: subscription.name,
      amount: subscription.amount,
      payDay: subscription.payDay,
      accountId: subscription.accountId,
    };

    if (field === "amount" || field === "payDay") {
      updateData[field] = parseFloat(draftValue) || 0;
    } else {
      updateData[field] = draftValue;
    }

    const result = await updateSubscription(subscription.id, updateData, t);

    if (result.redirectToLogin) {
      navigate("/login");
      return;
    }

    if (result.success) {
      await loadSubscriptions();
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

    const subscriptionToDelete = subscriptions.find((s) => s.id === deleteConfirm);
    if (!subscriptionToDelete) return null;

    const deleteWarningText = t("subscriptions.deleteWarning").replace(
      "{name}",
      subscriptionToDelete.name
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("subscriptions.confirmDelete")}
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

  const renderSubscriptionRow = (subscription) => (
    <tr key={subscription.id} className="hover:bg-gray-50">
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(subscription.id, "name") ? (
          <input
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(subscription)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(subscription);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === subscription.id}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(subscription, "name")}
            disabled={savingId === subscription.id}
          >
            {subscription.name}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(subscription.id, "amount") ? (
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
            onBlur={() => commitEdit(subscription)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(subscription);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === subscription.id}
            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(subscription, "amount")}
            disabled={savingId === subscription.id}
          >
            {formatAmount(subscription.amount)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {isCellEditing(subscription.id, "payDay") ? (
          <input
            type="number"
            min="1"
            max="31"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(subscription)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit(subscription);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            disabled={savingId === subscription.id}
            className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="text-sm sm:text-base font-medium text-gray-900"
            onClick={() => beginEdit(subscription, "payDay")}
            disabled={savingId === subscription.id}
          >
            {subscription.payDay || "-"}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-sm sm:text-base text-gray-500">
          {subscription.accountName || "-"}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        <span className="text-sm sm:text-base text-gray-500">
          {subscription.currency || "-"}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleEdit(subscription.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
            title={t("common.edit")}
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleDelete(subscription.id)}
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
    <DashboardLayout activePage="subscriptions">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("subscriptions.title")}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("subscriptions.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/subscriptions/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t("subscriptions.new")}</span>
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
                      {t("subscriptions.name")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("subscriptions.amount")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("subscriptions.payDay")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("subscriptions.account")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("subscriptions.currency")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {searchTerm
                            ? t("subscriptions.noSubscriptionsMatching")
                            : t("subscriptions.noSubscriptionsFound")}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map(renderSubscriptionRow)
                  )}
                </tbody>
                {filteredSubscriptions.length > 0 && (
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-base sm:text-xl font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                        <div className="text-base sm:text-xl font-bold text-gray-900">
                          {formatAmount(totalAmount)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
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
