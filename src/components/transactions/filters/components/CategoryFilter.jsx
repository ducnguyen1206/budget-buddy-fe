import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import FilterButton from "../shared/FilterButton";
import FilterBox from "../shared/FilterBox";
import ItemList from "../shared/ItemList";
import SelectedItemsDisplay from "../shared/SelectedItemsDisplay";
import ActionButtons from "../shared/ActionButtons";
import { validateArrayFilter } from "../utils/filterUtils";

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
    if (validateArrayFilter(selectedCategoryIds)) {
      onApply({
        ...categoryFilter,
        ids: selectedCategoryIds,
      });
      onToggleFilter(); // Close the filter after applying
    }
  };

  const handleClear = () => {
    setSelectedCategoryIds([]);
    onClear();
    onToggleFilter(); // Close the filter after clearing
  };

  const isApplyDisabled = !validateArrayFilter(selectedCategoryIds);
  const isClearDisabled = !validateArrayFilter(selectedCategoryIds);

  return (
    <div className="relative">
      <FilterButton
        label={t("transactions.category")}
        filter={categoryFilter}
        items={categories}
        onClick={onToggleFilter}
      />

      {showFilter && (
        <FilterBox title={t("transactions.category")}>
          {/* Category Selection */}
          <div className="mb-3">
            <ItemList
              items={categories}
              selectedIds={selectedCategoryIds}
              onItemToggle={handleCategoryToggle}
              emptyMessage={t("transactions.noCategoriesFound")}
              renderItem={(category) => category.categoryName || category.name}
              renderSubtitle={(category) => category.categoryType || "Unknown"}
            />
          </div>

          {/* Selected Categories Display */}
          <SelectedItemsDisplay
            items={categories}
            selectedIds={selectedCategoryIds}
            label={t("transactions.selectedCategories")}
          />

          <ActionButtons
            onApply={handleApply}
            onClear={handleClear}
            isApplyDisabled={isApplyDisabled}
            isClearDisabled={isClearDisabled}
          />
        </FilterBox>
      )}
    </div>
  );
};

export default CategoryFilter;
