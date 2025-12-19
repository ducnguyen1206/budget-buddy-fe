import React from "react";
import { ChevronDown } from "lucide-react";
import { FILTER_STYLES } from "../utils/filterConstants";
import { isFilterActive, formatDisplayValue } from "../utils/filterUtils";

const FilterButton = ({
  label,
  filter,
  items = [],
  onClick,
  className = "",
}) => {
  const isActive = isFilterActive(filter);
  const displayValue = filter.displayValue || formatDisplayValue(filter, items);

  return (
    <button
      onClick={onClick}
      className={`${FILTER_STYLES.BUTTON_BASE} ${
        isActive ? FILTER_STYLES.BUTTON_ACTIVE : FILTER_STYLES.BUTTON_INACTIVE
      } ${className}`}
      aria-expanded={isActive}
      aria-haspopup="true"
    >
      <span>{label}</span>
      {isActive && displayValue && (
        <span className={FILTER_STYLES.BADGE}>{displayValue}</span>
      )}
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  );
};

export default FilterButton;
