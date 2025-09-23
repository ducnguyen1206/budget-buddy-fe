import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import {
  FilterButton,
  FilterBox,
  ActionButtons,
  OperatorDropdown,
  SelectedItemsDisplay,
} from "../shared";
import { FILTER_OPERATORS, FILTER_STYLES } from "../utils/filterConstants";

const CurrencyFilter = ({
  currencyFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);

  // Available currencies
  const currencies = [
    { id: "SGD", name: "SGD", label: "SGD" },
    { id: "VND", name: "VND", label: "VND" },
  ];

  // Sync local state with applied filter when opening
  useEffect(() => {
    if (showFilter) {
      setSelectedCurrencies(currencyFilter.currencies || []);
    }
  }, [showFilter, currencyFilter.currencies]);

  const handleCurrencyToggle = (currencyId) => {
    setSelectedCurrencies((prev) => {
      if (prev.includes(currencyId)) {
        return prev.filter((id) => id !== currencyId);
      } else {
        return [...prev, currencyId];
      }
    });
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({
      ...currencyFilter,
      operator,
    });
  };

  const handleApply = () => {
    if (selectedCurrencies.length > 0) {
      onApply({
        ...currencyFilter,
        currencies: selectedCurrencies,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  const handleClear = () => {
    setSelectedCurrencies([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const getDisplayValue = () => {
    if (currencyFilter.currencies.length === 0) return "";

    const operatorText = currencyFilter.operator;
    const selectedCurrencyNames = currencyFilter.currencies
      .map((id) => currencies.find((c) => c.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    return `${operatorText}: ${selectedCurrencyNames}`;
  };

  const isApplyDisabled = selectedCurrencies.length === 0;
  const isClearDisabled = selectedCurrencies.length === 0;

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.currency")}
        filter={{
          ...currencyFilter,
          displayValue: getDisplayValue(),
        }}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox
          title={t("transactions.currency")}
          operatorDropdown={
            <OperatorDropdown
              operators={FILTER_OPERATORS.TYPE}
              selectedOperator={currencyFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          }
        >
          {/* Currency Selection */}
          <div className="mb-3">
            <div className="space-y-2">
              {currencies.map((currency) => (
                <label
                  key={currency.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCurrencies.includes(currency.id)}
                    onChange={() => handleCurrencyToggle(currency.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {currency.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Currencies Display */}
          {selectedCurrencies.length > 0 && (
            <SelectedItemsDisplay
              items={currencies}
              selectedIds={selectedCurrencies}
              label={t("transactions.selectedCurrencies")}
            />
          )}

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

export default CurrencyFilter;
