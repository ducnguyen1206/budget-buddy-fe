import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

// Date filter operators
const DATE_OPERATORS = [
  { value: "is", label: "Is" },
  { value: "is between", label: "Is between" },
];

const DateFilter = ({
  dateFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
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
      if (localValue) {
        onApply({ ...dateFilter, value: localValue });
      }
    } else if (dateFilter.operator === "is between") {
      if (localValue && localEndValue) {
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

  const getDisplayValue = () => {
    if (dateFilter.operator === "is") {
      return dateFilter.value || "";
    } else if (
      dateFilter.operator === "is between" &&
      dateFilter.value &&
      typeof dateFilter.value === "object"
    ) {
      return `${dateFilter.value.startDate} - ${dateFilter.value.endDate}`;
    }
    return "";
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={onToggleFilter}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-xl hover:bg-gray-50 transition-colors ${
          dateFilter.value !== "" &&
          dateFilter.value !== null &&
          dateFilter.value !== undefined
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        <span>{t("transactions.date")}</span>
        {dateFilter.value && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {getDisplayValue()}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Filter Box */}
      {showFilter && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4">
          {/* Header with Date and Operator */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-700 font-medium">
              {t("transactions.date")}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm">
                  {
                    DATE_OPERATORS.find(
                      (op) => op.value === dateFilter.operator
                    )?.label
                  }
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Operator Dropdown */}
              {showOperatorDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 w-40">
                  {DATE_OPERATORS.map((operator) => (
                    <button
                      key={operator.value}
                      onClick={() => {
                        handleOperatorChange(operator.value);
                        setShowOperatorDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {operator.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Value Input(s) */}
          <div className="mb-3">
            {dateFilter.operator === "is" ? (
              <input
                type="date"
                value={localValue}
                onChange={(e) => handleLocalValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApply}
              disabled={
                !localValue ||
                (dateFilter.operator === "is between" && !localEndValue)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              disabled={!localValue && !localEndValue}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            {(localValue || localEndValue) && (
              <button
                onClick={onToggleFilter}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
