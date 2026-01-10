import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createBudget,
  updateBudget,
  fetchBudgetById,
} from "../../services/budgetService";
import { fetchCategories } from "../../services/categoryService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function BudgetForm() {
  // Hooks
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    currency: "SGD",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load budget data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadBudget();
    }
  }, [isEditMode, id]);

  // Load categories from API (filtered by EXPENSE type)
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await fetchCategories(t, "EXPENSE");

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load existing budget data in edit mode
  const loadBudget = async () => {
    setIsLoadingBudget(true);
    setLoadError("");

    try {
      const result = await fetchBudgetById(id, t);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success && result.data) {
        const budget = result.data;
        setFormData({
          categoryId:
            budget.categoryId !== undefined && budget.categoryId !== null
              ? String(budget.categoryId)
              : "",
          amount:
            budget.amount !== undefined && budget.amount !== null
              ? String(budget.amount)
              : "",
          currency: budget.currency || "SGD",
        });
      } else {
        setLoadError(result.error || t("errors.fetchBudgetFailed"));
      }
    } catch (error) {
      console.error("Error loading budget:", error);
      setLoadError(t("errors.fetchBudgetFailed"));
    } finally {
      setIsLoadingBudget(false);
    }
  };

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

    // Validate category field
    if (!formData.categoryId) {
      errors.categoryId = t("validation.categoryRequired");
    }

    // Validate amount field
    if (!formData.amount || formData.amount.trim() === "") {
      errors.amount = t("validation.amountRequired");
    } else {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        errors.amount = t("validation.amountInvalid");
      }
    }

    // Validate currency field
    if (!formData.currency) {
      errors.currency = t("validation.currencyRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setSubmitError("");

    if (isLoadingBudget) {
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert amount to number
      const budgetData = {
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      };

      const result = isEditMode
        ? await updateBudget(id, budgetData, t)
        : await createBudget(budgetData, t);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(result)) {
        return; // The redirect will be handled by the API interceptor
      }

      if (result.success) {
        navigate("/budgets");
      } else {
        setSubmitError(
          result.error ||
            (isEditMode
              ? t("errors.updateBudgetFailed")
              : t("errors.createBudgetFailed"))
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(
        isEditMode
          ? t("errors.updateBudgetFailed")
          : t("errors.createBudgetFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/budgets");
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
          disabled={
            (loadingCategories && fieldName === "categoryId") || isLoadingBudget
          }
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out appearance-none bg-white ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          } ${
            loadingCategories && fieldName === "categoryId"
              ? "opacity-50 cursor-not-allowed"
              : ""
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
            {fieldName === "categoryId"
              ? t("budgets.selectCategory")
              : t("budgets.selectCurrency")}
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
          step={type === "number" ? "0.01" : undefined}
          disabled={isLoadingBudget}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={
            fieldName === "amount" ? t("budgets.amountPlaceholder") : ""
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

  // Category options
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  // Currency options
  const currencyOptions = [
    { value: "SGD", label: "SGD" },
    { value: "VND", label: "VND" },
  ];

  const pageTitle = isEditMode
    ? t("budgets.editBudget")
    : t("budgets.createBudget");

  const submitButtonLabel = isSubmitting
    ? t("common.saving")
    : isEditMode
    ? t("common.update")
    : t("common.save");

  return (
    <DashboardLayout activePage="budgets">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Load Error */}
            {loadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loadError}</p>
              </div>
            )}

            {/* Loading Indicator for Edit Mode */}
            {isEditMode && isLoadingBudget && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t("common.loading")}
              </div>
            )}

            {/* Category Field */}
            {renderFormField(
              "categoryId",
              t("budgets.category"),
              "select",
              categoryOptions
            )}

            {/* Amount Field */}
            {renderFormField("amount", t("budgets.amount"), "number")}

            {/* Currency Field */}
            {renderFormField(
              "currency",
              t("budgets.currency"),
              "select",
              currencyOptions
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoadingBudget}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingBudget}
                className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitButtonLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
