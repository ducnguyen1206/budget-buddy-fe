import React, { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const AccountFilter = ({
  accountFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
  accounts = [],
}) => {
  const { t } = useLanguage();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  // Sync local state with applied filter when opening the filter
  useEffect(() => {
    if (showFilter && accountFilter.ids && Array.isArray(accountFilter.ids)) {
      setSelectedAccountIds(accountFilter.ids);
    }
  }, [showFilter, accountFilter.ids]);

  const handleAccountToggle = (accountId) => {
    setSelectedAccountIds((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((id) => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleApply = () => {
    if (selectedAccountIds.length > 0) {
      onApply({
        ...accountFilter,
        ids: selectedAccountIds,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  // Handle filter toggle with proper state management
  const handleToggleFilter = () => {
    onToggleFilter();
  };

  const handleClear = () => {
    setSelectedAccountIds([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const getDisplayValue = () => {
    if (accountFilter.ids && accountFilter.ids.length > 0) {
      const selectedAccounts = accounts.filter((account) =>
        accountFilter.ids.includes(account.id)
      );
      if (selectedAccounts.length === 1) {
        return selectedAccounts[0].name;
      } else if (selectedAccounts.length > 1) {
        return `${selectedAccounts.length} accounts`;
      }
    }
    return "";
  };

  const getSelectedAccountNames = () => {
    if (selectedAccountIds.length > 0) {
      return accounts
        .filter(
          (account) => account.id && selectedAccountIds.includes(account.id)
        )
        .map((account) => ({
          id: account.id || `temp-${Math.random()}`,
          name: account.name || "Unknown Account",
        }));
    }
    return [];
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={handleToggleFilter}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-xl hover:bg-gray-50 transition-colors ${
          accountFilter.ids && accountFilter.ids.length > 0
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        <span>{t("transactions.account")}</span>
        {accountFilter.ids && accountFilter.ids.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {getDisplayValue()}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Filter Box */}
      {showFilter && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">
              {t("transactions.account")}
            </span>
          </div>

          {/* Account Selection */}
          <div className="mb-3">
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {accounts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {t("transactions.noAccountsFound")}
                </div>
              ) : (
                accounts
                  .filter((account) => account.id) // Only show accounts with valid IDs
                  .map((account, index) => (
                    <div
                      key={account.id}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAccountToggle(account.id)}
                    >
                      <div className="flex-shrink-0">
                        {selectedAccountIds.includes(account.id) ? (
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {account.sourceAccountName || account.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.currency} • {account.accountType}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Selected Accounts Display */}
          {selectedAccountIds.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-2">
                {t("transactions.selectedAccounts")}:
              </div>
              <div className="flex flex-wrap gap-1">
                {getSelectedAccountNames().map((account, index) => (
                  <span
                    key={`selected-account-${account.id || "unknown"}-${index}`}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {account.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApply}
              disabled={selectedAccountIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              disabled={selectedAccountIds.length === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountFilter;
