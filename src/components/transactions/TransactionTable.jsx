import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import SortableHeader from "./SortableHeader";
import { Edit, Trash2 } from "lucide-react";

const TransactionTable = ({
  transactions,
  loading,
  error,
  onRetry,
  sorting,
  onSort,
  onUpdate,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  const [editingDateId, setEditingDateId] = useState(null);
  const [draftDate, setDraftDate] = useState("");
  const [savingId, setSavingId] = useState(null);

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
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const buildUpdatePayload = (transaction, newDate) => {
    const payload = {
      name: transaction.name,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      date: newDate,
      remarks: transaction.remarks || "",
      categoryType: transaction.categoryType,
      accountId: transaction.accountId,
    };

    if (transaction.categoryType === "TRANSFER") {
      payload.targetAccountId = transaction.targetAccountId;
    }

    return payload;
  };

  const beginEditDate = (transaction) => {
    if (!onUpdate) return;
    if (transaction.categoryType === "TRANSFER") return;
    setEditingDateId(transaction.id);
    setDraftDate(toDateInputValue(transaction.date));
  };

  const cancelEditDate = () => {
    setEditingDateId(null);
    setDraftDate("");
    setSavingId(null);
  };

  const commitDate = async (transaction) => {
    if (!onUpdate) return;
    if (savingId) return;

    const nextDate = draftDate;
    const currentDate = toDateInputValue(transaction.date);

    // No-op if unchanged or empty
    if (!nextDate || nextDate === currentDate) {
      cancelEditDate();
      return;
    }

    try {
      setSavingId(transaction.id);
      const result = await onUpdate(
        transaction.id,
        buildUpdatePayload(transaction, nextDate)
      );

      if (result && result.success === false) {
        // Keep the editor open so user can adjust, but don't crash.
        console.error("Inline update failed:", result);
        setSavingId(null);
        return;
      }

      cancelEditDate();
    } catch (e) {
      console.error("Inline update error:", e);
      setSavingId(null);
    }
  };

  const dateCellTitle = useMemo(() => {
    if (!onUpdate) return undefined;
    return t("common.edit");
  }, [onUpdate, t]);

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
            <SortableHeader
              column="amount"
              sorting={sorting?.amount}
              onSort={onSort}
            >
              {t("transactions.amount")}
            </SortableHeader>
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("transactions.currency")}
            </th>
            <SortableHeader
              column="date"
              sorting={sorting?.date}
              onSort={onSort}
            >
              {t("transactions.date")}
            </SortableHeader>
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
            <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t("common.actions")}
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
                {editingDateId === transaction.id ? (
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    onBlur={() => void commitDate(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitDate(transaction);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEditDate();
                      }
                    }}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={savingId === transaction.id}
                    className="w-[9.5rem] px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.date")}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEditDate(transaction)}
                    disabled={!onUpdate || transaction.categoryType === "TRANSFER"}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !onUpdate || transaction.categoryType === "TRANSFER"
                        ? "cursor-default"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {formatDate(transaction.date)}
                  </button>
                )}
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
              <td className="px-6 py-4 whitespace-nowrap text-base">
                <div className="flex items-center gap-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(transaction)}
                      disabled={transaction.categoryType === "TRANSFER"}
                      className={`transition-colors ${
                        transaction.categoryType === "TRANSFER"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                      title={
                        transaction.categoryType === "TRANSFER"
                          ? t("transactions.transferCannotBeEdited")
                          : t("common.edit")
                      }
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction)}
                      disabled={transaction.categoryType === "TRANSFER"}
                      className={`transition-colors ${
                        transaction.categoryType === "TRANSFER"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-600 hover:text-red-800"
                      }`}
                      title={
                        transaction.categoryType === "TRANSFER"
                          ? t("transactions.transferCannotBeDeleted")
                          : t("common.delete")
                      }
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
