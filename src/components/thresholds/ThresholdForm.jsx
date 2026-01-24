import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  fetchThresholdById,
  createThreshold,
  updateThreshold,
} from "../../services/thresholdService";
import { fetchCategories } from "../../services/categoryService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function ThresholdForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    categoryId: "",
    threshold: "",
    currency: "SGD",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingThreshold, setIsLoadingThreshold] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadThreshold();
    }
  }, [isEditMode, id]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await fetchCategories(t);

      if (shouldRedirectToLogin(result)) {
        return;
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

  const loadThreshold = async () => {
    setIsLoadingThreshold(true);
    setLoadError("");

    const result = await fetchThresholdById(id, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success && result.data) {
      const threshold = result.data;
      setFormData({
        categoryId:
          threshold.categoryId !== undefined && threshold.categoryId !== null
            ? String(threshold.categoryId)
            : "",
        threshold:
          threshold.threshold !== undefined && threshold.threshold !== null
            ? String(threshold.threshold)
            : "",
        currency: threshold.currency || "SGD",
      });
    } else {
      setLoadError(result.error || t("errors.fetchThresholdFailed"));
    }

    setIsLoadingThreshold(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values for threshold field
    if (name === "threshold" && value !== "" && parseFloat(value) < 0) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.categoryId) {
      errors.categoryId = t("thresholds.categoryRequired");
    }

    if (!formData.threshold || formData.threshold.trim() === "") {
      errors.threshold = t("thresholds.thresholdRequired");
    } else {
      const thresholdValue = parseFloat(formData.threshold);
      if (isNaN(thresholdValue) || thresholdValue <= 0) {
        errors.threshold = t("thresholds.thresholdRequired");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (isLoadingThreshold) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      categoryId: parseInt(formData.categoryId, 10),
      threshold: parseFloat(formData.threshold),
      currency: formData.currency,
    };

    const result = isEditMode
      ? await updateThreshold(id, payload, t)
      : await createThreshold(payload, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      navigate("/thresholds");
    } else {
      setSubmitError(
        result.error ||
          (isEditMode
            ? t("errors.updateThresholdFailed")
            : t("errors.createThresholdFailed"))
      );
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => navigate("/thresholds");

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
          disabled={(loadingCategories && fieldName === "categoryId") || isLoadingThreshold}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out appearance-none bg-white ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          } ${
            loadingCategories && fieldName === "categoryId"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "right 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
          }}
        >
          {fieldName === "categoryId" && (
            <option value="" className="py-2">
              {t("thresholds.selectCategory")}
            </option>
          )}
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
          min={type === "number" ? "0.01" : undefined}
          disabled={isLoadingThreshold}
          className={`w-full max-w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={t("thresholds.thresholdPlaceholder")}
        />
      )}

      {validationErrors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{validationErrors[fieldName]}</p>
      )}
    </div>
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.id !== undefined && category.id !== null)
        .map((category) => ({
          value: category.id,
          label: category.name,
        })),
    [categories]
  );

  const currencyOptions = [
    { value: "SGD", label: "SGD" },
    { value: "USD", label: "USD" },
    { value: "VND", label: "VND" },
    { value: "EUR", label: "EUR" },
  ];

  const pageTitle = isEditMode
    ? t("thresholds.editThreshold")
    : t("thresholds.createThreshold");

  const submitButtonLabel = isSubmitting
    ? t("common.saving")
    : isEditMode
    ? t("common.update")
    : t("common.save");

  return (
    <DashboardLayout activePage="thresholds">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {loadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loadError}</p>
              </div>
            )}

            {isEditMode && isLoadingThreshold && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t("common.loading")}
              </div>
            )}

            {renderFormField("categoryId", t("thresholds.categoryName"), "select", categoryOptions)}

            {renderFormField("threshold", t("thresholds.threshold"), "number")}

            {renderFormField("currency", t("thresholds.currency"), "select", currencyOptions)}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoadingThreshold}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingThreshold}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
