# Budget Buddy

A personal finance management application built with React. Track your accounts, transactions, budgets, savings, installments, subscriptions, and daily spending thresholds with multi-language support (English & Vietnamese).

## Features

- **Accounts** - Manage multiple bank accounts and wallets
- **Transactions** - Record income and expenses with category tagging
- **Budgets** - Set monthly budgets per category with spending tracking
- **Categories** - Organize transactions with custom categories
- **Savings** - Track savings goals and progress
- **Installments** - Monitor payment plans and outstanding amounts
- **Subscriptions** - Keep track of recurring monthly payments
- **Thresholds** - Set daily spending limits per category
- **Spending Dashboard** - Visualize daily spending against thresholds with charts
- **Multi-language** - Full support for English and Vietnamese

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd budget-buddy-fe

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend API

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Project Structure

```
src/
├── components/
│   ├── accounts/          # Account management
│   ├── budgets/           # Budget tracking
│   ├── categories/        # Category management
│   ├── common/            # Reusable UI components
│   ├── dashboard/         # Dashboard & spending charts
│   ├── installments/      # Installment tracking
│   ├── layout/            # Header, Footer, Layout
│   ├── login/             # Authentication pages
│   ├── register/          # Registration flow
│   ├── savings/           # Savings management
│   ├── subscriptions/     # Subscription tracking
│   ├── thresholds/        # Threshold settings
│   └── transactions/      # Transaction management
├── config/
│   └── api.js             # API endpoints configuration
├── constants/
│   └── validation.js      # Validation rules
├── contexts/
│   └── LanguageContext.jsx # i18n context
├── services/              # API service functions
├── translations/
│   ├── en.json            # English translations
│   └── vi.json            # Vietnamese translations
├── utils/                 # Helper functions
├── App.jsx                # Routes & app setup
└── main.jsx               # Entry point
```

## Usage Guide

### Authentication

1. **Register** - Create account with email verification
2. **Login** - Sign in with email/password or Google OAuth
3. **Password Reset** - Reset via email verification

### Managing Finances

#### Accounts
Navigate to **Accounts** to add your bank accounts, e-wallets, or cash wallets. Each account tracks its balance automatically based on transactions.

#### Transactions
Record your income and expenses in **Transactions**. Select a category, account, amount, and date. Use the search and filter options to find specific transactions.

#### Budgets
Set monthly budgets in **Budgets**. Choose a category, currency, and amount. The app tracks spending against each budget and shows remaining balance. Filter by date range to view specific periods.

#### Categories
Customize your transaction categories in **Categories**. Create categories that match your spending habits.

#### Savings
Track savings goals in **Savings**. Set target amounts and monitor your progress.

#### Installments
Monitor payment plans in **Installments**. Track total amount, amount paid, and outstanding balance with due dates.

#### Subscriptions
Keep track of recurring payments in **Subscriptions**. Record the monthly amount and payment day.

#### Thresholds
Set daily spending limits per category in **Thresholds**. These limits are used in the Spending Dashboard.

#### Spending Dashboard
View the **Spending Dashboard** to see a bar chart of daily spending vs. your threshold. Select a category and date range to analyze spending patterns. Days exceeding the threshold are highlighted in red.

### Inline Editing

Most list pages support inline editing. Click on a value (e.g., amount, name) to edit it directly without opening a form.

### Language Switching

Click the language toggle in the header to switch between English and Vietnamese. Your preference is saved automatically.

## Development

### Adding a New Feature Page

1. Create component folder in `src/components/`
2. Create page component (e.g., `FeaturePage.jsx`) and form component (e.g., `FeatureForm.jsx`)
3. Add API service in `src/services/`
4. Add route in `src/App.jsx`
5. Add sidebar link in `src/components/dashboard/DashboardSidebar.jsx`
6. Add translations in `src/translations/en.json` and `vi.json`

### Adding Translations

```jsx
// 1. Add keys to translation files
// src/translations/en.json
{ "feature": { "title": "Feature Title" } }

// src/translations/vi.json
{ "feature": { "title": "Tiêu đề tính năng" } }

// 2. Use in component
import { useLanguage } from "../../contexts/LanguageContext";

const { t } = useLanguage();
return <h1>{t("feature.title")}</h1>;
```

### Adding API Endpoints

```javascript
// 1. Add endpoint in src/config/api.js
export const API_ENDPOINTS = {
  FEATURE: "/api/v1/feature",
};

// 2. Create service in src/services/featureService.js
import { getApiUrl, API_ENDPOINTS, getApiHeaders } from "../config/api";
import { fetchWithAuth } from "../utils/apiInterceptor";

export const fetchFeatures = async (t = null) => {
  const response = await fetchWithAuth(
    getApiUrl(API_ENDPOINTS.FEATURE),
    { method: "GET", headers: getApiHeaders(true) },
    t
  );
  // Handle response...
};
```

## Build & Deployment

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### CI/CD with Jenkins

A `Jenkinsfile` is included for automated deployment. Configure:
- `DEPLOY_PATH` - Server path for static files
- `VPS_USER` - SSH username
- `VPS_HOST` - Server IP address
- `vps-ssh-key` - Jenkins SSH credential ID

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Charts and data visualization
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_BASE_URL` in `.env`
- Ensure backend server is running
- Check browser console for CORS errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Translation Not Showing
- Verify translation key exists in both `en.json` and `vi.json`
- Check for typos in the translation key path

---

**Built with React, Vite, and Tailwind CSS**
