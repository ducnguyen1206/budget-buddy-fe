import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus } from "lucide-react";
import { useTransactions } from "../../hooks/useTransactions";
import {
  NameFilter,
  AmountFilter,
  DateFilter,
  AccountFilter,
  CategoryFilter,
  TypeFilter,
} from "./filters";
import TransactionTable from "./TransactionTable";
import TransactionPagination from "./TransactionPagination";

const TransactionsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
    changePage,
    retry,
  } = useTransactions();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAccountFilter, setShowAccountFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

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

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTransaction = () => {
    navigate("/transactions/new");
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

  const handlePageChange = (page) => {
    changePage(page);
  };

  return (
    <DashboardLayout activePage="transactions">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("dashboard.nav.transactions")}
          </h1>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-6">
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
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t("transactions.new")}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-4 relative z-10">
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
            accounts={uniqueAccounts}
          />
          <CategoryFilter
            categoryFilter={categoryFilter}
            onFilterChange={handleCategoryFilterChange}
            onApply={handleCategoryFilterApply}
            onClear={handleCategoryFilterClear}
            showFilter={showCategoryFilter}
            onToggleFilter={handleToggleCategoryFilter}
            categories={uniqueCategories}
          />
          <TypeFilter
            typeFilter={typeFilter}
            onFilterChange={handleTypeFilterChange}
            onApply={handleTypeFilterApply}
            onClear={handleTypeFilterClear}
            showFilter={showTypeFilter}
            onToggleFilter={handleToggleTypeFilter}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <TransactionTable
            transactions={filteredTransactions}
            loading={loading}
            error={error}
            onRetry={retry}
          />

          {/* Pagination */}
          <TransactionPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalElements={pagination.totalElements}
            pageSize={pagination.size}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
