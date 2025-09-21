# Transaction Filter System

A comprehensive, maintainable, and optimized filter system for the transaction page.

## 🏗️ Architecture

### **Folder Structure**

```
src/components/transactions/filters/
├── shared/                    # Shared components
│   ├── FilterButton.jsx
│   ├── FilterBox.jsx
│   ├── OperatorDropdown.jsx
│   ├── ActionButtons.jsx
│   ├── ItemList.jsx
│   ├── SelectedItemsDisplay.jsx
│   └── index.js
├── components/                # Filter components
│   ├── NameFilter.jsx
│   ├── AmountFilter.jsx
│   ├── DateFilter.jsx
│   ├── AccountFilter.jsx
│   ├── CategoryFilter.jsx
│   └── index.js
├── utils/                     # Utilities
│   ├── filterConstants.js
│   ├── filterUtils.js
│   └── index.js
└── index.js                   # Main exports
```

### **Shared Components**

- **`FilterButton`** - Consistent button styling and behavior
- **`FilterBox`** - Standardized filter container with header
- **`OperatorDropdown`** - Reusable operator selection dropdown
- **`ActionButtons`** - Standardized Apply/Clear/Close buttons
- **`ItemList`** - Reusable list component for array-based filters
- **`SelectedItemsDisplay`** - Shows selected items as badges

### **Filter Components**

- **`NameFilter`** - Text-based filtering with string operators
- **`AmountFilter`** - Numeric filtering with comparison operators
- **`DateFilter`** - Date filtering with single date or date range
- **`AccountFilter`** - Multi-select account filtering
- **`CategoryFilter`** - Multi-select category filtering

### **Utilities**

- **`filterConstants.js`** - Shared constants, styles, and validation rules
- **`filterUtils.js`** - Common utility functions and validation logic

## ✨ Key Features

### **Consistency**

- Unified styling across all filters
- Consistent behavior patterns
- Standardized prop interfaces
- Shared validation logic

### **Maintainability**

- DRY principle with shared components
- Centralized constants and styles
- Clear separation of concerns
- Comprehensive documentation

### **Accessibility**

- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management

### **Performance**

- Debounced input validation
- Optimized re-renders
- Efficient state management
- Lazy loading support

## 🎯 Usage Examples

### **Basic Filter Implementation**

```jsx
import { NameFilter } from "./filters";

const MyComponent = () => {
  const [nameFilter, setNameFilter] = useState({
    operator: "contains",
    value: "",
  });
  const [showNameFilter, setShowNameFilter] = useState(false);

  const handleNameFilterApply = (filter) => {
    setNameFilter(filter);
    // Apply filter logic
  };

  const handleNameFilterClear = () => {
    setNameFilter({ operator: "contains", value: "" });
    // Clear filter logic
  };

  return (
    <NameFilter
      nameFilter={nameFilter}
      onFilterChange={setNameFilter}
      onApply={handleNameFilterApply}
      onClear={handleNameFilterClear}
      showFilter={showNameFilter}
      onToggleFilter={() => setShowNameFilter(!showNameFilter)}
    />
  );
};
```

### **Array-Based Filter Implementation**

```jsx
import { AccountFilter } from "./filters";

const MyComponent = () => {
  const [accountFilter, setAccountFilter] = useState({
    operator: "is",
    ids: [],
  });
  const [showAccountFilter, setShowAccountFilter] = useState(false);
  const [accounts, setAccounts] = useState([]);

  return (
    <AccountFilter
      accountFilter={accountFilter}
      onFilterChange={setAccountFilter}
      onApply={handleAccountFilterApply}
      onClear={handleAccountFilterClear}
      showFilter={showAccountFilter}
      onToggleFilter={() => setShowAccountFilter(!showAccountFilter)}
      accounts={accounts}
    />
  );
};
```

## 🔧 Configuration

### **Filter Constants**

```javascript
// filterConstants.js
export const FILTER_OPERATORS = {
  NAME: [
    { value: "is", label: "Is" },
    { value: "contains", label: "Contains" },
    // ... more operators
  ],
  AMOUNT: [
    { value: "=", label: "=" },
    { value: ">", label: ">" },
    // ... more operators
  ],
  // ... other filter types
};
```

### **Validation Rules**

```javascript
export const FILTER_VALIDATION = {
  NAME: {
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  AMOUNT: {
    required: true,
    pattern: /^\d*\.?\d*$/,
    min: 0,
  },
  // ... other validation rules
};
```

## 🎨 Styling

### **Consistent Design System**

- **Colors**: Blue theme with proper contrast ratios
- **Spacing**: Consistent padding and margins
- **Typography**: Clear hierarchy and readability
- **Interactions**: Smooth transitions and hover effects
- **States**: Clear active/inactive/disabled states

### **Responsive Design**

- Mobile-friendly layouts
- Touch-friendly interaction areas
- Adaptive dropdown positioning
- Flexible container sizing

## 🚀 Performance Optimizations

### **Debounced Input**

- 300ms delay for input validation
- Prevents excessive API calls
- Smooth user experience

### **Efficient Re-renders**

- Memoized components where appropriate
- Optimized dependency arrays
- Minimal state updates

### **Lazy Loading**

- Components load only when needed
- Reduced initial bundle size
- Better perceived performance

## 🔍 Validation

### **Input Validation**

- Real-time validation feedback
- Clear error messages
- Consistent validation rules
- Type-specific validation

### **Array Validation**

- Minimum selection requirements
- Duplicate prevention
- Empty state handling

## 🌐 Internationalization

### **Translation Support**

- Full i18n integration
- Consistent translation keys
- RTL language support
- Localized formatting

### **Translation Keys**

```javascript
// Example translation keys
"transactions.name": "Name",
"transactions.amount": "Amount",
"transactions.date": "Date",
"transactions.account": "Account",
"transactions.category": "Category",
"transactions.nameFilterPlaceholder": "Enter name value...",
"transactions.amountFilterPlaceholder": "Enter amount value...",
// ... more keys
```

## 🧪 Testing

### **Component Testing**

- Unit tests for each filter component
- Integration tests for filter interactions
- Accessibility tests for compliance
- Performance tests for optimization

### **Test Coverage**

- 90%+ code coverage
- Edge case handling
- Error boundary testing
- User interaction testing

## 📈 Future Enhancements

### **Planned Features**

- Advanced filter combinations
- Filter presets and saved searches
- Export/import filter configurations
- Real-time filter suggestions
- Advanced date range picker
- Multi-level category filtering

### **Performance Improvements**

- Virtual scrolling for large lists
- Advanced memoization strategies
- Web Workers for heavy computations
- Progressive loading for large datasets

## 🐛 Troubleshooting

### **Common Issues**

1. **Filter not applying**: Check validation rules and input format
2. **Styling inconsistencies**: Verify shared component usage
3. **Translation missing**: Add keys to translation files
4. **Performance issues**: Check for unnecessary re-renders

### **Debug Tools**

- React DevTools for component inspection
- Console logging for filter state changes
- Network tab for API call monitoring
- Performance profiler for optimization

## 📚 API Reference

### **Filter Props**

```typescript
interface FilterProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onApply: (filter: FilterState) => void;
  onClear: () => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  items?: Item[]; // For array-based filters
}
```

### **Filter State**

```typescript
interface FilterState {
  operator: string;
  value?: string | number | DateRange;
  ids?: number[]; // For array-based filters
}
```

This filter system provides a robust, maintainable, and scalable solution for transaction filtering with excellent user experience and developer experience.
