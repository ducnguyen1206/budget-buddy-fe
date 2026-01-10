import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus } from "lucide-react";
import {
  fetchCategoriesForTransaction,
  fetchAccountsForTransaction,
  createTransaction,
  createTransactionCollection,
  updateTransaction,
} from "../../services/transactionService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

const TransactionForm = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;
  const existingTransaction = location.state?.transaction;

  const getTodayDateInputValue = () => {
    // Use local date (not UTC) to avoid off-by-one day in timezones ahead of UTC.
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 10);
  };

  // State
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "",
    categoryId: "",
    targetCategoryId: "",
    accountId: "",
    fromAccountId: "",
    toAccountId: "",
    type: "EXPENSE",
    remarks: "",
    date: getTodayDateInputValue(), // YYYY-MM-DD format (local)
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stagedTransactions, setStagedTransactions] = useState([]);
  const [editingStagedIndex, setEditingStagedIndex] = useState(null);

  // Refs for dropdowns
  const categoryRef = useRef(null);
  const targetCategoryRef = useRef(null);
  const accountRef = useRef(null);
  const fromAccountRef = useRef(null);
  const toAccountRef = useRef(null);
  const typeRef = useRef(null);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTargetCategoryDropdown, setShowTargetCategoryDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showFromAccountDropdown, setShowFromAccountDropdown] = useState(false);
  const [showToAccountDropdown, setShowToAccountDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Search states (removed - only selection allowed)

  // Load form data
  useEffect(() => {
    loadFormData();
  }, []);

  // Utility functions
  const formatAmountForDisplay = (value) => {
    if (!value) return "";
    if (value.startsWith(".")) return value;
    if (value.endsWith(".")) return value; // Allow typing "5." without formatting

    const parts = value.toString().split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    const formattedInteger = integerPart
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "";

    // Don't auto-pad decimals while typing, only format commas
    if (!decimalPart && integerPart) {
      return formattedInteger;
    } else if (decimalPart) {
      // Keep decimal part as-is while typing
      return `${formattedInteger}.${decimalPart}`;
    } else {
      return formattedInteger;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (
        targetCategoryRef.current &&
        !targetCategoryRef.current.contains(event.target)
      ) {
        setShowTargetCategoryDropdown(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
      if (
        fromAccountRef.current &&
        !fromAccountRef.current.contains(event.target)
      ) {
        setShowFromAccountDropdown(false);
      }
      if (
        toAccountRef.current &&
        !toAccountRef.current.contains(event.target)
      ) {
        setShowToAccountDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [categoriesData, accountsData] = await Promise.all([
        fetchCategoriesForTransaction(),
        fetchAccountsForTransaction(),
      ]);

      if (
        shouldRedirectToLogin(categoriesData) ||
        shouldRedirectToLogin(accountsData)
      ) {
        return;
      }

      setCategories(categoriesData || []);
      setAccounts(accountsData || []);

      // Pre-fill form data if editing
      if (isEditMode && existingTransaction) {
        setFormData({
          name: existingTransaction.name || "",
          amount: Math.abs(existingTransaction.amount).toString() || "",
          currency: existingTransaction.currency || "",
          categoryId: existingTransaction.categoryId || "",
          targetCategoryId: existingTransaction.targetCategoryId || "",
          accountId: existingTransaction.accountId || "",
          fromAccountId:
            existingTransaction.categoryType === "TRANSFER"
              ? existingTransaction.accountId
              : "",
          toAccountId: existingTransaction.targetAccountId || "",
          type: existingTransaction.categoryType || "EXPENSE",
          remarks: existingTransaction.remarks || "",
          date: existingTransaction.date || getTodayDateInputValue(),
        });
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Get distinct categories
  const getDistinctCategories = () => {
    const distinct = new Map();
    categories.forEach((category) => {
      if (!distinct.has(category.name)) {
        distinct.set(category.name, category);
      }
    });
    return Array.from(distinct.values());
  };

  // Get types for selected category
  const getTypesForCategory = () => {
    // When editing, only allow EXPENSE and INCOME (no TRANSFER)
    if (isEditMode) {
      return ["EXPENSE", "INCOME"];
    }
    return ["EXPENSE", "INCOME", "TRANSFER"];
  };

  // Get all accounts from all groups
  const getAllAccounts = () => {
    return accounts.flatMap((group) => group.accounts || []);
  };

  // All data (no filtering since only selection is allowed)
  const filteredCategories = getDistinctCategories();
  const filteredAccounts = getAllAccounts();
  const filteredFromAccounts = getAllAccounts();
  const filteredToAccounts = getAllAccounts();

  // Event handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: category.id,
      categoryName: category.name,
      // Reset type when category changes
      type: "EXPENSE",
      targetCategoryId: "",
    }));
    setShowCategoryDropdown(false);
  };

  const handleTargetCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      targetCategoryId: category.id,
    }));
    setShowTargetCategoryDropdown(false);
  };

  const handleAccountSelect = (account) => {
    setFormData((prev) => ({
      ...prev,
      accountId: account.id,
      currency: account.currency,
    }));
    setShowAccountDropdown(false);
  };

  const handleFromAccountSelect = (account) => {
    setFormData((prev) => ({
      ...prev,
      fromAccountId: account.id,
      currency: account.currency,
    }));
    setShowFromAccountDropdown(false);
  };

  const handleToAccountSelect = (account) => {
    setFormData((prev) => ({
      ...prev,
      toAccountId: account.id,
    }));
    setShowToAccountDropdown(false);
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
    }));
    setShowTypeDropdown(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t("validation.nameRequired");
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = t("validation.amountRequired");
    }

    if (!formData.categoryId) {
      errors.category = t("validation.categoryRequired");
    }

    if (formData.type === "TRANSFER") {
      if (!formData.fromAccountId) {
        errors.fromAccount = t("validation.fromAccountRequired");
      }
      if (!formData.toAccountId) {
        errors.toAccount = t("validation.toAccountRequired");
      }
    

      if (!formData.targetCategoryId) {
        errors.targetCategory = t("validation.targetCategoryRequired");
      }
      if (
        formData.categoryId &&
        formData.targetCategoryId &&
        String(formData.categoryId) === String(formData.targetCategoryId)
      ) {
        errors.targetCategory = t("validation.differentCategoriesRequired");
      }
    } else {
      if (!formData.accountId) {
        errors.account = t("validation.accountRequired");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildTransactionPayload = () => {
    const currentDate = formData.date;
    const transactionData = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      date: currentDate,
      remarks: formData.remarks.trim(),
      categoryType: formData.type,
    };

    if (formData.type === "TRANSFER") {
      transactionData.accountId = formData.fromAccountId;
      transactionData.targetAccountId = formData.toAccountId;
      transactionData.targetCategoryId = formData.targetCategoryId;
    } else {
      transactionData.accountId = formData.accountId;
    }

    return transactionData;
  };

  const isFormEffectivelyEmpty = () => {
    return (
      !formData.name.trim() &&
      !formData.amount &&
      !formData.categoryId &&
      !formData.targetCategoryId &&
      !formData.accountId &&
      !formData.fromAccountId &&
      !formData.toAccountId &&
      !formData.remarks.trim()
    );
  };

  const getCurrencyForAccountId = (accountId) => {
    if (!accountId) return "";
    const all = getAllAccounts();
    const account = all.find((a) => String(a.id) === String(accountId));
    return account?.currency || "";
  };

  const handleStageTransaction = () => {
    setError("");
    if (!validateForm()) return;

    const payload = buildTransactionPayload();

    setStagedTransactions((prev) => {
      if (editingStagedIndex === null || editingStagedIndex === undefined) {
        return [...prev, payload];
      }
      return prev.map((tx, idx) => (idx === editingStagedIndex ? payload : tx));
    });

    setEditingStagedIndex(null);
    setFormData((prev) => ({
      ...prev,
      name: "",
      amount: "",
      categoryId: "",
      targetCategoryId: "",
      accountId: "",
      fromAccountId: "",
      toAccountId: "",
      currency: "",
      remarks: "",
      type: "EXPENSE",
      date: prev.date,
    }));
    setValidationErrors({});
  };

  const handleEditStagedTransaction = (tx, index) => {
    setError("");
    setValidationErrors({});
    setEditingStagedIndex(index);

    const type = tx.categoryType || "EXPENSE";
    if (type === "TRANSFER") {
      const fromId = tx.accountId || "";
      const toId = tx.targetAccountId || "";
      setFormData((prev) => ({
        ...prev,
        name: tx.name || "",
        amount: tx.amount != null ? String(tx.amount) : "",
        currency: getCurrencyForAccountId(fromId),
        categoryId: tx.categoryId || "",
        targetCategoryId: tx.targetCategoryId || "",
        accountId: "",
        fromAccountId: fromId,
        toAccountId: toId,
        type,
        remarks: tx.remarks || "",
        date: tx.date || prev.date,
      }));
      return;
    }

    const accountId = tx.accountId || "";
    setFormData((prev) => ({
      ...prev,
      name: tx.name || "",
      amount: tx.amount != null ? String(tx.amount) : "",
      currency: getCurrencyForAccountId(accountId),
      categoryId: tx.categoryId || "",
      targetCategoryId: "",
      accountId,
      fromAccountId: "",
      toAccountId: "",
      type,
      remarks: tx.remarks || "",
      date: tx.date || prev.date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && stagedTransactions.length > 0) {
      const transactionsToCreate = [...stagedTransactions];

      if (!isFormEffectivelyEmpty()) {
        if (!validateForm()) {
          return;
        }
        transactionsToCreate.push(buildTransactionPayload());
      }

      try {
        setLoading(true);

        const result =
          transactionsToCreate.length > 1
            ? await createTransactionCollection(transactionsToCreate)
            : await createTransaction(transactionsToCreate[0]);

        if (result.success) {
          navigate("/transactions");
        } else {
          setError(result.message || t("transactions.createManyFailed"));
        }
      } catch (error) {
        console.error("Error creating transactions:", error);
        setError(t("transactions.createManyFailedTryAgain"));
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Use the date from formData
      const transactionData = buildTransactionPayload();

      let result;
      if (isEditMode) {
        result = await updateTransaction(id, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      if (result.success) {
        navigate("/transactions");
      } else {
        console.error(
          `Transaction ${isEditMode ? "update" : "creation"} failed:`,
          result.message
        );
        setError(
          result.message ||
            `Failed to ${isEditMode ? "update" : "create"} transaction`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} transaction:`,
        error
      );
      setError(
        `Failed to ${
          isEditMode ? "update" : "create"
        } transaction. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    const category = categories.find((cat) => cat.id === formData.categoryId);
    return category ? category.name : "";
  };

  const getSelectedTargetCategoryName = () => {
    const category = categories.find((cat) => cat.id === formData.targetCategoryId);
    return category ? category.name : "";
  };

  // Get selected account name
  const getSelectedAccountName = () => {
    const account = getAllAccounts().find(
      (acc) => acc.id === formData.accountId
    );
    return account ? account.name : "";
  };

  // Get selected from account name
  const getSelectedFromAccountName = () => {
    const account = getAllAccounts().find(
      (acc) => acc.id === formData.fromAccountId
    );
    return account ? account.name : "";
  };

  // Get selected to account name
  const getSelectedToAccountName = () => {
    const account = getAllAccounts().find(
      (acc) => acc.id === formData.toAccountId
    );
    return account ? account.name : "";
  };

  if (loadingData) {
    return (
      <DashboardLayout activePage="transactions">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="transactions">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode
              ? t("transactions.updateTransaction")
              : t("transactions.createTransaction")}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const target = e.target;
              const tag = target && typeof target.tagName === "string" ? target.tagName : "";
              if (tag.toUpperCase() === "TEXTAREA") return;
              e.preventDefault();
            }}
            className="space-y-6"
          >
            {/* Name Field */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.name")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                  validationErrors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder={t("transactions.namePlaceholder")}
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.date")}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                // max={new Date().toISOString().split("T")[0]}
                className="w-full px-6 py-3 border border-gray-300 rounded-2xl text-lg font-inter focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Account Selection - Regular */}
            {formData.type !== "TRANSFER" && (
              <div ref={accountRef} className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                  {t("transactions.account")}
                </label>
                <input
                  type="text"
                  value={getSelectedAccountName()}
                  onChange={() => {}} // Read-only
                  onFocus={() => setShowAccountDropdown(true)}
                  className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                    validationErrors.account
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 cursor-pointer`}
                  placeholder={t("transactions.accountPlaceholder")}
                />
                {showAccountDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                      >
                        {account.name}
                      </div>
                    ))}
                  </div>
                )}
                {validationErrors.account && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.account}
                  </p>
                )}
              </div>
            )}

            {/* Transfer Account Selections */}
            {formData.type === "TRANSFER" && (
              <>
                {/* From Account */}
                <div ref={fromAccountRef} className="relative">
                  <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                    {t("transactions.fromAccount")}
                  </label>
                  <input
                    type="text"
                    value={getSelectedFromAccountName()}
                    onChange={() => {}} // Read-only
                    onFocus={() => setShowFromAccountDropdown(true)}
                    className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                      validationErrors.fromAccount
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 cursor-pointer`}
                    placeholder={t("transactions.fromAccountPlaceholder")}
                  />
                  {showFromAccountDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                      {filteredFromAccounts.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => handleFromAccountSelect(account)}
                          className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                        >
                          {account.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {validationErrors.fromAccount && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.fromAccount}
                    </p>
                  )}
                </div>

                {/* To Account */}
                <div ref={toAccountRef} className="relative">
                  <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                    {t("transactions.toAccount")}
                  </label>
                  <input
                    type="text"
                    value={getSelectedToAccountName()}
                    onChange={() => {}} // Read-only
                    onFocus={() => setShowToAccountDropdown(true)}
                    className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                      validationErrors.toAccount
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 cursor-pointer`}
                    placeholder={t("transactions.toAccountPlaceholder")}
                  />
                  {showToAccountDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                      {filteredToAccounts.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => handleToAccountSelect(account)}
                          className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                        >
                          {account.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {validationErrors.toAccount && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors.toAccount}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Currency Field (Disabled) */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.currency")}
              </label>
              <input
                type="text"
                value={formData.currency}
                disabled
                className="w-full px-6 py-3 border rounded-2xl bg-gray-100 text-lg font-inter text-gray-500 cursor-not-allowed"
              />
              <p className="mt-2 text-gray-500 text-sm font-inter">
                {t("transactions.currencyNote")}
              </p>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.amount")}
              </label>
              <input
                type="text"
                value={formatAmountForDisplay(formData.amount)}
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");
                  // Allow any input that contains only digits and at most one decimal point
                  if (
                    value === "" ||
                    (/^[\d.]*$/.test(value) &&
                      (value.match(/\./g) || []).length <= 1)
                  ) {
                    handleInputChange("amount", value);
                  }
                }}
                onBlur={(e) => {
                  // Format with commas when user finishes typing
                  const value = e.target.value.replace(/,/g, "");
                  if (value && !value.includes(".")) {
                    // Only add .00 for whole numbers
                    handleInputChange("amount", value + ".00");
                  }
                  // Don't auto-pad existing decimals - let user type what they want
                }}
                className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                  validationErrors.amount
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="0.00"
              />
              {validationErrors.amount && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div ref={categoryRef} className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.category")}
              </label>
              <input
                type="text"
                value={getSelectedCategoryName()}
                onChange={() => {}} // Read-only
                onFocus={() => setShowCategoryDropdown(true)}
                className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                  validationErrors.category
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2 cursor-pointer`}
                placeholder={t("transactions.categoryPlaceholder")}
              />
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
              {validationErrors.category && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Target Category Selection (Transfer only) */}
            {formData.type === "TRANSFER" && (
              <div ref={targetCategoryRef} className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                  {t("transactions.toCategory")}
                </label>
                <input
                  type="text"
                  value={getSelectedTargetCategoryName()}
                  onChange={() => {}} // Read-only
                  onFocus={() => setShowTargetCategoryDropdown(true)}
                  className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter ${
                    validationErrors.targetCategory
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 cursor-pointer`}
                  placeholder={t("transactions.toCategoryPlaceholder")}
                />
                {showTargetCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                    {filteredCategories
                      .filter(
                        (category) =>
                          String(category.id) !== String(formData.categoryId)
                      )
                      .map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleTargetCategorySelect(category)}
                          className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                        >
                          {category.name}
                        </div>
                      ))}
                  </div>
                )}
                {validationErrors.targetCategory && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationErrors.targetCategory}
                  </p>
                )}
              </div>
            )}

            {/* Type Selection - Only available after category is selected */}
            <div ref={typeRef} className="relative">
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.type")}
              </label>
              <input
                type="text"
                value={t(`transactions.${formData.type.toLowerCase()}`)}
                onChange={() => {}} // Read-only input
                onFocus={() => setShowTypeDropdown(true)}
                className="w-full px-6 py-3 border border-gray-300 rounded-2xl text-lg font-inter focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                placeholder={t("transactions.typePlaceholder")}
              />
              {showTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {getTypesForCategory().map((type) => (
                    <div
                      key={type}
                      onClick={() => handleTypeSelect(type)}
                      className="px-6 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-lg font-inter"
                    >
                      {t(`transactions.${type.toLowerCase()}`)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remarks Field */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-inter">
                {t("transactions.remarks")}
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                className={`w-full px-6 py-3 border rounded-2xl text-lg font-inter resize-none ${
                  validationErrors.remarks
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder={t("transactions.remarksPlaceholder")}
                rows={3}
              />
              {validationErrors.remarks && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.remarks}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleStageTransaction}
                  disabled={loading}
                  className="inline-flex items-center justify-center h-10 w-10 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    editingStagedIndex !== null
                      ? t("transactions.updateItem")
                      : t("transactions.addToList")
                  }
                  aria-label={
                    editingStagedIndex !== null
                      ? t("transactions.updateItem")
                      : t("transactions.addToList")
                  }
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/transactions")}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-inter"
              >
                {loading
                  ? t("common.saving")
                  : isEditMode
                  ? t("common.update")
                  : stagedTransactions.length > 0
                  ? t("transactions.submitAll")
                  : t("common.save")}
              </button>
            </div>

            {!isEditMode && stagedTransactions.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-900">
                    {t("transactions.pendingTransactions")} ({stagedTransactions.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStagedTransactions([]);
                      setEditingStagedIndex(null);
                    }}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("common.clear")}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg divide-y">
                  {stagedTransactions.map((tx, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 ${
                        editingStagedIndex === index ? "bg-blue-50" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (editingStagedIndex === index) {
                            handleStageTransaction();
                            return;
                          }
                          handleEditStagedTransaction(tx, index);
                        }}
                        disabled={loading}
                        className="min-w-0 text-left flex-1 pr-4 disabled:opacity-50"
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {tx.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {tx.categoryType} • {tx.date}
                        </div>
                        {editingStagedIndex === index && (
                          <div className="text-xs text-blue-700 mt-1">
                            {t("common.editing")}
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStagedTransactions((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          setEditingStagedIndex((prev) => {
                            if (prev === null) return null;
                            if (prev === index) return null;
                            if (prev > index) return prev - 1;
                            return prev;
                          });
                        }}
                        disabled={loading}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("common.remove")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionForm;
