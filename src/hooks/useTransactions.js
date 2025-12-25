import { useState, useEffect } from "react";
import {
  fetchTransactions,
  updateTransaction as updateTransactionService,
} from "../services/transactionService";

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
  const [dateFilter, setDateFilter] = useState({
    operator: "is",
    value: "",
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
    currencies: [],
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
        await retry();
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

  const applyDateFilter = (filter) => {
    setDateFilter(filter);
    // Only trigger API call if there's a value
    if (
      filter.value !== "" &&
      filter.value !== null &&
      filter.value !== undefined
    ) {
      let filterPayload;
      if (filter.operator === "is") {
        filterPayload = {
          date: {
            operator: filter.operator,
            startDate: filter.value,
          },
        };
      } else if (filter.operator === "is between") {
        filterPayload = {
          date: {
            operator: filter.operator,
            startDate: filter.value.startDate,
            endDate: filter.value.endDate,
          },
        };
      }
      console.log("Date filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearDateFilter = () => {
    // Only reload if there was actually a filter value to clear
    const hadValue =
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined;
    setDateFilter({ operator: "is", value: "" });

    if (hadValue) {
      loadTransactions(currentPage);
    }
  };

  const applyAccountFilter = (filter) => {
    setAccountFilter(filter);
    // Only trigger API call if there are selected accounts
    if (filter.ids && filter.ids.length > 0) {
      const filterPayload = {
        accounts: { operator: filter.operator, ids: filter.ids },
      };
      console.log("Account filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearAccountFilter = () => {
    // Only reload if there were actually selected accounts to clear
    const hadAccounts = accountFilter.ids && accountFilter.ids.length > 0;
    setAccountFilter({ operator: "is", ids: [] });

    if (hadAccounts) {
      loadTransactions(currentPage);
    }
  };

  const applyCategoryFilter = (filter) => {
    setCategoryFilter(filter);
    // Only trigger API call if there are selected categories
    if (filter.ids && filter.ids.length > 0) {
      const filterPayload = {
        categories: { operator: filter.operator, ids: filter.ids },
      };
      console.log("Category filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearCategoryFilter = () => {
    // Only reload if there were actually selected categories to clear
    const hadCategories = categoryFilter.ids && categoryFilter.ids.length > 0;
    setCategoryFilter({ operator: "is", ids: [] });

    if (hadCategories) {
      loadTransactions(currentPage);
    }
  };

  // Type filter functions
  const applyTypeFilter = (filter) => {
    setTypeFilter(filter);
    if (filter.types && filter.types.length > 0) {
      const filterPayload = {
        types: { operator: filter.operator, types: filter.types },
      };
      console.log("Type filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearTypeFilter = () => {
    const hadTypes = typeFilter.types && typeFilter.types.length > 0;
    setTypeFilter({ operator: "is", types: [] });

    if (hadTypes) {
      loadTransactions(currentPage);
    }
  };

  // Remarks filter functions
  const applyRemarksFilter = (filter) => {
    setRemarksFilter(filter);
    if (filter.value && filter.value.trim() !== "") {
      const filterPayload = {
        remarks: { operator: filter.operator, value: filter.value.trim() },
      };
      console.log("Remarks filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearRemarksFilter = () => {
    const hadValue = remarksFilter.value && remarksFilter.value.trim() !== "";
    setRemarksFilter({ operator: "is", value: "" });

    if (hadValue) {
      loadTransactions(currentPage);
    }
  };

  // Currency filter functions
  const applyCurrencyFilter = (filter) => {
    setCurrencyFilter(filter);
    if (filter.currencies && filter.currencies.length > 0) {
      const filterPayload = {
        currencies: {
          operator: filter.operator,
          currencies: filter.currencies,
        },
      };
      console.log("Currency filter applied:", filterPayload);
      loadTransactions(0, filterPayload);
    }
  };

  const clearCurrencyFilter = () => {
    const hadCurrencies =
      currencyFilter.currencies && currencyFilter.currencies.length > 0;
    setCurrencyFilter({ operator: "is", currencies: [] });

    if (hadCurrencies) {
      loadTransactions(currentPage);
    }
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
      hasFilters = true;
    }

    if (accountFilter.ids && accountFilter.ids.length > 0) {
      filterPayload.accounts = {
        operator: accountFilter.operator,
        ids: accountFilter.ids,
      };
      hasFilters = true;
    }

    if (categoryFilter.ids && categoryFilter.ids.length > 0) {
      filterPayload.categories = {
        operator: categoryFilter.operator,
        ids: categoryFilter.ids,
      };
      hasFilters = true;
    }

    if (typeFilter.types && typeFilter.types.length > 0) {
      filterPayload.types = {
        operator: typeFilter.operator,
        types: typeFilter.types,
      };
      hasFilters = true;
    }

    if (remarksFilter.value && remarksFilter.value.trim() !== "") {
      filterPayload.remarks = {
        operator: remarksFilter.operator,
        value: remarksFilter.value.trim(),
      };
      hasFilters = true;
    }

    if (currencyFilter.currencies && currencyFilter.currencies.length > 0) {
      filterPayload.currencies = {
        operator: currencyFilter.operator,
        currencies: currencyFilter.currencies,
      };
      hasFilters = true;
    }

    if (hasFilters) {
      loadTransactions(0, filterPayload);
    }
  }, [
    nameFilter.value,
    amountFilter.value,
    dateFilter.value,
    accountFilter.ids,
    categoryFilter.ids,
    typeFilter.types,
    remarksFilter.value,
    currencyFilter.currencies,
  ]); // Watch all filter values

  // Pagination effect - only when no filter
  useEffect(() => {
    const hasNameFilter = nameFilter.value && nameFilter.value.trim() !== "";
    const hasAmountFilter =
      amountFilter.value !== "" &&
      amountFilter.value !== null &&
      amountFilter.value !== undefined;
    const hasDateFilter =
      dateFilter.value !== "" &&
      dateFilter.value !== null &&
      dateFilter.value !== undefined;
    const hasAccountFilter = accountFilter.ids && accountFilter.ids.length > 0;
    const hasCategoryFilter =
      categoryFilter.ids && categoryFilter.ids.length > 0;
    const hasTypeFilter = typeFilter.types && typeFilter.types.length > 0;
    const hasRemarksFilter =
      remarksFilter.value && remarksFilter.value.trim() !== "";
    const hasCurrencyFilter =
      currencyFilter.currencies && currencyFilter.currencies.length > 0;

    if (
      !hasNameFilter &&
      !hasAmountFilter &&
      !hasDateFilter &&
      !hasAccountFilter &&
      !hasCategoryFilter &&
      !hasTypeFilter &&
      !hasRemarksFilter &&
      !hasCurrencyFilter
    ) {
      loadTransactions(currentPage);
    }
  }, [
    currentPage,
    nameFilter.value,
    amountFilter.value,
    dateFilter.value,
    accountFilter.ids,
    categoryFilter.ids,
    typeFilter.types,
    remarksFilter.value,
    currencyFilter.currencies,
  ]);

  // Sorting effect - reload when sorting changes
  useEffect(() => {
    // Always reload when sorting changes, even when clearing sort
    loadTransactions(currentPage);
  }, [sorting.date, sorting.amount]);

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
  };
};
