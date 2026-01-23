import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createSubscription,
  fetchSubscriptionById,
  updateSubscription,
} from "../../services/subscriptionService";
import { fetchAccounts } from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function SubscriptionForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    payDay: "",
    accountId: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadSubscription();
    }
  }, [isEditMode, id]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const result = await fetchAccounts(t);

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

  const loadSubscription = async () => {
    setIsLoadingSubscription(true);
    setLoadError("");

    const result = await fetchSubscriptionById(id, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success && result.data) {
      const subscription = result.data;
      setFormData({
        name: subscription.name || "",
        amount:
          subscription.amount !== undefined && subscription.amount !== null
            ? String(subscription.amount)
            : "",
        payDay:
          subscription.payDay !== undefined && subscription.payDay !== null
            ? String(subscription.payDay)
            : "",
        accountId:
          subscription.accountId !== undefined && subscription.accountId !== null
            ? String(subscription.accountId)
            : "",
      });
    } else {
      setLoadError(result.error || t("errors.fetchSubscriptionFailed"));
    }

    setIsLoadingSubscription(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent negative values for amount field
    if (name === "amount" && value !== "" && parseFloat(value) < 0) {
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

    if (!formData.name || formData.name.trim() === "") {
      errors.name = t("subscriptions.nameRequired");
    }

    if (!formData.amount || formData.amount.trim() === "") {
      errors.amount = t("subscriptions.amountRequired");
    } else {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        errors.amount = t("subscriptions.amountRequired");
      }
    }

    if (!formData.payDay || formData.payDay.trim() === "") {
      errors.payDay = t("subscriptions.payDayRequired");
    } else {
      const payDayValue = parseInt(formData.payDay, 10);
      if (isNaN(payDayValue) || payDayValue < 1 || payDayValue > 31) {
        errors.payDay = t("subscriptions.payDayInvalid");
      }
    }

    if (!formData.accountId) {
      errors.accountId = t("subscriptions.accountRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (isLoadingSubscription) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      payDay: parseInt(formData.payDay, 10),
      accountId: parseInt(formData.accountId, 10),
    };

    const result = isEditMode
      ? await updateSubscription(id, payload, t)
      : await createSubscription(payload, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      navigate("/subscriptions");
    } else {
      setSubmitError(
        result.error ||
          (isEditMode
            ? t("errors.updateSubscriptionFailed")
            : t("errors.createSubscriptionFailed"))
      );
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => navigate("/subscriptions");

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
          disabled={(loadingAccounts && fieldName === "accountId") || isLoadingSubscription}
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
            {t("subscriptions.selectAccount")}
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
          step={type === "number" ? (fieldName === "payDay" ? "1" : "0.01") : undefined}
          min={type === "number" ? (fieldName === "payDay" ? "1" : "0.01") : undefined}
          max={fieldName === "payDay" ? "31" : undefined}
          disabled={isLoadingSubscription}
          className={`w-full max-w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={
            fieldName === "amount"
              ? t("subscriptions.amountPlaceholder")
              : fieldName === "payDay"
              ? t("subscriptions.payDayPlaceholder")
              : fieldName === "name"
              ? t("subscriptions.namePlaceholder")
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
      accounts
        .filter((account) => account.id !== undefined && account.id !== null)
        .map((account) => ({
          value: account.id,
          label: account.accountType
            ? `${account.name} (${account.accountType})`
            : account.name,
        })),
    [accounts]
  );

  const pageTitle = isEditMode
    ? t("subscriptions.editSubscription")
    : t("subscriptions.createSubscription");

  const submitButtonLabel = isSubmitting
    ? t("common.saving")
    : isEditMode
    ? t("common.update")
    : t("common.save");

  return (
    <DashboardLayout activePage="subscriptions">
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

            {isEditMode && isLoadingSubscription && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t("common.loading")}
              </div>
            )}

            {renderFormField("accountId", t("subscriptions.account"), "select", accountOptions)}

            {renderFormField("name", t("subscriptions.name"), "text")}

            {renderFormField("amount", t("subscriptions.amount"), "number")}

            {renderFormField("payDay", t("subscriptions.payDay"), "number")}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoadingSubscription}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingSubscription}
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
