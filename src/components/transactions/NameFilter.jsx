import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

// Name filter operators
const NAME_OPERATORS = [
  { value: "is", label: "Is" },
  { value: "is not", label: "Is not" },
  { value: "contains", label: "Contains" },
  { value: "does not contain", label: "Does not contain" },
  { value: "starts with", label: "Starts with" },
  { value: "ends with", label: "Ends with" },
];

const NameFilter = ({
  nameFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
}) => {
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [localValue, setLocalValue] = useState("");

  // Sync localValue with nameFilter.value when filter is applied
  useEffect(() => {
    if (nameFilter.value) {
      setLocalValue(nameFilter.value);
    }
  }, [nameFilter.value]);

  const handleLocalValueChange = (value) => {
    setLocalValue(value);
  };

  const handleOperatorChange = (operator) => {
    onFilterChange({ ...nameFilter, operator });
  };

  const handleApply = () => {
    onApply({ ...nameFilter, value: localValue });
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
          nameFilter.value
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        <span>Name</span>
        {nameFilter.value && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {nameFilter.value}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Filter Box */}
      {showFilter && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4">
          {/* Header with Name and Operator */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-700 font-medium">Name</span>
            <div className="relative">
              <button
                onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm">
                  {
                    NAME_OPERATORS.find(
                      (op) => op.value === nameFilter.operator
                    )?.label
                  }
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Operator Dropdown */}
              {showOperatorDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 w-40">
                  {NAME_OPERATORS.map((operator) => (
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
              placeholder="Enter name value..."
              value={localValue}
              onChange={(e) => handleLocalValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm"
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

export default NameFilter;
