import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { Search, Plus } from "lucide-react";
import { fetchTransactions } from "../../services/transactionService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

const TransactionsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Constants
  const PAGE_SIZE = 10;

  // Load transactions
  const loadTransactions = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTransactions(page, PAGE_SIZE);

      // Check if the result indicates a redirect should happen
      if (shouldRedirectToLogin(data)) {
        console.log(
          "Transactions API returned redirect response - user will be redirected to login"
        );
        return; // The redirect will be handled by the API interceptor
      }

      // Update transactions and pagination from API response
      setTransactions(data.transactions || []);

      // Update pagination with API response data
      if (data.pagination) {
        console.log("📄 Pagination data from API:", data.pagination);
        setPagination({
          page: data.pagination.page,
          size: data.pagination.size,
          totalElements: data.pagination.totalElements,
          totalPages: data.pagination.totalPages,
        });
      } else {
        console.log("⚠️ No pagination data in API response");
        // Fallback if pagination data is missing
        setPagination({
          page: 0,
          size: PAGE_SIZE,
          totalElements: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError(err.message || t("errors.fetchTransactionsFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadTransactions(currentPage);
  }, [currentPage]);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTransaction = () => {
    navigate("/transactions/new");
  };

  const handlePageChange = (newPage) => {
    if (
      newPage >= 0 &&
      newPage < pagination.totalPages &&
      newPage !== currentPage
    ) {
      setCurrentPage(newPage);
      // The useEffect will automatically trigger loadTransactions when currentPage changes
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.sourceAccountName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format amount without currency
  const formatAmount = (amount) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    return formattedAmount;
  };

  // Render pagination
  const renderPagination = () => {
    // Always show pagination info, even for single pages
    if (pagination.totalPages === 0) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages = [];
      const totalPages = pagination.totalPages;
      const current = currentPage;

      // For single page, just show that page
      if (totalPages === 1) {
        return [0];
      }

      // Always show first page
      if (totalPages > 0) pages.push(0);

      // Show pages around current page
      const start = Math.max(1, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 0 && i !== totalPages - 1) {
          pages.push(i);
        }
      }

      // Always show last page if different from first
      if (totalPages > 1) pages.push(totalPages - 1);

      return [...new Set(pages)].sort((a, b) => a - b);
    };

    const pageNumbers = getPageNumbers();

    console.log("🔍 Pagination Debug:", {
      totalPages: pagination.totalPages,
      currentPage,
      pageNumbers,
      totalElements: pagination.totalElements,
    });

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          {t("transactions.showing")} {currentPage * PAGE_SIZE + 1}{" "}
          {t("transactions.to")}{" "}
          {Math.min((currentPage + 1) * PAGE_SIZE, pagination.totalElements)}{" "}
          {t("transactions.of")} {pagination.totalElements}{" "}
          {t("transactions.results")}
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || pagination.totalPages <= 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.previous")}
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {pageNumbers.map((pageNum, index) => {
              const isCurrentPage = pageNum === currentPage;
              const showEllipsis =
                index > 0 && pageNumbers[index - 1] !== pageNum - 1;

              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis && (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      isCurrentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={
              currentPage >= pagination.totalPages - 1 ||
              pagination.totalPages <= 1
            }
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.next")}
          </button>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading) {
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

  // Render error state
  if (error) {
    return (
      <DashboardLayout activePage="transactions">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("dashboard.nav.transactions")}
            </h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadTransactions(currentPage)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="flex items-center py-4 px-6 bg-gray-50 border-b border-gray-200">
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.name")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.amount")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.currency")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.date")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.category")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.account")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.type")}
              </h3>
            </div>
            <div className="flex-1 px-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t("transactions.transferInfo")}
              </h3>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? t("transactions.noTransactionsMatching")
                    : t("transactions.noTransactionsFound")}
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center py-4 px-6 hover:bg-gray-50"
                >
                  <div className="flex-1 px-4">
                    <span className="text-gray-700">{transaction.name}</span>
                  </div>
                  <div className="flex-1 px-4">
                    <span
                      className={`font-medium ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">
                      {transaction.currency}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">{transaction.date}</span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">
                      {transaction.categoryName}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">
                      {transaction.sourceAccountName}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">
                      {transaction.amount > 0
                        ? t("transactions.income")
                        : t("transactions.expense")}
                    </span>
                  </div>
                  <div className="flex-1 px-4">
                    <span className="text-gray-500">
                      {transaction.transferInfo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
