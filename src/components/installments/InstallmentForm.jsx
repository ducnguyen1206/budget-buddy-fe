import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  createInstallment,
  fetchInstallmentById,
  updateInstallment,
} from "../../services/installmentService";
import { fetchAccounts } from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function InstallmentForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    amountPaid: "",
    dueDate: "",
    accountId: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingInstallment, setIsLoadingInstallment] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadInstallment();
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

  const loadInstallment = async () => {
    setIsLoadingInstallment(true);
    setLoadError("");

    const result = await fetchInstallmentById(id, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success && result.data) {
      const installment = result.data;
      setFormData({
        name: installment.name || "",
        totalAmount:
          installment.totalAmount !== undefined && installment.totalAmount !== null
            ? String(installment.totalAmount)
            : "",
        amountPaid:
          installment.amountPaid !== undefined && installment.amountPaid !== null
            ? String(installment.amountPaid)
            : "",
        dueDate: toDateInputValue(installment.dueDate),
        accountId:
          installment.accountId !== undefined && installment.accountId !== null
            ? String(installment.accountId)
            : "",
      });
    } else {
      setLoadError(result.error || t("errors.fetchInstallmentFailed"));
    }

    setIsLoadingInstallment(false);
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

    if (!formData.name || formData.name.trim() === "") {
      errors.name = t("installments.nameRequired");
    }

    if (!formData.totalAmount || formData.totalAmount.trim() === "") {
      errors.totalAmount = t("installments.totalAmountRequired");
    } else {
      const totalValue = parseFloat(formData.totalAmount);
      if (isNaN(totalValue) || totalValue <= 0) {
        errors.totalAmount = t("installments.totalAmountRequired");
      }
    }

    if (formData.amountPaid && parseFloat(formData.amountPaid) < 0) {
      errors.amountPaid = t("installments.amountPaidInvalid");
    }

    if (!formData.accountId) {
      errors.accountId = t("installments.accountRequired");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (isLoadingInstallment) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      totalAmount: parseFloat(formData.totalAmount),
      amountPaid: parseFloat(formData.amountPaid) || 0,
      dueDate: formData.dueDate || null,
      accountId: parseInt(formData.accountId, 10),
    };

    const result = isEditMode
      ? await updateInstallment(id, payload, t)
      : await createInstallment(payload, t);

    if (shouldRedirectToLogin(result)) {
      return;
    }

    if (result.success) {
      navigate("/installments");
    } else {
      setSubmitError(
        result.error ||
          (isEditMode
            ? t("errors.updateInstallmentFailed")
            : t("errors.createInstallmentFailed"))
      );
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => navigate("/installments");

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
          disabled={(loadingAccounts && fieldName === "accountId") || isLoadingInstallment}
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
              ? t("installments.selectAccount")
              : t("installments.selectCurrency")}
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
          disabled={isLoadingInstallment}
          className={`w-full max-w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border ${
            validationErrors[fieldName] ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={
            fieldName === "totalAmount"
              ? t("installments.totalAmountPlaceholder")
              : fieldName === "amountPaid"
              ? t("installments.amountPaidPlaceholder")
              : fieldName === "name"
              ? t("installments.namePlaceholder")
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

  const pageTitle = isEditMode
    ? t("installments.editInstallment")
    : t("installments.createInstallment");

  const submitButtonLabel = isSubmitting
    ? t("common.saving")
    : isEditMode
    ? t("common.update")
    : t("common.save");

  return (
    <DashboardLayout activePage="installments">
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

            {isEditMode && isLoadingInstallment && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t("common.loading")}
              </div>
            )}

            {renderFormField("accountId", t("installments.account"), "select", accountOptions)}

            {renderFormField("name", t("installments.name"), "text")}

            {renderFormField("totalAmount", t("installments.totalAmount"), "number")}

            {renderFormField("amountPaid", t("installments.amountPaid"), "number")}

            {renderFormField("dueDate", t("installments.dueDate"), "date")}

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoadingInstallment}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingInstallment}
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
