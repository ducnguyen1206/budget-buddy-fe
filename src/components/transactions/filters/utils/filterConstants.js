// Shared constants for all filter components

export const FILTER_OPERATORS = {
  NAME: [
    { value: "is", label: "Is" },
    { value: "is not", label: "Is not" },
    { value: "contains", label: "Contains" },
    { value: "does not contain", label: "Does not contain" },
    { value: "starts with", label: "Starts with" },
    { value: "ends with", label: "Ends with" },
  ],
  AMOUNT: [
    { value: "=", label: "=" },
    { value: "!=", label: "!=" },
    { value: ">", label: ">" },
    { value: "<", label: "<" },
    { value: ">=", label: ">=" },
    { value: "<=", label: "<=" },
  ],
  DATE: [
    { value: "is", label: "Is" },
    { value: "is between", label: "Is between" },
  ],
};

export const FILTER_STYLES = {
  BUTTON_BASE:
    "flex items-center space-x-2 px-3 py-2 border rounded-xl hover:bg-gray-50 transition-colors",
  BUTTON_ACTIVE: "bg-blue-50 border-blue-300 text-blue-700",
  BUTTON_INACTIVE: "bg-white border-gray-300 text-gray-700",
  BADGE: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full",
  FILTER_BOX:
    "absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-30 w-80 p-4",
  DROPDOWN:
    "absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-40 w-40",
  DROPDOWN_BUTTON:
    "flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors",
  INPUT:
    "w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
  ACTION_BUTTON: "px-4 py-2 rounded-xl transition-colors text-sm",
  ACTION_PRIMARY: "bg-blue-600 text-white hover:bg-blue-700",
  ACTION_SECONDARY: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ACTION_DISABLED: "disabled:opacity-50 disabled:cursor-not-allowed",
  CHECKBOX: "w-4 h-4 border border-gray-300 rounded",
  CHECKBOX_CHECKED:
    "w-4 h-4 bg-blue-600 rounded flex items-center justify-center",
  ITEM_LIST: "max-h-48 overflow-y-auto border border-gray-200 rounded-lg",
  ITEM_ROW:
    "flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer",
};

export const FILTER_VALIDATION = {
  NAME: {
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  AMOUNT: {
    required: true,
    pattern: /^-?\d*\.?\d*$/,
    min: undefined, // Allow negative numbers
  },
  DATE: {
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
  ACCOUNT: {
    required: true,
    minSelections: 1,
  },
  CATEGORY: {
    required: true,
    minSelections: 1,
  },
};

export const FILTER_PLACEHOLDERS = {
  NAME: "transactions.nameFilterPlaceholder",
  AMOUNT: "transactions.amountFilterPlaceholder",
  DATE: "transactions.dateFilterPlaceholder",
  ACCOUNT: "transactions.selectAccount",
  CATEGORY: "transactions.selectCategory",
};
