import { useState, useEffect } from "react";
import { fetchTransactions } from "../services/transactionService";

const PAGE_SIZE = 5;

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    page: 0,
    size: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [nameFilter, setNameFilter] = useState({
    operator: "is",
    value: "",
  });

  const loadTransactions = async (page = 0, filterPayload = {}) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTransactions(page, PAGE_SIZE, filterPayload);
      setTransactions(data.transactions || []);

      if (data.pagination) {
        setPagination({
          page: data.pagination.page,
          size: data.pagination.size,
          totalElements: data.pagination.totalElements,
          totalPages: data.pagination.totalPages,
        });
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const applyNameFilter = (filter) => {
    setNameFilter(filter);
    // Only trigger API call if there's a value
    if (filter.value && filter.value.trim() !== "") {
      const filterPayload = {
        name: { operator: filter.operator, value: filter.value.trim() },
      };
      loadTransactions(0, filterPayload);
    }
  };

  const clearNameFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue = nameFilter.value && nameFilter.value.trim() !== "";
    setNameFilter({ operator: "is", value: "" });

    if (hadValue) {
      loadTransactions(currentPage);
    }
  };

  const changePage = (page) => {
    setCurrentPage(page);
    const filterPayload =
      nameFilter.value && nameFilter.value.trim() !== ""
        ? {
            name: {
              operator: nameFilter.operator,
              value: nameFilter.value.trim(),
            },
          }
        : {};
    loadTransactions(page, filterPayload);
  };

  // Filter effect - only when there's a value
  useEffect(() => {
    if (nameFilter.value && nameFilter.value.trim() !== "") {
      const filterPayload = {
        name: {
          operator: nameFilter.operator,
          value: nameFilter.value.trim(),
        },
      };
      loadTransactions(0, filterPayload);
    }
  }, [nameFilter.value]); // Only watch value, not operator

  // Pagination effect - only when no filter
  useEffect(() => {
    if (!nameFilter.value || nameFilter.value.trim() === "") {
      loadTransactions(currentPage);
    }
  }, [currentPage, nameFilter.value]);

  return {
    transactions,
    loading,
    error,
    currentPage,
    pagination,
    nameFilter,
    applyNameFilter,
    clearNameFilter,
    changePage,
    retry: () => loadTransactions(currentPage),
  };
};
