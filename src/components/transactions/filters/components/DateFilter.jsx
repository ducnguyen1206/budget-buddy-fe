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
import { validateFilterInput } from "../utils/filterUtils";

const DateFilter = ({
  dateFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [localValue, setLocalValue] = useState("");
  const [localEndValue, setLocalEndValue] = useState("");

  // Sync localValue with dateFilter.value when filter is applied
  useEffect(() => {
    if (dateFilter.value) {
      if (
        typeof dateFilter.value === "object" &&
        dateFilter.value.startDate &&
        dateFilter.value.endDate
      ) {
        // Handle "is between" case
        setLocalValue(dateFilter.value.startDate);
        setLocalEndValue(dateFilter.value.endDate);
      } else {
        // Handle "is" case
        setLocalValue(dateFilter.value);
        setLocalEndValue("");
      }
    }
  }, [dateFilter.value]);

  const handleLocalValueChange = (value) => {
    setLocalValue(value);
  };

  const handleLocalEndValueChange = (value) => {
    setLocalEndValue(value);
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({ ...dateFilter, operator });
  };

  const handleApply = () => {
    if (dateFilter.operator === "is") {
      if (localValue && validateFilterInput("date", localValue)) {
        onApply({ ...dateFilter, value: localValue });
      }
    } else if (dateFilter.operator === "is between") {
      if (
        localValue &&
        localEndValue &&
        validateFilterInput("date", localValue) &&
        validateFilterInput("date", localEndValue)
      ) {
        onApply({
          ...dateFilter,
          value: { startDate: localValue, endDate: localEndValue },
        });
      }
    }
  };

  const handleClear = () => {
    setLocalValue("");
    setLocalEndValue("");
    onClear();
  };

  const isApplyDisabled =
    !localValue ||
    (dateFilter.operator === "is between" && !localEndValue) ||
    !validateFilterInput("date", localValue) ||
    (dateFilter.operator === "is between" &&
      localEndValue &&
      !validateFilterInput("date", localEndValue));

  const isClearDisabled = !localValue && !localEndValue;

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.date")}
        filter={dateFilter}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox
          title={t("transactions.date")}
          operatorDropdown={
            <OperatorDropdown
              operators={FILTER_OPERATORS.DATE}
              selectedOperator={dateFilter.operator}
              onOperatorChange={handleOperatorChange}
            />
          }
        >
          {/* Value Input(s) */}
          <div className="mb-3">
            {dateFilter.operator === "is" ? (
              <input
                type="date"
                value={localValue}
                onChange={(e) => handleLocalValueChange(e.target.value)}
                className={FILTER_STYLES.INPUT}
                aria-label="Date filter input"
              />
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("transactions.dateFromLabel")}
                  </label>
                  <input
                    type="date"
                    value={localValue}
                    onChange={(e) => handleLocalValueChange(e.target.value)}
                    className={FILTER_STYLES.INPUT}
                    aria-label="Start date"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {t("transactions.dateToLabel")}
                  </label>
                  <input
                    type="date"
                    value={localEndValue}
                    onChange={(e) => handleLocalEndValueChange(e.target.value)}
                    className={FILTER_STYLES.INPUT}
                    aria-label="End date"
                  />
                </div>
              </div>
            )}
          </div>

          <ActionButtons
            onApply={handleApply}
            onClear={handleClear}
            onClose={onToggleFilter}
            isApplyDisabled={isApplyDisabled}
            isClearDisabled={isClearDisabled}
            showCloseButton={!!(localValue || localEndValue)}
          />
        </FilterBox>
      )}
    </div>
  );
};

export default DateFilter;
