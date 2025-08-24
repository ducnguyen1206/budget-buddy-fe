import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
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
    type: "EXPENSE",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Mock data for editing - in real app, fetch from API
  const mockCategory = {
    id: 1,
    name: "Groceries",
    type: "EXPENSE",
  };

  // Load category data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In real app, fetch category data by ID from API
      setFormData({
        name: mockCategory.name,
        type: mockCategory.type,
      });
    }
  }, [isEditMode]);

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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // In real app, call API to create/update category
    console.log("Form submitted:", formData);

    // Navigate back to categories page
    navigate("/categories");
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/categories");
  };

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

  // Category type options
  const categoryTypeOptions = [
    { value: "EXPENSE", label: t("categories.EXPENSE") },
    { value: "INCOME", label: t("categories.INCOME") },
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
            {renderFormField("name", t("categories.name"))}

            {/* Category Type Field */}
            {renderFormField(
              "type",
              t("categories.categoryType"),
              "select",
              categoryTypeOptions
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                {t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
