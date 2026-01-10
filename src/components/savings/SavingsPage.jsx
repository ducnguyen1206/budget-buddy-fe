import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { fetchSavings, deleteSaving, updateSaving } from "../../services/savingService";
import { fetchAccounts } from "../../services/accountService";
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
  const [accounts, setAccounts] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [draftValue, setDraftValue] = useState("");
  const [savingId, setSavingId] = useState(null);

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

  useEffect(() => {
    // Fetch accounts once for inline account selection
    const loadAccounts = async () => {
      const result = await fetchAccounts(t, { savingAccount: true });
      if (shouldRedirectToLogin(result)) return;
      if (result.success) {
        const flat = (result.data || []).flatMap((group) =>
          (group.accounts || []).map((account) => ({
            ...account,
            accountType: group.accountType,
          }))
        );
        setAccounts(flat);
      }
    };

    loadAccounts();
  }, [t]);

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

  const accountOptions = useMemo(() => {
    const list = Array.isArray(accounts) ? accounts : [];
    const map = new Map();
    for (const a of list) {
      if (a && a.id != null && a.name) {
        map.set(String(a.id), {
          id: String(a.id),
          name: a.accountType ? `${a.name} (${a.accountType})` : a.name,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);

  const currencyOptions = useMemo(
    () => [
      { code: "SGD", label: "SGD" },
      { code: "VND", label: "VND" },
      // include any currencies present in savings data
      ...Array.from(
        new Set((savings || []).map((s) => s.currency).filter(Boolean))
      )
        .filter((c) => c !== "SGD" && c !== "VND")
        .map((c) => ({ code: c, label: c })),
    ],
    [savings]
  );

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const beginEdit = (saving, field) => {
    if (savingId) return;
    setEditingCell({ id: saving.id, field });

    if (field === "date") {
      setDraftValue(toDateInputValue(saving.date));
    } else if (field === "amount") {
      const amountValue = Number(saving.amount);
      setDraftValue(Number.isFinite(amountValue) ? String(amountValue) : "");
    } else if (field === "name") {
      setDraftValue(saving.name || "");
    } else if (field === "notes") {
      setDraftValue(saving.notes || "");
    } else if (field === "currency") {
      setDraftValue(saving.currency || "");
    } else if (field === "accountId") {
      setDraftValue(saving.accountId ? String(saving.accountId) : "");
    } else {
      setDraftValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setDraftValue("");
    setSavingId(null);
  };

  const commitEdit = async (saving) => {
    if (!editingCell || savingId) return;

    const field = editingCell.field;
    const payload = {
      accountId: saving.accountId,
      name: saving.name,
      amount: Number.isFinite(Number(saving.amount)) ? Number(saving.amount) : 0,
      currency: saving.currency,
      notes: saving.notes || "",
      date: toDateInputValue(saving.date),
    };

    if (field === "date") {
      const nextDate = draftValue;
      const currentDate = toDateInputValue(saving.date);
      if (!nextDate || nextDate === currentDate) {
        cancelEdit();
        return;
      }
      payload.date = nextDate;
    }

    if (field === "name") {
      const nextName = (draftValue || "").trim();
      if (!nextName || nextName === (saving.name || "")) {
        cancelEdit();
        return;
      }
      payload.name = nextName;
    }

    if (field === "amount") {
      const parsed = Number(String(draftValue).replace(/,/g, ""));
      if (!Number.isFinite(parsed)) return;
      const currentAmount = Number.isFinite(Number(saving.amount))
        ? Number(saving.amount)
        : 0;
      if (parsed === currentAmount) {
        cancelEdit();
        return;
      }
      payload.amount = parsed;
    }

    if (field === "notes") {
      const nextNotes = draftValue || "";
      const currentNotes = saving.notes || "";
      if (nextNotes === currentNotes) {
        cancelEdit();
        return;
      }
      payload.notes = nextNotes;
    }

    if (field === "currency") {
      const nextCurrency = (draftValue || "").trim();
      const currentCurrency = (saving.currency || "").trim();
      if (!nextCurrency || nextCurrency === currentCurrency) {
        cancelEdit();
        return;
      }
      payload.currency = nextCurrency;
    }

    if (field === "accountId") {
      const nextAccountId = draftValue ? Number(draftValue) : null;
      if (!nextAccountId || nextAccountId === saving.accountId) {
        cancelEdit();
        return;
      }
      payload.accountId = nextAccountId;
    }

    try {
      setSavingId(saving.id);
      const result = await updateSaving(saving.id, payload, t);
      if (shouldRedirectToLogin(result)) return;
      if (result.success) {
        await loadSavings();
        cancelEdit();
      } else {
        setError(result.error || t("errors.updateSavingFailed"));
        setSavingId(null);
      }
    } catch (e) {
      console.error("Inline saving update error:", e);
      setSavingId(null);
    }
  };

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
      if (Number.isNaN(date.getTime())) return value || "";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
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
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {editingCell?.id === saving.id && editingCell?.field === "name" ? (
          <input
            autoFocus
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            className="text-left text-base font-medium text-gray-900 w-full"
            onClick={() => beginEdit(saving, "name")}
            disabled={savingId === saving.id}
          >
            {saving.name}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {editingCell?.id === saving.id && editingCell?.field === "amount" ? (
          <input
            autoFocus
            type="number"
            step="0.01"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            className={`text-base font-medium ${
              (saving.amount || 0) < 0 ? "text-red-600" : "text-green-700"
            }`}
            onClick={() => beginEdit(saving, "amount")}
            disabled={savingId === saving.id}
          >
            {formatAmount(saving.amount)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        {editingCell?.id === saving.id && editingCell?.field === "accountId" ? (
          <select
            autoFocus
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("savings.selectAccount")}</option>
            {accountOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            className="text-base font-medium text-gray-900"
            onClick={() => beginEdit(saving, "accountId")}
            disabled={savingId === saving.id}
          >
            {saving.accountName || "-"}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        {editingCell?.id === saving.id && editingCell?.field === "currency" ? (
          <select
            autoFocus
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            className="text-base font-medium text-gray-900"
            onClick={() => beginEdit(saving, "currency")}
            disabled={savingId === saving.id}
          >
            {saving.currency}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap max-w-xs hidden md:table-cell">
        {editingCell?.id === saving.id && editingCell?.field === "notes" ? (
          <input
            autoFocus
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            className="text-sm text-gray-700 truncate w-full text-left"
            title={saving.notes || ""}
            onClick={() => beginEdit(saving, "notes")}
            disabled={savingId === saving.id}
          >
            {saving.notes || "-"}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        {editingCell?.id === saving.id && editingCell?.field === "date" ? (
          <input
            autoFocus
            type="date"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => commitEdit(saving)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit(saving);
              if (e.key === "Escape") cancelEdit();
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            className="text-base font-medium text-gray-900"
            onClick={() => beginEdit(saving, "date")}
            disabled={savingId === saving.id}
          >
            {formatDate(saving.date || saving.updatedAt || saving.createdAt)}
          </button>
        )}
      </td>
      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm sm:text-base font-medium">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleEdit(saving.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
            title={t("common.edit")}
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleDelete(saving.id)}
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
    <DashboardLayout activePage="savings">
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("savings.title")}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{t("savings.new")}</span>
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
                      {t("savings.name")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.amount")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("savings.account")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {t("savings.currency")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {t("savings.notes")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("savings.date")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
