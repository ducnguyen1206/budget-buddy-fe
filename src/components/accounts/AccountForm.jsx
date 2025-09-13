import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import DashboardLayout from "../dashboard/DashboardLayout";
import FormField from "../common/FormField";
import ErrorMessage from "../common/ErrorMessage";
import {
  fetchAccountTypes,
  createAccount,
  updateAccount,
  fetchAccount,
} from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

// Constants
const CURRENCY_OPTIONS = [
  { value: "SGD", label: "SGD" },
  { value: "VND", label: "VND" },
];

const INITIAL_FORM_DATA = {
  name: "",
  balance: "",
  currency: "SGD",
  type: "",
};

export default function AccountForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountTypes, setAccountTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errors, setErrors] = useState({});
  const [showAccountTypeDropdown, setShowAccountTypeDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // Refs
  const accountTypeRef = useRef(null);
  const currencyRef = useRef(null);

  // Utility functions
  const formatBalanceForDisplay = (value) => {
    if (!value) return "";
    if (value.startsWith(".")) return value;

    const parts = value.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = integerPart
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "";

    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Data loading functions
  const loadAccountTypes = async () => {
    try {
      setLoadingTypes(true);
      const result = await fetchAccountTypes(t);

      if (result.success) {
        setAccountTypes(result.data.accountTypes || []);
      } else {
        setError(result.error || t("errors.fetchAccountTypesFailed"));
      }
    } catch (error) {
      console.error("Error loading account types:", error);
      setError(t("errors.fetchAccountTypesFailed"));
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadAccountData = async () => {
    if (!isEditMode) return;

    try {
      setLoading(true);
      const result = await fetchAccount(id, t);

      if (shouldRedirectToLogin(result)) return;

      if (result.success) {
        const account = result.data;
        const formattedBalance = account.balance
          ? formatBalanceForDisplay(account.balance.toString())
          : "";

        setFormData({
          name: account.name || "",
          balance: formattedBalance,
          currency: account.currency || "SGD",
          type: account.type || "",
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error loading account:", err);
      setError(t("errors.fetchAccountFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadAccountTypes();
    loadAccountData();
  }, [t, id, isEditMode]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountTypeRef.current &&
        !accountTypeRef.current.contains(event.target)
      ) {
        setShowAccountTypeDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Event handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleBalanceChange = (value) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");

    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
      return;
    }

    setFormData((prev) => ({ ...prev, balance: cleanValue }));
    clearFieldError("balance");
  };

  const handleAccountTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setShowAccountTypeDropdown(false);
    clearFieldError("type");
  };

  const handleCurrencySelect = (currency) => {
    setFormData((prev) => ({ ...prev, currency }));
    setShowCurrencyDropdown(false);
    clearFieldError("currency");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("validation.nameMinLength");
    }

    if (!formData.balance) {
      newErrors.balance = t("validation.balanceRequired");
    } else {
      const cleanBalance = formData.balance.replace(/,/g, "");
      const balance = parseFloat(cleanBalance);
      if (isNaN(balance)) {
        newErrors.balance = t("validation.balanceInvalid");
      } else if (balance < 0) {
        newErrors.balance = t("validation.balancePositive");
      }
    }

    if (!formData.currency) {
      newErrors.currency = t("validation.currencyRequired");
    }

    if (!formData.type) {
      newErrors.type = t("validation.accountTypeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const accountData = {
        name: formData.name.trim(),
        balance: parseFloat(formData.balance.replace(/,/g, "")),
        currency: formData.currency,
        type: formData.type,
      };

      const result = isEditMode
        ? await updateAccount(id, accountData, t)
        : await createAccount(accountData, t);

      if (result.success) {
        navigate("/accounts");
      } else {
        const errorKey = isEditMode
          ? "updateAccountFailed"
          : "createAccountFailed";
        setError(result.error || t(`errors.${errorKey}`));
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} account:`,
        error
      );
      const errorKey = isEditMode
        ? "updateAccountFailed"
        : "createAccountFailed";
      setError(t(`errors.${errorKey}`));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/accounts");

  return (
    <DashboardLayout activePage="accounts">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode
              ? t("accounts.updateAccount")
              : t("accounts.createAccount")}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && <ErrorMessage message={error} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Name */}
            <FormField
              label={t("accounts.name")}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              placeholder={t("accounts.namePlaceholder")}
              required
            />

            {/* Available Balance */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("accounts.availableBalance")}
              </label>
              <input
                type="text"
                value={formData.balance}
                onChange={(e) => handleBalanceChange(e.target.value)}
                onBlur={() => {
                  // Apply formatting when user finishes typing
                  if (formData.balance && !formData.balance.startsWith(".")) {
                    const formatted = formatBalanceForDisplay(formData.balance);
                    setFormData((prev) => ({
                      ...prev,
                      balance: formatted,
                    }));
                  }
                }}
                onFocus={() => {
                  // Remove formatting when user starts typing
                  if (formData.balance) {
                    const unformatted = formData.balance.replace(/,/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      balance: unformatted,
                    }));
                  }
                }}
                placeholder={t("accounts.balancePlaceholder")}
                className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-colors bg-white text-lg font-inter ${
                  errors.balance
                    ? "border-error focus:ring-error"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.balance && (
                <p className="mt-2 text-error text-sm font-inter">
                  {errors.balance}
                </p>
              )}
            </div>

            {/* Currency */}
            <div ref={currencyRef} className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("accounts.currency")}
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={() => {}} // Read-only input
                onFocus={() => setShowCurrencyDropdown(true)}
                placeholder={t("accounts.selectCurrency")}
                className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-colors bg-white text-lg font-inter cursor-pointer ${
                  errors.currency
                    ? "border-error focus:ring-error"
                    : "border-gray-300"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 1.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
                required
                readOnly
              />

              {/* Dropdown */}
              {showCurrencyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {CURRENCY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleCurrencySelect(option.value)}
                      className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}

              {errors.currency && (
                <p className="mt-2 text-error text-sm font-inter">
                  {errors.currency}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div ref={accountTypeRef} className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("accounts.accountType")}
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={() => {}} // Read-only input
                onFocus={() => setShowAccountTypeDropdown(true)}
                placeholder={
                  loadingTypes
                    ? t("accounts.loadingAccountTypes")
                    : t("accounts.selectAccountType")
                }
                className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-colors bg-white text-lg font-inter cursor-pointer ${
                  errors.type
                    ? "border-error focus:ring-error"
                    : "border-gray-300"
                }`}
                required
                readOnly
              />

              {/* Dropdown */}
              {showAccountTypeDropdown && accountTypes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {accountTypes.map((type) => (
                    <div
                      key={type}
                      onClick={() => handleAccountTypeSelect(type)}
                      className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}

              {errors.type && (
                <p className="mt-2 text-error text-sm font-inter">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading || loadingTypes}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common.saving")
                  : isEditMode
                  ? t("common.update")
                  : t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
