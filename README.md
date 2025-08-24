# Budget Buddy - Authentication System

A modern React-based authentication system with multi-language support (English & Vietnamese) for the Budget Buddy application.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd budget-buddy

# Install dependencies
npm install

# Start the development server
npm run dev

# Start the mock API server (optional)
npm run server
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
budget-buddy/
├── public/                    # Static assets
│   ├── logo.png              # Application logo
│   └── favicon.ico           # Browser favicon
├── src/
│   ├── components/           # React components
│   │   ├── common/           # Reusable UI components
│   │   ├── layout/           # Layout components (Header, Footer, etc.)
│   │   ├── login/            # Login-related components
│   │   └── register/         # Registration flow components
│   ├── config/               # Configuration files
│   ├── constants/            # Application constants
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── translations/         # Multi-language translations
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Application entry point
├── db.json                   # Mock data for JSON server
└── package.json              # Dependencies and scripts
```

## 🔑 Key Features

### 1. **Authentication Flow**

- **Registration**: Email-based registration with verification
- **Login**: Secure login with token management
- **Forgot Password**: Email-based password reset request
- **Password Reset**: Token-based password reset flow
- **Email Verification**: Email verification with token validation

### 2. **Dashboard Navigation**

- **Reusable Sidebar**: Consistent navigation across all dashboard pages
- **Active Page Highlighting**: Visual indication of current page
- **Logo Integration**: Uses project logo from `/public/logo.png`
- **Multi-Language Support**: All navigation items support English and Vietnamese
- **Functional Navigation**: Click navigation items to navigate between pages
- **Organized Structure**: Feature pages organized in dedicated folders

### 2. **Multi-Language Support**

- **Languages**: English and Vietnamese
- **Context-based**: Uses React Context for language management
- **Persistent**: Language preference saved in localStorage
- **Global Switcher**: Available on all pages in the header

### 3. **Security Features**

- **Token Management**: Secure token storage and handling
- **Password Strength**: Real-time password strength validation
- **Form Validation**: Client-side validation with user-friendly messages
- **Error Handling**: Comprehensive error handling for API calls

## 🧩 Component Architecture

### Core Components

#### **Layout Components**

- `Header.jsx` - Application header with logo and language switcher
- `Layout.jsx` - Main layout wrapper
- `Footer.jsx` - Application footer

#### **Authentication Components**

- `LoginForm.jsx` - User login form
- `RegisterPage.jsx` - User registration page
- `ForgotPasswordPage.jsx` - Forgot password form
- `EmailVerificationPage.jsx` - Email verification confirmation
- `TokenVerificationPage.jsx` - Token verification handler
- `PasswordResetPage.jsx` - Password reset form
- `RegistrationSuccessPage.jsx` - Registration success page

#### **Dashboard Components**

- `DashboardSidebar.jsx` - Reusable sidebar navigation with logo
- `DashboardLayout.jsx` - Layout wrapper with sidebar and main content
- `DashboardPage.jsx` - Overview dashboard page

#### **Feature Pages**

- `src/components/accounts/AccountsPage.jsx` - Accounts management page
- `src/components/transactions/TransactionsPage.jsx` - Transactions management page
- `src/components/budgets/BudgetsPage.jsx` - Budget management page
- `src/components/categories/CategoriesPage.jsx` - Categories management page

#### **Common Components**

- `FormField.jsx` - Reusable form input component
- `Button.jsx` - Reusable button component
- `ErrorMessage.jsx` - Error message display
- `PasswordStrengthMeter.jsx` - Password strength indicator
- `LanguageSwitcher.jsx` - Language selection component
- `SocialButton.jsx` - Social login buttons

### Key Files for Developers

#### **🔧 Configuration**

- `src/config/api.js` - API configuration and endpoints
- `src/constants/validation.js` - Validation rules and error messages
- `src/constants/socialProviders.js` - Social login provider configurations

#### **🌐 Internationalization**

- `src/contexts/LanguageContext.jsx` - Language management context
- `src/translations/en.json` - English translations
- `src/translations/vi.json` - Vietnamese translations

#### **🔌 Services**

- `src/services/authService.js` - Authentication API calls
- `src/services/apiService.js` - Generic API service utilities
- `src/utils/tokenManager.js` - Token storage and management
- `src/utils/errorHandler.js` - Error handling utilities

#### **✅ Validation**

- `src/utils/validation.js` - Form validation utilities
- `src/utils/passwordValidation.js` - Password-specific validation

## 🛠️ Development Guide

### Adding New Translations

1. **Add translation keys** to both language files:

   ```json
   // src/translations/en.json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "Description in English"
     }
   }
   ```

   ```json
   // src/translations/vi.json
   {
     "newFeature": {
       "title": "Tính năng mới",
       "description": "Mô tả bằng tiếng Việt"
     }
   }
   ```

2. **Use in components**:

   ```jsx
   import { useLanguage } from "../../contexts/LanguageContext";

   const { t } = useLanguage();
   return <h1>{t("newFeature.title")}</h1>;
   ```

### Adding New API Endpoints

1. **Add endpoint** to `src/config/api.js`:

   ```javascript
   export const API_ENDPOINTS = {
     // ... existing endpoints
     NEW_ENDPOINT: "/api/v1/new-endpoint",
   };
   ```

2. **Create service function** in `src/services/authService.js`:

   ```javascript
   export const newApiCall = async (data, t = null) => {
     try {
       const response = await fetch(getApiUrl(API_ENDPOINTS.NEW_ENDPOINT), {
         method: "POST",
         headers: getApiHeaders(false),
         body: JSON.stringify(data),
       });

       // Handle response...
     } catch (error) {
       return {
         success: false,
         error: handleNetworkError(error, t),
       };
     }
   };
   ```

### Adding New Form Validation

1. **Add validation rules** to `src/constants/validation.js`:

   ```javascript
   export const VALIDATION_RULES = {
     // ... existing rules
     NEW_FIELD: {
       REQUIRED: "validation.newFieldRequired",
       INVALID: "validation.newFieldInvalid",
     },
   };
   ```

2. **Create validation function** in `src/utils/validation.js`:
   ```javascript
   export const validateNewField = (value, t) => {
     if (!value) {
       return t
         ? t(VALIDATION_RULES.NEW_FIELD.REQUIRED)
         : VALIDATION_RULES.NEW_FIELD.REQUIRED;
     }
     // Add validation logic...
     return "";
   };
   ```

## 🔄 State Management

### Language Context

- **Provider**: `LanguageProvider` in `App.jsx`
- **Hook**: `useLanguage()` for accessing translations
- **State**: Current language and translation function
- **Persistence**: Language preference saved in localStorage

### Form State

- **Local State**: Each form component manages its own state
- **Validation**: Real-time and on-blur validation
- **Error Handling**: Centralized error display

### Authentication State

- **Token Storage**: Secure token management via `tokenManager.js`
- **API Integration**: Centralized authentication services
- **Route Protection**: Automatic redirects for unauthenticated users

## 🎨 Styling

### Design System

- **Framework**: Tailwind CSS
- **Colors**: Custom color palette defined in `tailwind.config.js`
- **Typography**: Inter font family
- **Components**: Consistent design patterns across all components

### Key Color Classes

- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary brand color
- `text-primary` - Primary text color
- `bg-error` - Error state color

## 🧪 Testing

### Manual Testing Checklist

- [ ] Registration flow (email → verification → password → success)
- [ ] Login flow with valid/invalid credentials
- [ ] Forgot password flow (email → verification → password reset)
- [ ] Language switching on all pages
- [ ] Form validation (email, password, confirm password)
- [ ] Password strength meter
- [ ] Error handling (network errors, API errors)
- [ ] Responsive design (mobile, tablet, desktop)

### API Testing

```bash
# Start mock server
npm run server

# Test endpoints
curl -X POST http://localhost:3001/users
curl -X GET http://localhost:3001/users
```

## 🚀 Deployment

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Login User

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Token

```http
POST /api/v1/auth/verify
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "password": "newPassword123",
  "reenterPassword": "newPassword123"
}
```

## 🤝 Contributing

### Code Style Guidelines

- Use functional components with hooks
- Implement proper error handling
- Add translations for all user-facing text
- Follow the existing component structure
- Use TypeScript for new features (if applicable)

### Pull Request Process

1. Create a feature branch
2. Implement changes with proper translations
3. Test on multiple screen sizes
4. Update documentation if needed
5. Submit pull request with detailed description

## 🐛 Troubleshooting

### Common Issues

#### Language Switcher Not Working

- Check if `LanguageProvider` wraps the app in `App.jsx`
- Verify translation keys exist in both language files
- Ensure `useLanguage` hook is imported correctly

#### API Calls Failing

- Verify `VITE_API_BASE_URL` environment variable
- Check network connectivity
- Review API endpoint configurations in `src/config/api.js`

#### Form Validation Issues

- Check validation rules in `src/constants/validation.js`
- Verify validation functions in `src/utils/validation.js`
- Ensure translation keys are properly set

## 📞 Support

For questions or issues:

- Check the troubleshooting section above
- Review the component documentation
- Contact the development team

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
