import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  fetchAccounts,
  deleteAccount,
  deleteAccountGroup,
} from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function AccountsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Effects
  useEffect(() => {
    loadAccounts();
  }, []);

  // Utility functions
  const formatCurrency = (amount, currency = "SGD") => {
    const getCurrencySymbol = (currency) => {
      const symbols = {
        USD: "$",
        SGD: "$",
        EUR: "€",
        VND: "₫",
        GBP: "£",
        JPY: "¥",
        CNY: "¥",
      };
      return symbols[currency.toUpperCase()] || `${currency} `;
    };

    const decimalPlaces = ["VND", "JPY"].includes(currency.toUpperCase())
      ? 0
      : 2;
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(amount);

    return `${getCurrencySymbol(currency)}${formattedNumber}`;
  };

  const calculateGroupBalance = (accounts) => {
    return accounts.reduce(
      (total, account) => total + (account.balance || 0),
      0
    );
  };

  const getGroupCurrency = (accounts) => {
    return accounts.length > 0 ? accounts[0].currency || "SGD" : "SGD";
  };

  // API functions
  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAccounts(t);

      if (shouldRedirectToLogin(result)) return;

      if (result.success) {
        setAccounts(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError(t("errors.fetchAccountsFailed"));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);

      // Check if it's a group deletion or individual account deletion
      const accountGroup = accounts.find(
        (group) => group.accountType === deleteConfirm
      );
      const isGroupDeletion = !!accountGroup;

      let result;
      if (isGroupDeletion) {
        // For group deletion, we need to get the group ID from the first account in the group
        const groupId = accountGroup.accounts[0]?.accountGroupId;
        if (!groupId) {
          setError(t("errors.accountGroupNotFound"));
          return;
        }
        result = await deleteAccountGroup(groupId, t);
      } else {
        result = await deleteAccount(deleteConfirm, t);
      }

      if (shouldRedirectToLogin(result)) return;

      if (result.success) {
        await loadAccounts();
        setDeleteConfirm(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      const errorKey = accounts.some(
        (group) => group.accountType === deleteConfirm
      )
        ? "deleteAccountGroupFailed"
        : "deleteAccountFailed";
      setError(t(`errors.${errorKey}`));
    } finally {
      setIsDeleting(false);
    }
  };

  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleEdit = (accountId) => {
    navigate(`/accounts/edit/${accountId}`);
  };

  const handleDelete = (accountId) => {
    setDeleteConfirm(accountId);
  };

  const cancelDelete = () => setDeleteConfirm(null);

  const toggleGroupExpansion = (accountType) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountType)) {
        newSet.delete(accountType);
      } else {
        newSet.add(accountType);
      }
      return newSet;
    });
  };

  // Computed values
  const filteredAccounts = accounts.filter((accountGroup) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      accountGroup.accountType.toLowerCase().includes(searchLower) ||
      accountGroup.accounts.some((account) =>
        account.name.toLowerCase().includes(searchLower)
      )
    );
  });

  // Render functions
  const renderExpandButton = (accountType, isExpanded, hasAccounts) => {
    if (!hasAccounts) return <div className="flex items-center w-8" />;

    return (
      <div className="flex items-center w-8">
        <button
          onClick={() => toggleGroupExpansion(accountType)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label={
            isExpanded ? t("accounts.collapseGroup") : t("accounts.expandGroup")
          }
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    );
  };

  const renderActionsButtons = (itemId, isGroup = false) => (
    <div className="flex items-center gap-3">
      {!isGroup && (
        <button
          onClick={() => handleEdit(itemId)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title={t("common.edit")}
        >
          <Edit className="h-5 w-5" />
        </button>
      )}
      <button
        onClick={() => handleDelete(itemId)}
        className="text-red-600 hover:text-red-800 transition-colors"
        title={t("common.delete")}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );

  const renderAccountRow = (account) => (
    <div
      key={account.id}
      className="flex items-center py-3 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
    >
      <div className="w-8"></div>
      <div className="flex-1 px-4 ">
        <span className="text-gray-700">{account.name}</span>
      </div>
      <div className="flex-1 px-4 text-right">
        <span
          className={account.balance < 0 ? "text-red-500" : "text-gray-700"}
        >
          {formatCurrency(account.balance, account.currency)}
        </span>
      </div>
      <div className="w-24 flex justify-center pr-8">
        {renderActionsButtons(account.id, false)}
      </div>
    </div>
  );

  const renderAccountGroup = (accountGroup) => {
    const isExpanded = expandedGroups.has(accountGroup.accountType);
    const groupBalance = calculateGroupBalance(accountGroup.accounts);
    const hasAccounts =
      accountGroup.accounts && accountGroup.accounts.length > 0;

    return (
      <div key={accountGroup.accountType} className="border-b border-gray-200">
        {/* Group Header */}
        <div className="flex items-center py-4 px-6 hover:bg-gray-50">
          {renderExpandButton(
            accountGroup.accountType,
            isExpanded,
            hasAccounts
          )}

          <div className="flex-1 px-4">
            <h3 className="text-lg font-medium text-gray-900">
              {accountGroup.accountType}
            </h3>
          </div>

          <div className="flex-1 px-4 text-right">
            <span
              className={`text-lg font-semibold ${
                groupBalance < 0 ? "text-red-500" : "text-gray-900"
              }`}
            >
              {formatCurrency(
                groupBalance,
                getGroupCurrency(accountGroup.accounts)
              )}
            </span>
          </div>

          <div className="w-24 flex justify-center">
            {renderActionsButtons(
              accountGroup.accountType,
              true // isGroup = true
            )}
          </div>
        </div>

        {/* Individual Accounts */}
        {isExpanded && hasAccounts && (
          <div>{accountGroup.accounts.map(renderAccountRow)}</div>
        )}
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null;

    // Find item to delete
    const accountGroup = accounts.find(
      (group) => group.accountType === deleteConfirm
    );
    let itemName = "";
    let isGroupDeletion = false;

    if (accountGroup) {
      itemName = accountGroup.accountType;
      isGroupDeletion = true;
    } else {
      // Find individual account
      for (const group of accounts) {
        const account = group.accounts.find((acc) => acc.id === deleteConfirm);
        if (account) {
          itemName = account.name;
          break;
        }
      }
    }

    if (!itemName) return null;

    const warningKey = isGroupDeletion
      ? "accounts.deleteGroupWarning"
      : "accounts.deleteWarning";
    const deleteWarningText = t(warningKey).replace("{name}", itemName);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("accounts.confirmDelete")}
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

  // Loading state
  if (loading) {
    return (
      <DashboardLayout activePage="accounts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout activePage="accounts">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("dashboard.nav.accounts")}
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadAccounts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main render
  return (
    <DashboardLayout activePage="accounts">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.accounts")}
          </h1>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("accounts.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={() => navigate("/accounts/new")}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t("accounts.new")}</span>
          </button>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="flex items-center py-4 px-6 bg-gray-50 border-b border-gray-200">
            <div className="w-8"></div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("accounts.name")}
              </h3>
            </div>
            <div className="flex-1 px-4 text-right">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("accounts.availableBalance")}
              </h3>
            </div>
            <div className="w-24 text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("common.actions")}
              </h3>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredAccounts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? t("accounts.noAccountsMatching")
                    : t("accounts.noAccountsFound")}
                </p>
              </div>
            ) : (
              filteredAccounts.map(renderAccountGroup)
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
