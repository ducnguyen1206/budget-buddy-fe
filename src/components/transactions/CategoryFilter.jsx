import React, { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const CategoryFilter = ({
  categoryFilter,
  onFilterChange,
  onApply,
  onClear,
  showFilter,
  onToggleFilter,
  categories = [],
}) => {
  const { t } = useLanguage();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // Sync local state with applied filter when opening the filter
  useEffect(() => {
    if (showFilter && categoryFilter.ids && Array.isArray(categoryFilter.ids)) {
      setSelectedCategoryIds(categoryFilter.ids);
    }
  }, [showFilter, categoryFilter.ids]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleApply = () => {
    if (selectedCategoryIds.length > 0) {
      onApply({
        ...categoryFilter,
        ids: selectedCategoryIds,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  // Handle filter toggle with proper state management
  const handleToggleFilter = () => {
    onToggleFilter();
  };

  const handleClear = () => {
    setSelectedCategoryIds([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const getDisplayValue = () => {
    if (categoryFilter.ids && categoryFilter.ids.length > 0) {
      const selectedCategories = categories.filter((category) =>
        categoryFilter.ids.includes(category.id)
      );
      if (selectedCategories.length === 1) {
        return selectedCategories[0].name;
      } else if (selectedCategories.length > 1) {
        return `${selectedCategories.length} categories`;
      }
    }
    return "";
  };

  const getSelectedCategoryNames = () => {
    if (selectedCategoryIds.length > 0) {
      return categories
        .filter((category) => selectedCategoryIds.includes(category.id))
        .map((category) => ({
          id: category.id || `temp-${Math.random()}`,
          name: category.name || "Unknown Category",
        }));
    }
    return [];
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={handleToggleFilter}
        className={`flex items-center space-x-2 px-3 py-2 border rounded-xl hover:bg-gray-50 transition-colors ${
          categoryFilter.ids && categoryFilter.ids.length > 0
            ? "bg-blue-50 border-blue-300 text-blue-700"
            : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        <span>{t("transactions.category")}</span>
        {categoryFilter.ids && categoryFilter.ids.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {getDisplayValue()}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Filter Box */}
      {showFilter && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">
              {t("transactions.category")}
            </span>
          </div>

          {/* Category Selection */}
          <div className="mb-3">
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {t("transactions.noCategoriesFound")}
                </div>
              ) : (
                categories
                  .filter((category) => category.id) // Only show categories with valid IDs
                  .map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex-shrink-0">
                        {selectedCategoryIds.includes(category.id) ? (
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {category.categoryName || category.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category.categoryType || "Unknown"}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Selected Categories Display */}
          {selectedCategoryIds.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-2">
                {t("transactions.selectedCategories")}:
              </div>
              <div className="flex flex-wrap gap-1">
                {getSelectedCategoryNames().map((category, index) => (
                  <span
                    key={`selected-category-${
                      category.id || "unknown"
                    }-${index}`}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApply}
              disabled={selectedCategoryIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              disabled={selectedCategoryIds.length === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
