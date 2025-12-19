import React from "react";
import { getSelectedItems, generateKey } from "../utils/filterUtils";

const SelectedItemsDisplay = ({
  items,
  selectedIds,
  label,
  className = "",
}) => {
  if (!selectedIds || selectedIds.length === 0) return null;

  const selectedItems = getSelectedItems(items, selectedIds);

  return (
    <div className={`mb-3 ${className}`}>
      <div className="text-xs text-gray-600 mb-2">{label}:</div>
      <div className="flex flex-wrap gap-1">
        {selectedItems.map((item, index) => (
          <span
            key={generateKey("selected-item", item.id, index)}
            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SelectedItemsDisplay;
