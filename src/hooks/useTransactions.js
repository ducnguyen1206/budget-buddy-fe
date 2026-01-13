import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  fetchTransactions,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
} from "../services/transactionService";

const PAGE_SIZE = 50;

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
  const [dateFilter, setDateFilter] = useState({
    operator: "is",
    value: format(new Date(), "yyyy-MM-dd"),
  });
  const [accountFilter, setAccountFilter] = useState({
    operator: "is",
    ids: [],
  });
  const [categoryFilter, setCategoryFilter] = useState({
    operator: "is",
    ids: [],
  });
  const [typeFilter, setTypeFilter] = useState({
    operator: "is",
    types: [],
  });
  const [remarksFilter, setRemarksFilter] = useState({
    operator: "is",
    value: "",
  });
  const [currencyFilter, setCurrencyFilter] = useState({
    operator: "is",
    currencies: ["SGD"],
  });
  const [sorting, setSorting] = useState({
    date: null, // null, 'asc', 'desc'
    amount: null, // null, 'asc', 'desc'
  });

  // Build sort string from sorting state
  const buildSortString = () => {
    const sortParts = [];

    if (sorting.date) {
      sortParts.push(`date,${sorting.date}`);
    }

    if (sorting.amount) {
      sortParts.push(`amount,${sorting.amount}`);
    }

    const result = sortParts.length > 0 ? sortParts.join(";") : null;
    console.log("Build sort string:", result);
    return result;
  };

  const loadTransactions = async (page = 0, filterPayload = {}) => {
    try {
      setLoading(true);
      setError(null);

      const sortString = buildSortString();
      const requestPayload = {
        ...filterPayload,
        ...(sortString && { sort: sortString }),
      };

      console.log("API Request Payload:", requestPayload);
      const data = await fetchTransactions(page, PAGE_SIZE, requestPayload);
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

  const buildCurrentFilterPayload = () => {
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

    if (
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined
    ) {
      if (dateFilter.operator === "is") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value,
        };
      } else if (dateFilter.operator === "is between") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value.startDate,
          endDate: dateFilter.value.endDate,
        };
      }
    }

    if (accountFilter.ids && accountFilter.ids.length > 0) {
      filterPayload.accounts = {
        operator: accountFilter.operator,
        ids: accountFilter.ids,
      };
    }

    if (categoryFilter.ids && categoryFilter.ids.length > 0) {
      filterPayload.categories = {
        operator: categoryFilter.operator,
        ids: categoryFilter.ids,
      };
    }

    if (typeFilter.types && typeFilter.types.length > 0) {
      filterPayload.types = {
        operator: typeFilter.operator,
        types: typeFilter.types,
      };
    }

    if (remarksFilter.value && remarksFilter.value.trim() !== "") {
      filterPayload.remarks = {
        operator: remarksFilter.operator,
        value: remarksFilter.value.trim(),
      };
    }

    if (currencyFilter.currencies && currencyFilter.currencies.length > 0) {
      filterPayload.currencies = {
        operator: currencyFilter.operator,
        currencies: currencyFilter.currencies,
      };
    }

    return filterPayload;
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateTransactionService(
        transactionId,
        transactionData
      );
      if (result.success) {
        // Reload transactions to reflect the update
        await loadTransactions(currentPage, buildCurrentFilterPayload());
      }
      return result;
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteTransactionService(transactionId);
      if (result.success) {
        // Reload transactions to reflect the deletion
        await loadTransactions(currentPage, buildCurrentFilterPayload());
      }
      return result;
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyNameFilter = (filter) => {
    setNameFilter(filter);
    // Reset to page 0 when applying a real value; data load is handled by the consolidated effect.
    if (filter.value && filter.value.trim() !== "") {
      setCurrentPage(0);
    }
  };

  const clearNameFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue = nameFilter.value && nameFilter.value.trim() !== "";
    if (!hadValue) return;
    setNameFilter({ operator: "is", value: "" });
  };

  const applyAmountFilter = (filter) => {
    setAmountFilter(filter);
    // Reset to page 0 when applying a real value; data load is handled by the consolidated effect.
    if (
      filter.value !== "" &&
      filter.value !== null &&
      filter.value !== undefined
    ) {
      setCurrentPage(0);
    }
  };

  const clearAmountFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue =
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined;
    if (!hadValue) return;
    setAmountFilter({ operator: "=", value: "" });
  };

  const applyDateFilter = (filter) => {
    setDateFilter(filter);
    // Reset to page 0 when applying a real value; data load is handled by the consolidated effect.
    if (
      filter.value !== "" &&
      filter.value !== null &&
      filter.value !== undefined
    ) {
      setCurrentPage(0);
    }
  };

  const clearDateFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue =
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined;
    if (!hadValue) return;
    setDateFilter({ operator: "is", value: "" });
  };

  const applyAccountFilter = (filter) => {
    setAccountFilter(filter);
    // Reset to page 0 when applying a selection; data load is handled by the consolidated effect.
    if (filter.ids && filter.ids.length > 0) {
      setCurrentPage(0);
    }
  };

  const clearAccountFilter = () => {
    // Only reload if there were actually selected accounts to clear
    const hadAccounts = accountFilter.ids && accountFilter.ids.length > 0;
    if (!hadAccounts) return;
    setAccountFilter({ operator: "is", ids: [] });
  };

  const applyCategoryFilter = (filter) => {
    setCategoryFilter(filter);
    // Reset to page 0 when applying a selection; data load is handled by the consolidated effect.
    if (filter.ids && filter.ids.length > 0) {
      setCurrentPage(0);
    }
  };

  const clearCategoryFilter = () => {
    // Only reload if there were actually selected categories to clear
    const hadCategories = categoryFilter.ids && categoryFilter.ids.length > 0;
    if (!hadCategories) return;
    setCategoryFilter({ operator: "is", ids: [] });
  };

  // Type filter functions
  const applyTypeFilter = (filter) => {
    setTypeFilter(filter);
    if (filter.types && filter.types.length > 0) {
      setCurrentPage(0);
    }
  };

  const clearTypeFilter = () => {
    const hadTypes = typeFilter.types && typeFilter.types.length > 0;
    if (!hadTypes) return;
    setTypeFilter({ operator: "is", types: [] });
  };

  // Remarks filter functions
  const applyRemarksFilter = (filter) => {
    setRemarksFilter(filter);
    if (filter.value && filter.value.trim() !== "") {
      setCurrentPage(0);
    }
  };

  const clearRemarksFilter = () => {
    const hadValue = remarksFilter.value && remarksFilter.value.trim() !== "";
    if (!hadValue) return;
    setRemarksFilter({ operator: "is", value: "" });
  };

  // Currency filter functions
  const applyCurrencyFilter = (filter) => {
    setCurrencyFilter(filter);
    if (filter.currencies && filter.currencies.length > 0) {
      setCurrentPage(0);
    }
  };

  const clearCurrencyFilter = () => {
    const hadCurrencies =
      currencyFilter.currencies && currencyFilter.currencies.length > 0;
    if (!hadCurrencies) return;
    setCurrencyFilter({ operator: "is", currencies: [] });
  };

  // Sorting functions
  const handleSort = (column) => {
    setSorting((prev) => {
      const newSorting = { ...prev };

      if (column === "date") {
        if (prev.date === null) {
          newSorting.date = "desc"; // Default to descending for date
        } else if (prev.date === "desc") {
          newSorting.date = "asc";
        } else {
          newSorting.date = null; // Clear sorting (3rd click)
        }
      } else if (column === "amount") {
        if (prev.amount === null) {
          newSorting.amount = "desc"; // Default to descending for amount
        } else if (prev.amount === "desc") {
          newSorting.amount = "asc";
        } else {
          newSorting.amount = null; // Clear sorting (3rd click)
        }
      }

      console.log(`Sorting ${column}:`, newSorting);
      return newSorting;
    });
  };

  const clearSorting = () => {
    setSorting({ date: null, amount: null });
  };

  const changePage = (page) => {
    setCurrentPage(page);

    // Build filter payload with name, amount, date, account, and category filters
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
    if (
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined
    ) {
      if (dateFilter.operator === "is") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value,
        };
      } else if (dateFilter.operator === "is between") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value.startDate,
          endDate: dateFilter.value.endDate,
        };
      }
    }

    if (accountFilter.ids && accountFilter.ids.length > 0) {
      filterPayload.accounts = {
        operator: accountFilter.operator,
        ids: accountFilter.ids,
      };
    }

    if (categoryFilter.ids && categoryFilter.ids.length > 0) {
      filterPayload.categories = {
        operator: categoryFilter.operator,
        ids: categoryFilter.ids,
      };
    }

    if (typeFilter.types && typeFilter.types.length > 0) {
      filterPayload.types = {
        operator: typeFilter.operator,
        types: typeFilter.types,
      };
    }

    if (remarksFilter.value && remarksFilter.value.trim() !== "") {
      filterPayload.remarks = {
        operator: remarksFilter.operator,
        value: remarksFilter.value.trim(),
      };
    }

    if (currencyFilter.currencies && currencyFilter.currencies.length > 0) {
      filterPayload.currencies = {
        operator: currencyFilter.operator,
        currencies: currencyFilter.currencies,
      };
    }

    loadTransactions(page, filterPayload);
  };

  // Consolidated effect - load transactions when dependencies change
  useEffect(() => {
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

    if (
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined
    ) {
      if (dateFilter.operator === "is") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value,
        };
      } else if (dateFilter.operator === "is between") {
        filterPayload.date = {
          operator: dateFilter.operator,
          startDate: dateFilter.value.startDate,
          endDate: dateFilter.value.endDate,
        };
      }
    }

    if (accountFilter.ids && accountFilter.ids.length > 0) {
      filterPayload.accounts = {
        operator: accountFilter.operator,
        ids: accountFilter.ids,
      };
    }

    if (categoryFilter.ids && categoryFilter.ids.length > 0) {
      filterPayload.categories = {
        operator: categoryFilter.operator,
        ids: categoryFilter.ids,
      };
    }

    if (typeFilter.types && typeFilter.types.length > 0) {
      filterPayload.types = {
        operator: typeFilter.operator,
        types: typeFilter.types,
      };
    }

    if (remarksFilter.value && remarksFilter.value.trim() !== "") {
      filterPayload.remarks = {
        operator: remarksFilter.operator,
        value: remarksFilter.value.trim(),
      };
    }

    if (currencyFilter.currencies && currencyFilter.currencies.length > 0) {
      filterPayload.currencies = {
        operator: currencyFilter.operator,
        currencies: currencyFilter.currencies,
      };
    }

    loadTransactions(currentPage, filterPayload);
  }, [
    currentPage,
    nameFilter.value,
    nameFilter.operator,
    amountFilter.value,
    amountFilter.operator,
    dateFilter.value,
    dateFilter.operator,
    accountFilter.ids,
    accountFilter.operator,
    categoryFilter.ids,
    categoryFilter.operator,
    typeFilter.types,
    typeFilter.operator,
    remarksFilter.value,
    remarksFilter.operator,
    currencyFilter.currencies,
    currencyFilter.operator,
    sorting.date,
    sorting.amount,
  ]);

  return {
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
    clearSorting,
    changePage,
    retry: () => loadTransactions(currentPage),
    updateTransaction,
    deleteTransaction,
  };
};
