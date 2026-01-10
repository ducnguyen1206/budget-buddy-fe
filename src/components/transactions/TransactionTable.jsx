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
  categories,
  accounts,
  onEdit,
  onDelete,
}) => {
  const { t } = useLanguage();

  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [draftValue, setDraftValue] = useState("");
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
      // Align with TransactionForm: backend typically expects a positive amount + categoryType
      amount: Math.abs(Number(transaction.amount) || 0),
      categoryId: transaction.categoryId,
      date: newDate,
      remarks: transaction.remarks || "",
      categoryType: transaction.categoryType,
      accountId: transaction.accountId,
      currency: transaction.currency,
    };

    if (transaction.categoryType === "TRANSFER") {
      payload.targetAccountId = transaction.targetAccountId;
    }

    return payload;
  };

  const isCellEditing = (transactionId, field) =>
    editingCell?.id === transactionId && editingCell?.field === field;

  const beginEdit = (transaction, field) => {
    if (!onUpdate) return;
    // Match existing behavior: TRANSFER rows are not editable.
    if (transaction.categoryType === "TRANSFER") return;
    if (savingId) return;

    setEditingCell({ id: transaction.id, field });

    if (field === "date") {
      setDraftValue(toDateInputValue(transaction.date));
    } else if (field === "amount") {
      setDraftValue(String(Math.abs(Number(transaction.amount) || 0)));
    } else if (field === "remarks") {
      setDraftValue(transaction.remarks || "");
    } else if (field === "name") {
      setDraftValue(transaction.name || "");
    } else if (field === "currency") {
      setDraftValue(transaction.currency || "");
    } else if (field === "categoryId") {
      setDraftValue(transaction.categoryId ? String(transaction.categoryId) : "");
    } else if (field === "accountId") {
      setDraftValue(transaction.accountId ? String(transaction.accountId) : "");
    } else if (field === "categoryType") {
      setDraftValue(transaction.categoryType || "");
    } else {
      setDraftValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
    setSavingId(null);
  };

  const commitEdit = async (transaction) => {
    if (!onUpdate) return;
    if (!editingCell) return;
    if (savingId) return;

    const field = editingCell.field;

    // Build a complete payload like TransactionForm does, then override the edited field.
    const baseDate = toDateInputValue(transaction.date);
    const payload = buildUpdatePayload(transaction, baseDate);

    // Apply the edited value
    if (field === "date") {
      const nextDate = draftValue;
      const currentDate = baseDate;
      if (!nextDate || nextDate === currentDate) {
        cancelEdit();
        return;
      }
      payload.date = nextDate;
    }

    if (field === "name") {
      const nextName = (draftValue || "").trim();
      if (!nextName || nextName === (transaction.name || "")) {
        cancelEdit();
        return;
      }
      payload.name = nextName;
    }

    if (field === "amount") {
      const parsed = Number(String(draftValue).replace(/,/g, ""));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return; // keep editor open
      }
      const currentAbs = Math.abs(Number(transaction.amount) || 0);
      if (parsed === currentAbs) {
        cancelEdit();
        return;
      }
      payload.amount = parsed;
    }

    if (field === "remarks") {
      const nextRemarks = draftValue || "";
      const currentRemarks = transaction.remarks || "";
      if (nextRemarks === currentRemarks) {
        cancelEdit();
        return;
      }
      payload.remarks = nextRemarks;
    }

    if (field === "currency") {
      const nextCurrency = (draftValue || "").trim();
      const currentCurrency = (transaction.currency || "").trim();
      if (!nextCurrency || nextCurrency === currentCurrency) {
        cancelEdit();
        return;
      }
      payload.currency = nextCurrency;
    }

    if (field === "categoryId") {
      const nextCategoryId = draftValue ? Number(draftValue) : null;
      if (!nextCategoryId || nextCategoryId === transaction.categoryId) {
        cancelEdit();
        return;
      }
      payload.categoryId = nextCategoryId;
    }

    if (field === "accountId") {
      const nextAccountId = draftValue ? Number(draftValue) : null;
      if (!nextAccountId || nextAccountId === transaction.accountId) {
        cancelEdit();
        return;
      }
      payload.accountId = nextAccountId;
    }

    if (field === "categoryType") {
      const nextType = draftValue;
      const currentType = transaction.categoryType;
      if (!nextType || nextType === currentType) {
        cancelEdit();
        return;
      }
      payload.categoryType = nextType;
    }

    try {
      setSavingId(transaction.id);
      const result = await onUpdate(transaction.id, payload);

      if (result && result.success === false) {
        console.error("Inline update failed:", result);
        setSavingId(null);
        return;
      }

      cancelEdit();
    } catch (e) {
      console.error("Inline update error:", e);
      setSavingId(null);
    }
  };

  const dateCellTitle = useMemo(() => {
    if (!onUpdate) return undefined;
    return t("common.edit");
  }, [onUpdate, t]);

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const map = new Map();
    for (const c of list) {
      if (c && c.id != null && c.name) {
        map.set(String(c.id), { id: String(c.id), name: c.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const accountOptions = useMemo(() => {
    const list = Array.isArray(accounts) ? accounts : [];
    const map = new Map();
    for (const a of list) {
      if (a && a.id != null && a.name) {
        map.set(String(a.id), { id: String(a.id), name: a.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);

  const currencyOptions = useMemo(() => {
    const set = new Set(["SGD", "VND"]);
    for (const tx of transactions) {
      if (tx.currency) set.add(tx.currency);
    }
    return Array.from(set).sort();
  }, [transactions]);

  const typeOptions = useMemo(() => ["INCOME", "EXPENSE"], []);

  const isInlineEditable = (transaction) =>
    !!onUpdate && transaction.categoryType !== "TRANSFER";

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
                {isCellEditing(transaction.id, "name") ? (
                  <input
                    type="text"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitEdit(transaction);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.name")}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "name")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default text-gray-900"
                        : "text-gray-900 hover:text-gray-700"
                    }
                  >
                    {transaction.name}
                  </button>
                )}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-base font-medium ${getAmountColor(
                  transaction.amount
                )}`}
              >
                {isCellEditing(transaction.id, "amount") ? (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitEdit(transaction);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-[8.5rem] px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    aria-label={t("transactions.amount")}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "amount")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default"
                        : "hover:opacity-90"
                    }
                  >
                    {formatAmount(transaction.amount)}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {isCellEditing(transaction.id, "currency") ? (
                  <select
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-[7rem] px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.currency")}
                    autoFocus
                  >
                    {currencyOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "currency")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default text-gray-500"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {transaction.currency}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {isCellEditing(transaction.id, "date") ? (
                  <input
                    type="date"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitEdit(transaction);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
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
                    onClick={() => beginEdit(transaction, "date")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {formatDate(transaction.date)}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {isCellEditing(transaction.id, "categoryId") ? (
                  <select
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.category")}
                    autoFocus
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "categoryId")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default text-gray-500"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {transaction.categoryName}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {isCellEditing(transaction.id, "accountId") ? (
                  <select
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.account")}
                    autoFocus
                  >
                    {accountOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "accountId")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default text-gray-500"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {transaction.sourceAccountName}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isCellEditing(transaction.id, "categoryType") ? (
                  <select
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.type")}
                    autoFocus
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type === "INCOME"
                          ? t("transactions.income")
                          : t("transactions.expense")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "categoryType")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className="text-left"
                  >
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
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                {isCellEditing(transaction.id, "remarks") ? (
                  <input
                    type="text"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onBlur={() => void commitEdit(transaction)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitEdit(transaction);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    disabled={savingId === transaction.id}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={t("transactions.remarks")}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => beginEdit(transaction, "remarks")}
                    disabled={!isInlineEditable(transaction)}
                    title={
                      transaction.categoryType === "TRANSFER"
                        ? t("transactions.transferCannotBeEdited")
                        : dateCellTitle
                    }
                    className={
                      !isInlineEditable(transaction)
                        ? "cursor-default text-gray-500"
                        : "text-gray-500 hover:text-gray-700"
                    }
                  >
                    {transaction.remarks || "-"}
                  </button>
                )}
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
