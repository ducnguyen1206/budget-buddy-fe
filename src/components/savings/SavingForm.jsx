import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createSaving,
  updateSaving,
  fetchSavingById,
} from "../../services/savingService";
import { fetchAccounts } from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function SavingForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    accountId: "",
    name: "",
    amount: "",
    currency: "SGD",
    notes: "",
    date: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadSaving();
    }
  }, [isEditMode, id]);

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const result = await fetchAccounts(t, { savingAccount: true });

      if (shouldRedirectToLogin(result)) {
        return;
      }

      if (result.success) {
        const flat = (result.data || []).flatMap((group) =>
          (group.accounts || []).map((account) => ({
            ...account,
            accountType: group.accountType,
          }))
        );
        setAccounts(flat);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadSaving = async () => {
    setIsLoadingSaving(true);
    setLoadError("");

    const result = await fetchSavingById(id, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success && result.data) {
      const saving = result.data;
      setFormData({
        accountId:
          saving.accountId !== undefined && saving.accountId !== null
            ? String(saving.accountId)
            : "",
        name: saving.name || "",
        amount:
          saving.amount !== undefined && saving.amount !== null
            ? String(saving.amount)
            : "",
        currency: saving.currency || "SGD",
        notes: saving.notes || "",
        date: toDateInputValue(saving.date || saving.updatedAt || saving.createdAt),
      });
    } else {
      setLoadError(result.error || t("errors.fetchSavingFailed"));
    }

    setIsLoadingSaving(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    if (!formData.accountId) {
      errors.accountId = t("validation.accountRequired");
    }

    if (!formData.name || formData.name.trim() === "") {
      errors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      errors.name = t("validation.nameMinLength");
    }

    if (!formData.amount || formData.amount.trim() === "") {
      errors.amount = t("validation.amountRequired");
    } else {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue)) {
        errors.amount = t("validation.amountInvalid");
      }
      // Allow negative amounts; no lower-bound check
    }

    if (!formData.currency) {
      errors.currency = t("validation.currencyRequired");
    }

    if (!formData.date) {
      errors.date = t("validation.dateRequired") || "Date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (isLoadingSaving) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      accountId: parseInt(formData.accountId, 10),
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      notes: formData.notes?.trim() || "",
      date: formData.date,
    };

    const result = isEditMode
      ? await updateSaving(id, payload, t)
      : await createSaving(payload, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      navigate("/savings");
    } else {
      setSubmitError(
        result.error ||
          (isEditMode
            ? t("errors.updateSavingFailed")
            : t("errors.createSavingFailed"))
      );
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => navigate("/savings");

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
          disabled={(loadingAccounts && fieldName === "accountId") || isLoadingSaving}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out appearance-none bg-white ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          } ${
            loadingAccounts && fieldName === "accountId"
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
          <option value="" className="py-2">
            {fieldName === "accountId"
              ? t("savings.selectAccount")
              : t("savings.selectCurrency")}
          </option>
          {options?.map((option) => (
            <option key={option.value} value={option.value} className="py-2">
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={fieldName}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          disabled={isLoadingSaving}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={fieldName === "notes" ? t("savings.notesPlaceholder") : ""}
        />
      ) : (
        <input
          type={type}
          id={fieldName}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          step={type === "number" ? "0.01" : undefined}
          disabled={isLoadingSaving}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={
            fieldName === "amount"
              ? t("savings.amountPlaceholder")
              : fieldName === "name"
              ? t("savings.namePlaceholder")
              : ""
          }
        />
      )}

      {validationErrors[fieldName] && (
        <p className="mt-1 text-sm text-red-600">{validationErrors[fieldName]}</p>
      )}
    </div>
  );

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: account.accountType
          ? `${account.name} (${account.accountType})`
          : account.name,
      })),
    [accounts]
  );

  const currencyOptions = useMemo(
    () => [
      { value: "SGD", label: "SGD" },
      { value: "VND", label: "VND" },
    ],
    []
  );

  const pageTitle = isEditMode ? t("savings.editSaving") : t("savings.createSaving");

  const submitButtonLabel = isSubmitting
    ? t("common.saving")
    : isEditMode
    ? t("common.update")
    : t("common.save");

  return (
    <DashboardLayout activePage="savings">
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

            {isEditMode && isLoadingSaving && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t("common.loading")}
              </div>
            )}

            {renderFormField("accountId", t("savings.account"), "select", accountOptions)}

            {renderFormField("name", t("savings.name"), "text")}

            {renderFormField("amount", t("savings.amount"), "number")}

            {renderFormField("currency", t("savings.currency"), "select", currencyOptions)}

            {renderFormField("date", t("savings.date"), "date")}

            {renderFormField("notes", t("savings.notes"), "textarea")}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoadingSaving}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingSaving}
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
