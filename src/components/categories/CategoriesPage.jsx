import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  fetchCategories,
  deleteCategory,
} from "../../services/categoryService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function CategoriesPage() {
  // Hooks
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownPositions, setDropdownPositions] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Fetch categories from API on component mount
  useEffect(() => {
    loadCategories();

    // Cleanup function to reset dropdown state when component unmounts
    return () => {
      setDropdownPositions({});
      setOpenDropdown(null);
    };
  }, []);

  // Expand all groups by default when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const uniqueNames = [
        ...new Set(categories.map((category) => category.name)),
      ];
      setExpandedGroups(new Set(uniqueNames));
    }
  }, [categories]);

  // Filter categories based on search input
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group categories by name
  const groupedCategories = filteredCategories.reduce((groups, category) => {
    const name = category.name;
    if (!groups[name]) {
      groups[name] = [];
    }
    groups[name].push(category);
    return groups;
  }, {});

  // Convert grouped object to array for rendering
  const categoryGroups = Object.entries(groupedCategories).map(
    ([name, categories]) => ({
      name,
      categories: categories.sort((a, b) => {
        // Sort by type: INCOME, EXPENSE, TRANSFER
        const typeOrder = { INCOME: 0, EXPENSE: 1, TRANSFER: 2 };
        return typeOrder[a.type] - typeOrder[b.type];
      }),
    })
  );

  // Load categories from API
  const loadCategories = async () => {
    setIsLoading(true);
    setError("");

    const result = await fetchCategories(t);

    // Check if the result indicates a redirect should happen
    if (shouldRedirectToLogin(result)) {
      console.log(
        "Categories API returned redirect response - user will be redirected to login"
      );
      return; // The redirect will be handled by the API interceptor
    }

    if (result.success) {
      setCategories(result.data);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  // Handle group expansion toggle
  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Handle dropdown toggle with smart positioning
  const handleDropdownToggle = (id, event) => {
    // Close dropdown if it's already open for this item
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }

    // Calculate exact position for the dropdown
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Position dropdown above the button to ensure visibility
    setDropdownPositions((prev) => ({
      ...prev,
      [id]: {
        position: "fixed",
        top: `${buttonRect.top - 80}px`, // 80px above the button
        left: `${buttonRect.right - 192}px`, // Align to right edge (192px = w-48)
        zIndex: 50,
      },
    }));

    setOpenDropdown(id);
  };

  // Handle edit category action
  const handleEdit = (id) => {
    console.log("Edit category:", id);
    navigate(`/categories/edit/${id}`);
    setOpenDropdown(null);
  };

  // Handle delete category action
  const handleDelete = (id) => {
    console.log("Delete category:", id);
    setDeleteConfirm(id);
    setOpenDropdown(null);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    setError("");

    try {
      const result = await deleteCategory(deleteConfirm, t);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        console.log(
          "Delete category API returned redirect response - user will be redirected to login"
        );
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        console.log("Category deleted successfully");
        // Remove the deleted category from the list
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteConfirm));
        setDeleteConfirm(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Delete category error:", error);
      setError(t("errors.deleteCategoryFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    </div>
  );

  // Render error message
  const renderErrorMessage = () => (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  );

  // Render delete confirmation dialog
  const renderDeleteConfirmation = () => {
    if (!deleteConfirm) return null;

    const categoryToDelete = categories.find((cat) => cat.id === deleteConfirm);
    if (!categoryToDelete) return null;

    // Replace the {name} placeholder with the actual category name
    const deleteWarningText = t("categories.deleteWarning").replace(
      "{name}",
      categoryToDelete.name
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("categories.confirmDelete")}
          </h3>
          <p className="text-gray-600 mb-6">{deleteWarningText}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {searchTerm
          ? t("categories.noCategoriesMatching")
          : t("categories.noCategoriesFound")}
      </p>
    </div>
  );

  // Render category row
  const renderCategoryRow = (category) => (
    <tr key={category.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{category.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            category.type === "INCOME"
              ? "bg-green-100 text-green-800"
              : category.type === "TRANSFER"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {t(`categories.${category.type}`)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative dropdown-container">
          {/* Three dots button */}
          <button
            onClick={(e) => handleDropdownToggle(category.id, e)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {openDropdown === category.id && (
            <div
              className="w-48 bg-white rounded-md shadow-xl border border-gray-200"
              style={dropdownPositions[category.id]}
            >
              <div className="py-1">
                <button
                  onClick={() => handleEdit(category.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  {t("common.delete")}
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  // Render category group header
  const renderCategoryGroup = (group) => {
    const isExpanded = expandedGroups.has(group.name);
    const hasMultipleTypes = group.categories.length > 1;

    return (
      <React.Fragment key={group.name}>
        {/* Group Header Row */}
        <tr className="bg-gray-50 border-b border-gray-200">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <button
                onClick={() => toggleGroupExpansion(group.name)}
                className="mr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              <div className="text-sm font-semibold text-gray-900">
                {group.name}
                <span className="ml-2 text-xs text-gray-500">
                  ({group.categories.length}{" "}
                  {group.categories.length === 1 ? "type" : "types"})
                </span>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {/* Empty for group header */}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            {/* Group actions could be added here if needed */}
          </td>
        </tr>

        {/* Category Rows */}
        {isExpanded &&
          group.categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap pl-12">
                <div className="text-sm text-gray-600">
                  {t(`categories.${category.type}`)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.type === "INCOME"
                      ? "bg-green-100 text-green-800"
                      : category.type === "TRANSFER"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {t(`categories.${category.type}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative dropdown-container">
                  {/* Three dots button */}
                  <button
                    onClick={(e) => handleDropdownToggle(category.id, e)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Dropdown menu */}
                  {openDropdown === category.id && (
                    <div
                      className="w-48 bg-white rounded-md shadow-xl border border-gray-200"
                      style={dropdownPositions[category.id]}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 mr-3" />
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 mr-3" />
                          {t("common.delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
      </React.Fragment>
    );
  };

  return (
    <DashboardLayout activePage="categories">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.categories")}
          </h1>
        </div>

        {/* Search and New Button Row */}
        <div className="flex justify-between items-center mb-6">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("categories.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* New Category Button */}
          <button
            onClick={() => navigate("/categories/new")}
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t("categories.new")}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && renderErrorMessage()}

        {/* Loading State */}
        {isLoading && renderLoadingState()}

        {/* Categories Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("categories.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("categories.categoryType")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* Actions column header */}
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryGroups.map(renderCategoryGroup)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categoryGroups.length === 0 && renderEmptyState()}

        {/* Delete Confirmation Dialog */}
        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
