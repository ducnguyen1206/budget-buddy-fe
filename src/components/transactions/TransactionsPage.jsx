import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import { fetchCategories } from "../../services/categoryService";
import { fetchAccounts } from "../../services/accountService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";
import {
  NameFilter,
  AmountFilter,
  DateFilter,
  AccountFilter,
  CategoryFilter,
  TypeFilter,
  RemarksFilter,
  CurrencyFilter,
} from "./filters";
import TransactionTable from "./TransactionTable";
import TransactionPagination from "./TransactionPagination";

const TransactionsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loadedDropdownDataRef = useRef(false);
  const [categoriesForDropdown, setCategoriesForDropdown] = useState([]);
  const [accountsForDropdown, setAccountsForDropdown] = useState([]);

  // Custom hook for transaction management
  const {
    transactions,
    loading,
    error,
    currentPage,
    pagination,
    nameFilter,
    amountFilter,
    dateFilter,
    accountFilter,
    categoryFilter,
    typeFilter,
    remarksFilter,
    currencyFilter,
    applyNameFilter,
    clearNameFilter,
    applyAmountFilter,
    clearAmountFilter,
    applyDateFilter,
    clearDateFilter,
    applyAccountFilter,
    clearAccountFilter,
    applyCategoryFilter,
    clearCategoryFilter,
    applyTypeFilter,
    clearTypeFilter,
    applyRemarksFilter,
    clearRemarksFilter,
    applyCurrencyFilter,
    clearCurrencyFilter,
    sorting,
    handleSort,
    changePage,
    retry,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAccountFilter, setShowAccountFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showRemarksFilter, setShowRemarksFilter] = useState(false);
  const [showCurrencyFilter, setShowCurrencyFilter] = useState(false);

  // Fetch dropdown data once when landing on this page
  useEffect(() => {
    if (loadedDropdownDataRef.current) return;
    loadedDropdownDataRef.current = true;

    const loadDropdownData = async () => {
      const [categoriesResult, accountsResult] = await Promise.all([
        fetchCategories(),
        fetchAccounts(),
      ]);

      if (
        shouldRedirectToLogin(categoriesResult) ||
        shouldRedirectToLogin(accountsResult)
      ) {
        return;
      }

      if (categoriesResult?.success) {
        const categories = Array.isArray(categoriesResult.data)
          ? categoriesResult.data
          : [];
        setCategoriesForDropdown(categories);
      }

      if (accountsResult?.success) {
        const raw = accountsResult.data;
        const groups = Array.isArray(raw) ? raw : [];
        const flatAccounts = groups.flatMap((g) => g.accounts || []);
        setAccountsForDropdown(flatAccounts);
      }
    };

    void loadDropdownData();
  }, []);

  // Extract unique accounts from transactions
  const getUniqueAccounts = () => {
    const accountMap = new Map();
    transactions.forEach((transaction) => {
      if (transaction.accountId && transaction.sourceAccountName) {
        accountMap.set(transaction.accountId, {
          id: transaction.accountId,
          name: transaction.sourceAccountName,
          sourceAccountName: transaction.sourceAccountName,
          currency: transaction.currency,
          accountType: transaction.sourceAccountType || "Unknown",
        });
      }
    });
    return Array.from(accountMap.values());
  };

  const uniqueAccounts = getUniqueAccounts();

  // Extract unique categories from transactions
  const getUniqueCategories = () => {
    const categoryMap = new Map();
    transactions.forEach((transaction) => {
      if (transaction.categoryId && transaction.categoryName) {
        categoryMap.set(transaction.categoryId, {
          id: transaction.categoryId,
          name: transaction.categoryName,
          categoryName: transaction.categoryName,
          categoryType: transaction.categoryType || "Unknown",
        });
      }
    });
    return Array.from(categoryMap.values());
  };

  const uniqueCategories = getUniqueCategories();

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      searchTerm === "" ||
      transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sourceAccountName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCurrency = useMemo(() => {
    const list = currencyFilter?.currencies || [];
    return list.length === 1 ? list[0] : null;
  }, [currencyFilter]);

  const totalAmount = useMemo(() => {
    if (!totalCurrency) return null;
    return filteredTransactions.reduce((sum, tx) => {
      const value = Number(tx?.amount);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  }, [filteredTransactions, totalCurrency]);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).format(amount ?? 0);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTransaction = () => {
    navigate("/transactions/new");
  };

  const handleEdit = (transaction) => {
    // Navigate to edit page with transaction data
    navigate(`/transactions/edit/${transaction.id}`, {
      state: { transaction },
    });
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const handleFilterChange = (newFilter) => {
    applyNameFilter(newFilter);
  };

  const handleFilterApply = (newFilter) => {
    applyNameFilter(newFilter);
    setShowNameFilter(false);
  };

  const handleFilterClear = () => {
    clearNameFilter();
    setShowNameFilter(false);
  };

  const handleToggleFilter = () => {
    setShowNameFilter(!showNameFilter);
  };

  const handleAmountFilterChange = (newFilter) => {
    applyAmountFilter(newFilter);
  };

  const handleAmountFilterApply = (newFilter) => {
    applyAmountFilter(newFilter);
    setShowAmountFilter(false);
  };

  const handleAmountFilterClear = () => {
    clearAmountFilter();
    setShowAmountFilter(false);
  };

  const handleToggleAmountFilter = () => {
    setShowAmountFilter(!showAmountFilter);
  };

  const handleDateFilterChange = (newFilter) => {
    applyDateFilter(newFilter);
  };

  const handleDateFilterApply = (newFilter) => {
    applyDateFilter(newFilter);
    setShowDateFilter(false);
  };

  const handleDateFilterClear = () => {
    clearDateFilter();
    setShowDateFilter(false);
  };

  const handleToggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  const handleAccountFilterChange = (newFilter) => {
    applyAccountFilter(newFilter);
  };

  const handleAccountFilterApply = (newFilter) => {
    applyAccountFilter(newFilter);
    setShowAccountFilter(false);
  };

  const handleAccountFilterClear = () => {
    clearAccountFilter();
    setShowAccountFilter(false);
  };

  const handleToggleAccountFilter = () => {
    setShowAccountFilter(!showAccountFilter);
  };

  const handleCategoryFilterChange = (newFilter) => {
    applyCategoryFilter(newFilter);
  };

  const handleCategoryFilterApply = (newFilter) => {
    applyCategoryFilter(newFilter);
    setShowCategoryFilter(false);
  };

  const handleCategoryFilterClear = () => {
    clearCategoryFilter();
    setShowCategoryFilter(false);
  };

  const handleToggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };

  // Type filter handlers
  const handleTypeFilterChange = (newFilter) => {
    applyTypeFilter(newFilter);
  };

  const handleTypeFilterApply = (newFilter) => {
    applyTypeFilter(newFilter);
    setShowTypeFilter(false);
  };

  const handleTypeFilterClear = () => {
    clearTypeFilter();
    setShowTypeFilter(false);
  };

  const handleToggleTypeFilter = () => {
    setShowTypeFilter(!showTypeFilter);
  };

  // Remarks filter handlers
  const handleRemarksFilterChange = (newFilter) => {
    applyRemarksFilter(newFilter);
  };

  const handleRemarksFilterApply = (newFilter) => {
    applyRemarksFilter(newFilter);
    setShowRemarksFilter(false);
  };

  const handleRemarksFilterClear = () => {
    clearRemarksFilter();
    setShowRemarksFilter(false);
  };

  const handleToggleRemarksFilter = () => {
    setShowRemarksFilter(!showRemarksFilter);
  };

  // Currency filter handlers
  const handleCurrencyFilterChange = (newFilter) => {
    applyCurrencyFilter(newFilter);
  };

  const handleCurrencyFilterApply = (newFilter) => {
    applyCurrencyFilter(newFilter);
    setShowCurrencyFilter(false);
  };

  const handleCurrencyFilterClear = () => {
    clearCurrencyFilter();
    setShowCurrencyFilter(false);
  };

  const handleToggleCurrencyFilter = () => {
    setShowCurrencyFilter(!showCurrencyFilter);
  };

  const handlePageChange = (page) => {
    changePage(page);
  };

  return (
    <DashboardLayout activePage="transactions">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.transactions")}
          </h1>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("transactions.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:border-b-2 focus:border-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleNewTransaction}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t("transactions.new")}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 relative z-10">
          <NameFilter
            nameFilter={nameFilter}
            onFilterChange={handleFilterChange}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            showFilter={showNameFilter}
            onToggleFilter={handleToggleFilter}
          />
          <AmountFilter
            amountFilter={amountFilter}
            onFilterChange={handleAmountFilterChange}
            onApply={handleAmountFilterApply}
            onClear={handleAmountFilterClear}
            showFilter={showAmountFilter}
            onToggleFilter={handleToggleAmountFilter}
          />
          <DateFilter
            dateFilter={dateFilter}
            onFilterChange={handleDateFilterChange}
            onApply={handleDateFilterApply}
            onClear={handleDateFilterClear}
            showFilter={showDateFilter}
            onToggleFilter={handleToggleDateFilter}
          />
          <AccountFilter
            accountFilter={accountFilter}
            onFilterChange={handleAccountFilterChange}
            onApply={handleAccountFilterApply}
            onClear={handleAccountFilterClear}
            showFilter={showAccountFilter}
            onToggleFilter={handleToggleAccountFilter}
            accounts={accountsForDropdown}
          />
          <CategoryFilter
            categoryFilter={categoryFilter}
            onFilterChange={handleCategoryFilterChange}
            onApply={handleCategoryFilterApply}
            onClear={handleCategoryFilterClear}
            showFilter={showCategoryFilter}
            onToggleFilter={handleToggleCategoryFilter}
            categories={categoriesForDropdown}
          />
          <TypeFilter
            typeFilter={typeFilter}
            onFilterChange={handleTypeFilterChange}
            onApply={handleTypeFilterApply}
            onClear={handleTypeFilterClear}
            showFilter={showTypeFilter}
            onToggleFilter={handleToggleTypeFilter}
          />
          <RemarksFilter
            remarksFilter={remarksFilter}
            onFilterChange={handleRemarksFilterChange}
            onApply={handleRemarksFilterApply}
            onClear={handleRemarksFilterClear}
            showFilter={showRemarksFilter}
            onToggleFilter={handleToggleRemarksFilter}
          />
          <CurrencyFilter
            currencyFilter={currencyFilter}
            onFilterChange={handleCurrencyFilterChange}
            onApply={handleCurrencyFilterApply}
            onClear={handleCurrencyFilterClear}
            showFilter={showCurrencyFilter}
            onToggleFilter={handleToggleCurrencyFilter}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <TransactionTable
            transactions={filteredTransactions}
            loading={loading}
            error={error}
            onRetry={retry}
            sorting={sorting}
            onSort={handleSort}
            onUpdate={updateTransaction}
            categories={categoriesForDropdown}
            accounts={accountsForDropdown}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <TransactionPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalElements={pagination.totalElements}
            pageSize={pagination.size}
          />

          {totalAmount !== null && (
            <div className="px-6 py-4 border-t border-black flex justify-start">
              <div className="text-base font-semibold text-gray-900">
                Total: {formatAmount(totalAmount)} {totalCurrency}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t("transactions.deleteTransaction")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("transactions.deleteConfirmation", {
                name: transactionToDelete?.name,
              })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionsPage;
