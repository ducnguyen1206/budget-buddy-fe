import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, setDate, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Calendar, AlertTriangle, Star } from "lucide-react";

const STORAGE_KEY = "thresholdDashboard_defaultCategoryId";
import DashboardLayout from "./DashboardLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { fetchThresholdTransactions } from "../../services/thresholdService";
import { fetchCategories } from "../../services/categoryService";
import { shouldRedirectToLogin } from "../../utils/apiInterceptor";

export default function ThresholdDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Get default date range: 5th of current month to 5th of next month
  const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = setDate(today, 5);
    const endDate = setDate(addMonths(today, 1), 5);
    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    };
  };

  const defaultRange = getDefaultDateRange();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isDefaultCategory, setIsDefaultCategory] = useState(false);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [currency, setCurrency] = useState("SGD");

  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId && startDate && endDate) {
      loadChartData();
    }
  }, [selectedCategoryId, startDate, endDate, currency]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await fetchCategories(t);

      if (shouldRedirectToLogin(result)) {
        navigate("/login");
        return;
      }

      if (result.success) {
        setCategories(result.data || []);
        // Load saved default category or use first category
        const savedCategoryId = localStorage.getItem(STORAGE_KEY);
        if (savedCategoryId && result.data?.some(cat => cat.id.toString() === savedCategoryId)) {
          setSelectedCategoryId(savedCategoryId);
          setIsDefaultCategory(true);
        } else if (result.data && result.data.length > 0) {
          setSelectedCategoryId(result.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadChartData = async () => {
    if (!selectedCategoryId) return;

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    const requestData = {
      categoryId: parseInt(selectedCategoryId, 10),
      startDate,
      endDate,
      currency,
    };

    const result = await fetchThresholdTransactions(requestData, t);

    if (shouldRedirectToLogin(result)) {
      navigate("/login");
      return;
    }

    if (result.success) {
      setChartData(result.data);
    } else {
      if (result.notFound) {
        setNotFound(true);
      }
      setError(result.error);
      setChartData(null);
    }

    setIsLoading(false);
  };

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((cat) => cat.id !== undefined && cat.id !== null)
        .map((cat) => ({
          value: cat.id.toString(),
          label: cat.name,
        })),
    [categories]
  );

  const currencyOptions = [
    { value: "SGD", label: "SGD" },
    { value: "VND", label: "VND" },
  ];

  // Handle category change
  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setSelectedCategoryId(newCategoryId);
    // Check if this is the saved default category
    const savedCategoryId = localStorage.getItem(STORAGE_KEY);
    setIsDefaultCategory(newCategoryId === savedCategoryId);
  };

  // Toggle default category
  const toggleDefaultCategory = () => {
    if (isDefaultCategory) {
      // Remove default
      localStorage.removeItem(STORAGE_KEY);
      setIsDefaultCategory(false);
    } else {
      // Set as default
      localStorage.setItem(STORAGE_KEY, selectedCategoryId);
      setIsDefaultCategory(true);
    }
  };

  // Prepare chart data with stacked bar values
  const formattedChartData = useMemo(() => {
    if (!chartData?.transactions) return [];

    return chartData.transactions.map((item) => {
      const total = Math.abs(item.totalAmount);
      const threshold = item.threshold;
      const isExceeded = item.exceededAmount < 0;
      
      // For stacked bars: baseAmount (blue) + overAmount (red)
      const baseAmount = threshold > 0 ? Math.min(total, threshold) : total;
      const overAmount = threshold > 0 && total > threshold ? total - threshold : 0;
      
      return {
        date: format(parseISO(item.date), "dd/MM"),
        fullDate: item.date,
        totalAmount: total,
        threshold: threshold,
        exceededAmount: item.exceededAmount,
        isExceeded: isExceeded,
        baseAmount: baseAmount,
        overAmount: overAmount,
      };
    });
  }, [chartData]);

  const thresholdValue = chartData?.transactions?.[0]?.threshold || 0;

  // Calculate max total amount for Y-axis when threshold is 0
  const maxTotalAmount = useMemo(() => {
    if (!formattedChartData.length) return 0;
    return Math.max(...formattedChartData.map((d) => d.totalAmount));
  }, [formattedChartData]);

  // Determine chart Y-axis maximum
  const chartMaxValue = useMemo(() => {
    if (thresholdValue === 0) {
      // No threshold, use max total amount with 20% buffer
      return maxTotalAmount * 1.2;
    }
    // Has threshold, use the larger of threshold or max amount with buffer
    return Math.max(thresholdValue * 1.2, maxTotalAmount * 1.1);
  }, [thresholdValue, maxTotalAmount]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.fullDate}</p>
          <p className="text-sm text-gray-600">
            {t("thresholdDashboard.spent")}: {chartData?.currency || currency}{" "}
            {data.totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {t("thresholdDashboard.threshold")}: {chartData?.currency || currency}{" "}
            {data.threshold.toFixed(2)}
          </p>
          <p
            className={`text-sm font-medium ${
              data.isExceeded ? "text-red-600" : "text-green-600"
            }`}
          >
            {data.isExceeded
              ? `${t("thresholdDashboard.exceeded")}: ${Math.abs(data.exceededAmount).toFixed(2)}`
              : `${t("thresholdDashboard.underBudget")}: ${data.exceededAmount.toFixed(2)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout activePage="threshold-dashboard">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t("thresholdDashboard.title")}
          </h1>
          <p className="text-gray-600">{t("thresholdDashboard.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("thresholdDashboard.category")}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  disabled={loadingCategories}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">{t("thresholdDashboard.selectCategory")}</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={toggleDefaultCategory}
                  disabled={!selectedCategoryId}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDefaultCategory
                      ? "bg-yellow-100 border-yellow-400 text-yellow-600"
                      : "bg-white border-gray-300 text-gray-400 hover:text-yellow-500 hover:border-yellow-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isDefaultCategory ? t("thresholdDashboard.removeDefault") : t("thresholdDashboard.setAsDefault")}
                >
                  <Star className={`w-5 h-5 ${isDefaultCategory ? "fill-yellow-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("thresholdDashboard.startDate")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("thresholdDashboard.endDate")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("thresholdDashboard.currency")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">{t("common.loading")}</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
              <p className="text-gray-600 text-center mb-4">{error}</p>
              {notFound && (
                <p className="text-sm text-gray-500 text-center">
                  {t("thresholdDashboard.noThresholdConfigured")}
                </p>
              )}
            </div>
          )}

          {/* No Category Selected */}
          {!selectedCategoryId && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-500">{t("thresholdDashboard.selectCategoryPrompt")}</p>
            </div>
          )}

          {/* Chart */}
          {chartData && !isLoading && !error && formattedChartData.length > 0 && (
            <>
              {/* Chart Header */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {chartData.category}
                </h2>
                {thresholdValue > 0 && (
                  <p className="text-sm text-gray-500">
                    {t("thresholdDashboard.thresholdLine")}: {chartData.currency}{" "}
                    {thresholdValue.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Bar Chart */}
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formattedChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      domain={[0, chartMaxValue]}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {thresholdValue > 0 && (
                      <ReferenceLine
                        y={thresholdValue}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                      />
                    )}
                    <Bar 
                      dataKey="baseAmount" 
                      stackId="spending"
                      fill="#22c55e"
                    >
                      {formattedChartData.map((entry, index) => (
                        <Cell
                          key={`base-${index}`}
                          radius={entry.overAmount > 0 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="overAmount" 
                      stackId="spending"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">
                    {thresholdValue > 0 ? t("thresholdDashboard.withinBudget") : t("thresholdDashboard.spent")}
                  </span>
                </div>
                {thresholdValue > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">
                        {t("thresholdDashboard.overBudget")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 border-t-2 border-red-500 border-dashed"></div>
                      <span className="text-sm text-gray-600">
                        {t("thresholdDashboard.thresholdLine")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* No Data */}
          {chartData && !isLoading && !error && formattedChartData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-500">{t("thresholdDashboard.noDataAvailable")}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
