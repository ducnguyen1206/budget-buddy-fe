import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

// Amount filter operators
const AMOUNT_OPERATORS = [
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
];

const AmountFilter = ({
  amountFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const { t } = useLanguage();
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
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

  const handleLocalValueChange = (value) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLocalValue(value);
    }
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({ ...amountFilter, operator });
  };

  const handleApply = () => {
    const numericValue = parseFloat(localValue);
    if (!isNaN(numericValue)) {
      onApply({ ...amountFilter, value: numericValue });
    }
  };

  const handleClear = () => {
    setLocalValue("");
    onClear();
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={onToggleFilter}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-xl hover:bg-gray-50 transition-colors ${
          amountFilter.value !== "" &&
          amountFilter.value !== null &&
          amountFilter.value !== undefined
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        <span>{t("transactions.amount")}</span>
        {amountFilter.value !== "" &&
          amountFilter.value !== null &&
          amountFilter.value !== undefined && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {amountFilter.operator} {amountFilter.value}
            </span>
          )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Filter Box */}
      {showFilter && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4">
          {/* Header with Amount and Operator */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-700 font-medium">
              {t("transactions.amount")}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm">
                  {
                    AMOUNT_OPERATORS.find(
                      (op) => op.value === amountFilter.operator
                    )?.label
                  }
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Operator Dropdown */}
              {showOperatorDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 w-40">
                  {AMOUNT_OPERATORS.map((operator) => (
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

          {/* Value Input */}
          <div className="mb-3">
            <input
              type="text"
              placeholder={t("transactions.amountFilterPlaceholder")}
              value={localValue}
              onChange={(e) => handleLocalValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApply}
              disabled={!localValue || isNaN(parseFloat(localValue))}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              disabled={!localValue || localValue.trim() === ""}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            {localValue && (
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

export default AmountFilter;
