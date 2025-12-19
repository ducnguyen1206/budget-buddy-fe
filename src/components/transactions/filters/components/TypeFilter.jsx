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
import { validateArrayFilter } from "../utils/filterUtils";

const TypeFilter = ({
  typeFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Available transaction types
  const transactionTypes = [
    { id: "EXPENSE", name: t("transactions.expense") },
    { id: "INCOME", name: t("transactions.income") },
    { id: "TRANSFER", name: t("transactions.transfer") },
  ];

  // Sync local state with applied filter when opening
  useEffect(() => {
    if (showFilter) {
      setSelectedTypes(typeFilter.types || []);
    }
  }, [showFilter, typeFilter.types]);

  const handleTypeToggle = (typeId) => {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((id) => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({
      ...typeFilter,
      operator,
    });
  };

  const handleApply = () => {
    if (validateArrayFilter(selectedTypes)) {
      onApply({
        ...typeFilter,
        types: selectedTypes,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  const handleClear = () => {
    setSelectedTypes([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const getDisplayValue = () => {
    if (typeFilter.types && typeFilter.types.length > 0) {
      const selectedTypeNames = typeFilter.types
        .map((typeId) => {
          const type = transactionTypes.find((t) => t.id === typeId);
          return type ? type.name : typeId;
        })
        .join(", ");

      return `${typeFilter.operator}: ${selectedTypeNames}`;
    }
    return null;
  };

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.type")}
        filter={{
          ...typeFilter,
          displayValue: getDisplayValue(),
        }}
        onClick={onToggleFilter}
        items={transactionTypes}
      />

      {showFilter && (
        <FilterBox
          title={t("transactions.type")}
          operatorDropdown={
            <OperatorDropdown
              operators={FILTER_OPERATORS.TYPE}
              selectedOperator={typeFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          }
        >
          {/* Type Selection */}
          <div className="mb-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {transactionTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Types Display */}
          <SelectedItemsDisplay
            items={transactionTypes}
            selectedIds={selectedTypes}
            label={t("transactions.selectedTypes")}
          />

          {/* Action Buttons */}
          <ActionButtons
            onApply={handleApply}
            onClear={handleClear}
            isApplyDisabled={selectedTypes.length === 0}
            isClearDisabled={selectedTypes.length === 0}
          />
        </FilterBox>
      )}
    </div>
  );
};

export default TypeFilter;
