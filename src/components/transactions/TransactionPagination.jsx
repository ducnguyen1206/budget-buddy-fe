import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const TransactionPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
}) => {
  const { t } = useLanguage();
  if (totalPages === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const totalPagesCount = totalPages;
    const current = currentPage;

    if (totalPagesCount === 1) return [0];
    if (totalPagesCount > 0) pages.push(0);

    const start = Math.max(1, current - 1);
    const end = Math.min(totalPagesCount - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 0 && i !== totalPagesCount - 1) {
        pages.push(i);
      }
    }

    if (totalPagesCount > 1) pages.push(totalPagesCount - 1);

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common.previous")}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common.next")}
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {t("transactions.showing")}{" "}
            <span className="font-medium">{startItem}</span>{" "}
            {t("transactions.to")}{" "}
            <span className="font-medium">{endItem}</span>{" "}
            {t("transactions.of")}{" "}
            <span className="font-medium">{totalElements}</span>{" "}
            {t("transactions.results")}
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pageNum === currentPage
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TransactionPagination;
