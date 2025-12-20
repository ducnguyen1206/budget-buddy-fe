import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import FilterButton from "../shared/FilterButton";
import FilterBox from "../shared/FilterBox";
import ItemList from "../shared/ItemList";
import SelectedItemsDisplay from "../shared/SelectedItemsDisplay";
import ActionButtons from "../shared/ActionButtons";
import { validateArrayFilter } from "../utils/filterUtils";

const AccountFilter = ({
  accountFilter,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
  accounts = [],
}) => {
  const { t } = useLanguage();
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
    if (validateArrayFilter(selectedAccountIds)) {
      onApply({
        ...accountFilter,
        ids: selectedAccountIds,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  const handleClear = () => {
    setSelectedAccountIds([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const isApplyDisabled = !validateArrayFilter(selectedAccountIds);
  const isClearDisabled = !validateArrayFilter(selectedAccountIds);

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.account")}
        filter={accountFilter}
        items={accounts}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox title={t("transactions.account")}>
          {/* Account Selection */}
          <div className="mb-3">
            <ItemList
              items={accounts}
              selectedIds={selectedAccountIds}
              onItemToggle={handleAccountToggle}
              emptyMessage={t("transactions.noAccountsFound")}
              renderItem={(account) =>
                account.sourceAccountName || account.name
              }
              renderSubtitle={(account) =>
                `${account.currency} • ${account.accountType}`
              }
            />
          </div>

          {/* Selected Accounts Display */}
          <SelectedItemsDisplay
            items={accounts}
            selectedIds={selectedAccountIds}
            label={t("transactions.selectedAccounts")}
          />

          <ActionButtons
            onApply={handleApply}
            onClear={handleClear}
            isApplyDisabled={isApplyDisabled}
            isClearDisabled={isClearDisabled}
          />
        </FilterBox>
      )}
    </div>
  );
};

export default AccountFilter;
