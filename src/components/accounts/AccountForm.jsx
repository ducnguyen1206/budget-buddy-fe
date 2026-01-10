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
  balance: "0",
  currency: "SGD",
  type: "",
  savingAccount: false,
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
  const [accountTypeSearch, setAccountTypeSearch] = useState("");

  // Refs
  const accountTypeRef = useRef(null);
  const currencyRef = useRef(null);

  // Utility functions
  const formatBalanceForDisplay = (value) => {
    if (!value) return "0";
    if (value.startsWith(".")) return value;

    const parts = value.toString().split(".");
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

        setFormData({
          name: account.name || "",
          balance: account.balance ? account.balance.toString() : "0",
          currency: account.currency || "SGD",
          type: account.type || "",
          savingAccount: Boolean(account.savingAccount),
        });
        setAccountTypeSearch(account.type || "");
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

  const handleAccountTypeInputChange = (e) => {
    const value = e.target.value;
    setAccountTypeSearch(value);
    setFormData((prev) => ({ ...prev, type: value }));
    setShowAccountTypeDropdown(true);
    clearFieldError("type");
  };

  const handleAccountTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setAccountTypeSearch(type);
    setShowAccountTypeDropdown(false);
    clearFieldError("type");
  };

  const handleCurrencySelect = (currency) => {
    setFormData((prev) => ({ ...prev, currency }));
    setShowCurrencyDropdown(false);
    clearFieldError("currency");
  };

  // Filter account types based on search
  const filteredAccountTypes = accountTypes.filter((type) =>
    type.toLowerCase().includes(accountTypeSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("validation.nameMinLength");
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
        balance: isEditMode
          ? parseFloat(formData.balance.replace(/,/g, ""))
          : 0,
        currency: formData.currency,
        type: formData.type,
        savingAccount: Boolean(formData.savingAccount),
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
                value={formatBalanceForDisplay(formData.balance)}
                disabled
                className={`w-full px-6 py-3 pr-16 border rounded-2xl bg-gray-100 text-lg font-inter cursor-not-allowed ${
                  parseFloat(formData.balance.replace(/,/g, "")) < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              />
              <p className="mt-2 text-gray-500 text-sm font-inter">
                {t("accounts.balanceDisabledNote")}
              </p>
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
                value={accountTypeSearch}
                onChange={handleAccountTypeInputChange}
                onFocus={() => setShowAccountTypeDropdown(true)}
                placeholder={
                  loadingTypes
                    ? t("accounts.loadingAccountTypes")
                    : t("accounts.selectAccountType")
                }
                className={`w-full px-6 py-3 pr-16 border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-colors bg-white text-lg font-inter ${
                  errors.type
                    ? "border-error focus:ring-error"
                    : "border-gray-300"
                }`}
                required
              />

              {/* Dropdown */}
              {showAccountTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {filteredAccountTypes.length > 0
                    ? filteredAccountTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() => handleAccountTypeSelect(type)}
                          className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {type}
                        </div>
                      ))
                    : accountTypeSearch.trim() && (
                        <div
                          onClick={() =>
                            handleAccountTypeSelect(accountTypeSearch.trim())
                          }
                          className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter rounded-2xl text-blue-600"
                        >
                          {accountTypeSearch.trim()}
                        </div>
                      )}
                </div>
              )}

              {errors.type && (
                <p className="mt-2 text-error text-sm font-inter">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Saving Account */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("accounts.savingAccount")}
              </label>
              <label className="inline-flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(formData.savingAccount)}
                  onChange={(e) =>
                    handleInputChange("savingAccount", e.target.checked)
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 font-inter">
                  {t("accounts.savingAccountHint")}
                </span>
              </label>
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
