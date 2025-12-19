import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import {
  FilterButton,
  FilterBox,
  ActionButtons,
  OperatorDropdown,
} from "../shared";
import {
  FILTER_OPERATORS,
  FILTER_STYLES,
  FILTER_PLACEHOLDERS,
} from "../utils/filterConstants";
import { validateFilterInput, debounce } from "../utils/filterUtils";

const RemarksFilter = ({
  remarksFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Sync local state with applied filter when opening
  useEffect(() => {
    if (showFilter) {
      setLocalValue(remarksFilter.value || "");
    }
  }, [showFilter, remarksFilter.value]);

  // Debounced validation
  const debouncedValidation = debounce((value) => {
    const valid = validateFilterInput("NAME", value);
    setIsValid(valid);
  }, 300);

  const handleLocalValueChange = (value) => {
    setLocalValue(value);
    debouncedValidation(value);
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({
      ...remarksFilter,
      operator,
    });
  };

  const handleApply = () => {
    if (isValid && localValue.trim() !== "") {
      onApply({
        ...remarksFilter,
        value: localValue.trim(),
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  const handleClear = () => {
    setLocalValue("");
    setIsValid(true);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const isApplyDisabled = !isValid || localValue.trim() === "";
  const isClearDisabled = localValue.trim() === "";

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.remarks")}
        filter={remarksFilter}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox
          title={t("transactions.remarks")}
          operatorDropdown={
            <OperatorDropdown
              operators={FILTER_OPERATORS.NAME}
              selectedOperator={remarksFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          }
        >
          {/* Value Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder={t("transactions.remarksPlaceholder")}
              value={localValue}
              onChange={(e) => handleLocalValueChange(e.target.value)}
              className={`${FILTER_STYLES.INPUT} ${
                !isValid ? "border-red-300 focus:ring-red-500" : ""
              }`}
              aria-label="Remarks filter input"
            />
            {!isValid && (
              <p className="mt-1 text-xs text-red-600">
                {t("validation.remarksInvalid")}
              </p>
            )}
          </div>

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

export default RemarksFilter;
