import React from "react";
import { FILTER_STYLES } from "../utils/filterConstants";

const FilterBox = ({
  children,
  title,
  className = "",
  onClose,
  operatorDropdown,
}) => {
  return (
    <div className={`${FILTER_STYLES.FILTER_BOX} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">{title}</span>
          {operatorDropdown}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Close filter"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default FilterBox;
