import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createCategory,
  updateCategory,
  fetchCategoryById,
  fetchCategories,
} from "../../services/categoryService";
import { ArrowLeft } from "lucide-react";

export default function CategoryForm() {
  // Hooks
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode

  // Determine if we're in edit mode
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

  // Category names dropdown state
  const [categoryNames, setCategoryNames] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [loadingNames, setLoadingNames] = useState(true);

  // Refs
  const nameRef = useRef(null);

  // Load category data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadCategoryData();
    }
  }, [isEditMode, id]);

  // Load category names on component mount
  useEffect(() => {
    loadCategoryNames();
  }, []);

  // Handle click outside for name dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nameRef.current && !nameRef.current.contains(event.target)) {
        setShowNameDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load category data from API
  const loadCategoryData = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await fetchCategoryById(id, t);

      if (result.success) {
        const category = result.data;
        setFormData({
          name: category.name || "",
          type: category.type || "",
        });
        setNameSearch(category.name || "");
      } else {
        setLoadError(result.error);
      }
    } catch (error) {
      console.error("Error loading category:", error);
      setLoadError(t("errors.fetchCategoryFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Load category names from API
  const loadCategoryNames = async () => {
    try {
      setLoadingNames(true);
      const result = await fetchCategories(t);

      if (result.success) {
        // Extract unique category names
        const uniqueNames = [
          ...new Set(result.data.map((category) => category.name)),
        ];
        setCategoryNames(uniqueNames);
      }
    } catch (error) {
      console.error("Error loading category names:", error);
    } finally {
      setLoadingNames(false);
    }
  };

  // Handle name input changes
  const handleNameInputChange = (e) => {
    const value = e.target.value;
    setNameSearch(value);
    setFormData((prev) => ({ ...prev, name: value }));
    setShowNameDropdown(true);

    // Clear validation error
    if (validationErrors.name) {
      setValidationErrors((prev) => ({ ...prev, name: "" }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError("");
    }
  };

  // Handle name selection from dropdown
  const handleNameSelect = (name) => {
    setFormData((prev) => ({ ...prev, name }));
    setNameSearch(name);
    setShowNameDropdown(false);

    // Clear validation error
    if (validationErrors.name) {
      setValidationErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  // Filter category names based on search
  const filteredCategoryNames = categoryNames.filter((name) =>
    name.toLowerCase().includes(nameSearch.toLowerCase())
  );

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError("");
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Validate name field
    if (!formData.name.trim()) {
      errors.name = t("validation.nameRequired");
    }

    // Validate type field
    if (!formData.type) {
      errors.type = t("validation.categoryTypeRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setSubmitError("");

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing category
        const result = await updateCategory(id, formData, t);

        if (result.success) {
          console.log("Category updated successfully:", result.data);
          navigate("/categories");
        } else {
          setSubmitError(result.error);
        }
      } else {
        // Create new category
        const result = await createCategory(formData, t);

        if (result.success) {
          console.log("Category created successfully:", result.data);
          navigate("/categories");
        } else {
          setSubmitError(result.error);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(
        isEditMode
          ? t("errors.updateCategoryFailed")
          : t("errors.createCategoryFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/categories");
  };

  // Show loading state while fetching category data
  if (isLoading) {
    return (
      <DashboardLayout activePage="categories">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">{t("common.loading")}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if category loading failed
  if (loadError) {
    return (
      <DashboardLayout activePage="categories">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("categories.updateCategory")}
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 mb-4">{loadError}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => loadCategoryData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("common.retry")}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render form field with validation
  const renderFormField = (fieldName, label, type = "text", options = null) => (
    <div>
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>

      {type === "select" ? (
        <select
          id={fieldName}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out appearance-none bg-white ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
        >
          <option value="" className="py-2">
            {t("categories.selectType")}
          </option>
          {options?.map((option) => (
            <option key={option.value} value={option.value} className="py-2">
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={fieldName}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={
            fieldName === "name" ? t("categories.namePlaceholder") : ""
          }
        />
      )}

      {/* Show validation error if exists */}
      {validationErrors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">
          {validationErrors[fieldName]}
        </p>
      )}
    </div>
  );

  // Category type options - could be fetched from API in the future
  const categoryTypeOptions = [
    { value: "EXPENSE", label: t("categories.EXPENSE") },
    { value: "INCOME", label: t("categories.INCOME") },
    { value: "TRANSFER", label: t("categories.TRANSFER") },
  ];

  return (
    <DashboardLayout activePage="categories">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode
              ? t("categories.updateCategory")
              : t("categories.createCategory")}
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div ref={nameRef} className="relative">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("categories.name")}
              </label>
              <input
                type="text"
                id="name"
                value={nameSearch}
                onChange={handleNameInputChange}
                onFocus={() => setShowNameDropdown(true)}
                placeholder={
                  loadingNames
                    ? t("categories.loadingNames")
                    : t("categories.namePlaceholder")
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-colors ${
                  validationErrors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary"
                }`}
                required
              />

              {/* Name Dropdown */}
              {showNameDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredCategoryNames.length > 0
                    ? filteredCategoryNames.map((name) => (
                        <div
                          key={name}
                          onClick={() => handleNameSelect(name)}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-sm"
                        >
                          {name}
                        </div>
                      ))
                    : nameSearch.trim() && (
                        <div
                          onClick={() => handleNameSelect(nameSearch.trim())}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-sm text-blue-600"
                        >
                          {nameSearch.trim()}
                        </div>
                      )}
                </div>
              )}

              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Category Type Field */}
            {renderFormField(
              "type",
              t("categories.categoryType"),
              "select",
              categoryTypeOptions
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
