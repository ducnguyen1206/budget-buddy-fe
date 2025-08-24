import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { fetchCategories } from "../../services/categoryService";

export default function CategoriesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownPositions, setDropdownPositions] = useState({});

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError("");

      const result = await fetchCategories(t);

      if (result.success) {
        // Use the actual categories from API (with IDs)
        setCategories(result.data);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    };

    loadCategories();

    // Cleanup dropdown positions when categories change
    return () => {
      setDropdownPositions({});
      setOpenDropdown(null);
    };
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDropdownToggle = (id, event) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }

    // Calculate exact position for the dropdown
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Position dropdown above the button with exact coordinates
    setDropdownPositions((prev) => ({
      ...prev,
      [id]: {
        position: "fixed",
        top: `${buttonRect.top - 80}px`, // 80px above the button
        left: `${buttonRect.right - 192}px`, // 192px = w-48 (12rem)
        zIndex: 50,
      },
    }));

    setOpenDropdown(id);
  };

  const handleEdit = (id) => {
    console.log("Edit category:", id);
    navigate(`/categories/edit/${id}`);
    setOpenDropdown(null);
  };

  const handleDelete = (id) => {
    console.log("Delete category:", id);
    setOpenDropdown(null);
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
          <button
            onClick={() => navigate("/categories/new")}
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t("categories.new")}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{t("common.loading")}</span>
            </div>
          </div>
        )}

        {/* Categories Table */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("categories.name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("categories.categoryType")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* Empty header for actions column */}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.type === "INCOME"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t(`categories.${category.type}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button
                            onClick={(e) =>
                              handleDropdownToggle(category.id, e)
                            }
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
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
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm
                ? t("categories.noCategoriesMatching")
                : t("categories.noCategoriesFound")}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
