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

const NameFilter = ({
  nameFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState("");

  // Sync localValue with nameFilter.value when filter is applied
  useEffect(() => {
    if (nameFilter.value) {
      setLocalValue(nameFilter.value);
    }
  }, [nameFilter.value]);

  // Debounced validation
  const debouncedValidation = debounce(() => {
    // This could be used for real-time validation feedback
  }, 300);

  const handleLocalValueChange = (value) => {
    setLocalValue(value);
    debouncedValidation(value);
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({ ...nameFilter, operator });
  };

  const handleApply = () => {
    if (validateFilterInput("name", localValue)) {
      onApply({ ...nameFilter, value: localValue });
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onClear();
  };

  const isApplyDisabled =
    !localValue || !validateFilterInput("name", localValue);
  const isClearDisabled = !localValue || localValue.trim() === "";

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.name")}
        filter={nameFilter}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox
          title={t("transactions.name")}
          operatorDropdown={
            <OperatorDropdown
              operators={FILTER_OPERATORS.NAME}
              selectedOperator={nameFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          }
        >
          {/* Value Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder={t(FILTER_PLACEHOLDERS.NAME)}
              value={localValue}
              onChange={(e) => handleLocalValueChange(e.target.value)}
              className={FILTER_STYLES.INPUT}
              aria-label="Name filter input"
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

export default NameFilter;
