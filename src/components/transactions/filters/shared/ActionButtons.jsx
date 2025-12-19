import React from "react";
import { FILTER_STYLES } from "../utils/filterConstants";

const ActionButtons = ({
  onApply,
  onClear,
  onClose,
  isApplyDisabled = false,
  isClearDisabled = false,
  showCloseButton = false,
  applyText = "Apply",
  clearText = "Clear",
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onApply}
        disabled={isApplyDisabled}
        className={`${FILTER_STYLES.ACTION_BUTTON} ${
          FILTER_STYLES.ACTION_PRIMARY
        } ${isApplyDisabled ? FILTER_STYLES.ACTION_DISABLED : ""}`}
        aria-label={applyText}
      >
        {applyText}
      </button>

      <button
        onClick={onClear}
        disabled={isClearDisabled}
        className={`${FILTER_STYLES.ACTION_BUTTON} ${
          FILTER_STYLES.ACTION_SECONDARY
        } ${isClearDisabled ? FILTER_STYLES.ACTION_DISABLED : ""}`}
        aria-label={clearText}
      >
        {clearText}
      </button>

      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
  );
};

export default ActionButtons;
