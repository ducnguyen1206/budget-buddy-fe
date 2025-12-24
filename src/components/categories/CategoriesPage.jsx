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

  // Fetch categories from API on component mount
  useEffect(() => {
    loadCategories();

    // Cleanup function to reset dropdown state when component unmounts
    return () => {
      setDropdownPositions({});
      setOpenDropdown(null);
    };
  }, []);

  // Filter categories based on search input
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load categories from API
  const loadCategories = async () => {
    setIsLoading(true);
    setError("");

    const result = await fetchCategories(t);

    // Check if the result indicates a redirect should happen
    if (shouldRedirectToLogin(result)) {
      return; // The redirect will be handled by the API interceptor
    }

    if (result.success) {
      setCategories(result.data);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (openDropdown && !event.target.closest('.dropdown-container')) {
      setOpenDropdown(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [openDropdown]);

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
    navigate(`/categories/edit/${id}`);
    setOpenDropdown(null);
  };

  // Handle delete category action
  const handleDelete = (id) => {
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
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
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
      <p className="text-red-600 text-lg">{error}</p>
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
        <div className="text-lg text-gray-900 font-semibold">
          {category.name}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-medium">
        <div className="relative dropdown-container flex justify-center items-center">
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
                  className="flex items-center w-full px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  {t("common.edit")}
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex items-center w-full px-4 py-2 text-lg text-red-600 hover:bg-gray-100"
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
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                      {t("categories.name")}
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(renderCategoryRow)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCategories.length === 0 && renderEmptyState()}

        {/* Delete Confirmation Dialog */}
        {renderDeleteConfirmation()}
      </div>
    </DashboardLayout>
  );
}
