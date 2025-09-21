import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import FilterButton from "../shared/FilterButton";
import FilterBox from "../shared/FilterBox";
import OperatorDropdown from "../shared/OperatorDropdown";
import ActionButtons from "../shared/ActionButtons";
import {
  FILTER_OPERATORS,
  FILTER_STYLES,
  FILTER_PLACEHOLDERS,
} from "../utils/filterConstants";
import { validateFilterInput, debounce } from "../utils/filterUtils";

const AmountFilter = ({
  amountFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState("");

  // Sync localValue with amountFilter.value when filter is applied
  useEffect(() => {
    if (
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined
    ) {
      setLocalValue(amountFilter.value.toString());
    }
  }, [amountFilter.value]);

  // Debounced validation
  const debouncedValidation = debounce((value) => {
    // This could be used for real-time validation feedback
  }, 300);

  const handleLocalValueChange = (value) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLocalValue(value);
      debouncedValidation(value);
    }
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({ ...amountFilter, operator });
  };

  const handleApply = () => {
    const numericValue = parseFloat(localValue);
    if (!isNaN(numericValue) && validateFilterInput("amount", localValue)) {
      onApply({ ...amountFilter, value: numericValue });
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onClear();
  };

  const isApplyDisabled =
    !localValue ||
    isNaN(parseFloat(localValue)) ||
    !validateFilterInput("amount", localValue);
  const isClearDisabled = !localValue || localValue.trim() === "";

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.amount")}
        filter={amountFilter}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox title={t("transactions.amount")}>
          {/* Header with Amount and Operator */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-700 font-medium">
              {t("transactions.amount")}
            </span>
            <OperatorDropdown
              operators={FILTER_OPERATORS.AMOUNT}
              selectedOperator={amountFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          </div>

          {/* Value Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder={t(FILTER_PLACEHOLDERS.AMOUNT)}
              value={localValue}
              onChange={(e) => handleLocalValueChange(e.target.value)}
              className={FILTER_STYLES.INPUT}
              aria-label="Amount filter input"
            />
          </div>

          <ActionButtons
            onApply={handleApply}
            onClear={handleClear}
            onClose={onToggleFilter}
            isApplyDisabled={isApplyDisabled}
            isClearDisabled={isClearDisabled}
            showCloseButton={!!localValue}
          />
        </FilterBox>
      )}
    </div>
  );
};

export default AmountFilter;
