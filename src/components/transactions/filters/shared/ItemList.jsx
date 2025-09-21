import React from "react";
import { Check } from "lucide-react";
import { FILTER_STYLES } from "../utils/filterConstants";

const ItemList = ({
  items,
  selectedIds,
  onItemToggle,
  emptyMessage,
  renderItem = (item) =>
    item.name || item.categoryName || item.sourceAccountName || "Unknown",
  renderSubtitle = (item) =>
    item.categoryType || item.accountType || item.currency || "",
  className = "",
}) => {
  if (items.length === 0) {
    return <div className="text-center py-4 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className={`${FILTER_STYLES.ITEM_LIST} ${className}`}>
      {items
        .filter((item) => item.id) // Only show items with valid IDs
        .map((item) => (
          <div
            key={item.id}
            className={FILTER_STYLES.ITEM_ROW}
            onClick={() => onItemToggle(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onItemToggle(item.id);
              }
            }}
            aria-pressed={selectedIds.includes(item.id)}
          >
            <div className="flex-shrink-0">
              {selectedIds.includes(item.id) ? (
                <div className={FILTER_STYLES.CHECKBOX_CHECKED}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className={FILTER_STYLES.CHECKBOX}></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {renderItem(item)}
              </div>
              {renderSubtitle(item) && (
                <div className="text-xs text-gray-500">
                  {renderSubtitle(item)}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ItemList;
