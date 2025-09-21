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
  const [amountFilter, setAmountFilter] = useState({
    operator: "=",
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

  const applyAmountFilter = (filter) => {
    setAmountFilter(filter);
    // Only trigger API call if there's a value (handle both string and numeric values)
    if (
      filter.value !== "" &&
      filter.value !== null &&
      filter.value !== undefined
    ) {
      const filterPayload = {
        amount: { operator: filter.operator, value: filter.value },
      };
      console.log("Amount filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearAmountFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue =
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined;
    setAmountFilter({ operator: "=", value: "" });

    if (hadValue) {
      loadTransactions(currentPage);
    }
  };

  const changePage = (page) => {
    setCurrentPage(page);

    // Build filter payload with both name and amount filters
    const filterPayload = {};
    if (nameFilter.value && nameFilter.value.trim() !== "") {
      filterPayload.name = {
        operator: nameFilter.operator,
        value: nameFilter.value.trim(),
      };
    }
    if (
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined
    ) {
      filterPayload.amount = {
        operator: amountFilter.operator,
        value: amountFilter.value,
      };
    }

    loadTransactions(page, filterPayload);
  };

  // Filter effect - only when there's a value
  useEffect(() => {
    const filterPayload = {};
    let hasFilters = false;

    if (nameFilter.value && nameFilter.value.trim() !== "") {
      filterPayload.name = {
        operator: nameFilter.operator,
        value: nameFilter.value.trim(),
      };
      hasFilters = true;
    }

    if (
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined
    ) {
      filterPayload.amount = {
        operator: amountFilter.operator,
        value: amountFilter.value,
      };
      hasFilters = true;
    }

    if (hasFilters) {
      loadTransactions(0, filterPayload);
    }
  }, [nameFilter.value, amountFilter.value]); // Watch both filter values

  // Pagination effect - only when no filter
  useEffect(() => {
    const hasNameFilter = nameFilter.value && nameFilter.value.trim() !== "";
    const hasAmountFilter =
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined;

    if (!hasNameFilter && !hasAmountFilter) {
      loadTransactions(currentPage);
    }
  }, [currentPage, nameFilter.value, amountFilter.value]);

  return {
    transactions,
    loading,
    error,
    currentPage,
    pagination,
    nameFilter,
    amountFilter,
    applyNameFilter,
    clearNameFilter,
    applyAmountFilter,
    clearAmountFilter,
    changePage,
    retry: () => loadTransactions(currentPage),
  };
};
