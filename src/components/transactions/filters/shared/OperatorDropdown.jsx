import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FILTER_STYLES } from "../utils/filterConstants";

const OperatorDropdown = ({
  operators,
  selectedOperator,
  onOperatorChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOperatorLabel =
    operators.find((op) => op.value === selectedOperator)?.label || "";

  const handleOperatorSelect = (operator) => {
    onOperatorChange(operator);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={FILTER_STYLES.DROPDOWN_BUTTON}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-sm">{selectedOperatorLabel}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <div className={FILTER_STYLES.DROPDOWN} role="listbox">
          {operators.map((operator) => (
            <button
              key={operator.value}
              onClick={() => handleOperatorSelect(operator.value)}
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors"
              role="option"
              aria-selected={operator.value === selectedOperator}
            >
              {operator.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperatorDropdown;
