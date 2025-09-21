# Filter System Structure

## 📁 Folder Organization

```
src/components/transactions/filters/
├── 📁 shared/                    # Reusable components
│   ├── 🔧 FilterButton.jsx       # Consistent button styling
│   ├── 🔧 FilterBox.jsx          # Standardized container
│   ├── 🔧 OperatorDropdown.jsx   # Operator selection
│   ├── 🔧 ActionButtons.jsx      # Apply/Clear/Close buttons
│   ├── 🔧 ItemList.jsx           # List component for arrays
│   ├── 🔧 SelectedItemsDisplay.jsx # Selected items badges
│   └── 📄 index.js               # Shared exports
├── 📁 components/                # Filter implementations
│   ├── 🔍 NameFilter.jsx         # Text filtering
│   ├── 🔍 AmountFilter.jsx       # Numeric filtering
│   ├── 🔍 DateFilter.jsx         # Date filtering
│   ├── 🔍 AccountFilter.jsx      # Account multi-select
│   ├── 🔍 CategoryFilter.jsx     # Category multi-select
│   └── 📄 index.js               # Component exports
├── 📁 utils/                     # Utilities and constants
│   ├── ⚙️ filterConstants.js     # Styles, operators, validation
│   ├── ⚙️ filterUtils.js         # Helper functions
│   └── 📄 index.js               # Utility exports
├── 📄 index.js                   # Main filter exports
└── 📄 STRUCTURE.md               # This file
```

## 🔗 Import Patterns

### **From TransactionsPage**

```javascript
import {
  NameFilter,
  AmountFilter,
  DateFilter,
  AccountFilter,
  CategoryFilter,
} from "./filters";
```

### **From Filter Components**

```javascript
// Shared components
import FilterButton from "../shared/FilterButton";
import FilterBox from "../shared/FilterBox";
import OperatorDropdown from "../shared/OperatorDropdown";
import ActionButtons from "../shared/ActionButtons";
import ItemList from "../shared/ItemList";
import SelectedItemsDisplay from "../shared/SelectedItemsDisplay";

// Utilities
import {
  FILTER_OPERATORS,
  FILTER_STYLES,
  FILTER_PLACEHOLDERS,
} from "../utils/filterConstants";
import { validateFilterInput, debounce } from "../utils/filterUtils";
```

### **From Shared Components**

```javascript
import { FILTER_STYLES } from "../utils/filterConstants";
import { isFilterActive, formatDisplayValue } from "../utils/filterUtils";
```

## 🎯 Benefits of This Structure

### **1. Clear Separation of Concerns**

- **Shared**: Reusable UI components
- **Components**: Specific filter implementations
- **Utils**: Business logic and constants

### **2. Easy Maintenance**

- Changes to shared components affect all filters
- Utilities are centralized and consistent
- Clear import paths and dependencies

### **3. Scalability**

- Easy to add new filter types
- Simple to extend shared components
- Clean organization for large teams

### **4. Developer Experience**

- Intuitive folder structure
- Clear naming conventions
- Easy to find and modify components

## 🚀 Usage Examples

### **Adding a New Filter**

1. Create component in `components/` folder
2. Import shared components and utilities
3. Add to `components/index.js`
4. Import in `TransactionsPage.jsx`

### **Modifying Shared Components**

1. Edit component in `shared/` folder
2. Changes automatically apply to all filters
3. Test all filter components

### **Adding New Utilities**

1. Add to `utils/filterUtils.js` or `utils/filterConstants.js`
2. Export from `utils/index.js`
3. Import in components that need it

This structure provides excellent organization, maintainability, and scalability for the filter system! 🎉
