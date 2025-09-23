// Shared utility functions for filter components

import { FILTER_VALIDATION } from "./filterConstants";

/**
 * Validates filter input based on type
 */
export const validateFilterInput = (type, value) => {
  const validation = FILTER_VALIDATION[type.toUpperCase()];
  if (!validation) return true;

  if (validation.required && (!value || value.toString().trim() === "")) {
    return false;
  }

  if (validation.minLength && value.length < validation.minLength) {
    return false;
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return false;
  }

  if (validation.pattern && !validation.pattern.test(value)) {
    return false;
  }

  if (validation.min !== undefined && parseFloat(value) < validation.min) {
    return false;
  }

  return true;
};

/**
 * Validates array-based filters (account, category)
 */
export const validateArrayFilter = (ids, minSelections = 1) => {
  return Array.isArray(ids) && ids.length >= minSelections;
};

/**
 * Formats display value for different filter types
 */
export const formatDisplayValue = (filter, items = []) => {
  if (!filter || (!filter.value && !filter.ids && !filter.types)) return "";

  // For array-based filters (account, category, type)
  if (filter.ids && Array.isArray(filter.ids)) {
    const selectedItems = items.filter((item) => filter.ids.includes(item.id));
    if (selectedItems.length === 1) {
      return (
        selectedItems[0].name || selectedItems[0].categoryName || "Unknown"
      );
    } else if (selectedItems.length > 1) {
      return `${selectedItems.length} ${
        items[0]?.categoryName ? "categories" : "accounts"
      }`;
    }
    return "";
  }

  // For type-based filters
  if (filter.types && Array.isArray(filter.types)) {
    const selectedItems = items.filter((item) =>
      filter.types.includes(item.id)
    );
    if (selectedItems.length === 1) {
      return selectedItems[0].name || "Unknown";
    } else if (selectedItems.length > 1) {
      return `${selectedItems.length} types`;
    }
    return "";
  }

  // For value-based filters
  if (filter.value) {
    if (
      typeof filter.value === "object" &&
      filter.value.startDate &&
      filter.value.endDate
    ) {
      return `${filter.value.startDate} - ${filter.value.endDate}`;
    }
    return filter.value.toString();
  }

  return "";
};

/**
 * Checks if a filter is active (has a value)
 */
export const isFilterActive = (filter) => {
  if (!filter) return false;

  if (filter.ids && Array.isArray(filter.ids)) {
    return filter.ids.length > 0;
  }

  if (filter.types && Array.isArray(filter.types)) {
    return filter.types.length > 0;
  }

  if (filter.currencies && Array.isArray(filter.currencies)) {
    return filter.currencies.length > 0;
  }

  return (
    filter.value !== "" && filter.value !== null && filter.value !== undefined
  );
};

/**
 * Gets selected items for array-based filters
 */
export const getSelectedItems = (items, selectedIds) => {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) return [];

  return items
    .filter((item) => item.id && selectedIds.includes(item.id))
    .map((item) => ({
      id: item.id || `temp-${Math.random()}`,
      name:
        item.name || item.categoryName || item.sourceAccountName || "Unknown",
    }));
};

/**
 * Handles item toggle for array-based filters
 */
export const handleItemToggle = (itemId, selectedIds, setSelectedIds) => {
  setSelectedIds((prev) => {
    if (prev.includes(itemId)) {
      return prev.filter((id) => id !== itemId);
    } else {
      return [...prev, itemId];
    }
  });
};

/**
 * Debounce function for input changes
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generates unique keys for React elements
 */
export const generateKey = (prefix, id, index) => {
  return `${prefix}-${id || "unknown"}-${index}`;
};
