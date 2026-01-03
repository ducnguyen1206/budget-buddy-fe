## Purpose
Repo-specific guide for AI agents working in this React + Vite app.

## Stack & commands
- Dev: `npm run dev` (Vite) • Mock API: `npm run server` (json-server on :3001) • Lint: `npm run lint` • Build/preview: `npm run build` / `npm run preview`
- Base API URL: `import.meta.env.VITE_API_BASE_URL` else `http://localhost:8080` (see `src/config/api.js`)

## Architecture (how code is organized)
- Pages/components in `src/components/**` call hooks in `src/hooks/**` which call API services in `src/services/**`
- API endpoints + headers live in `src/config/api.js` (`API_ENDPOINTS`, `getApiUrl()`, `getApiHeaders(includeAuth)`)

## Auth + tokens (critical conventions)
- Access token is stored in `sessionStorage` under `auth_token` (see `src/utils/tokenManager.js`); language preference is `localStorage.preferred_language` (see `src/contexts/LanguageContext.jsx`)
- Refresh token is server-managed via HTTP-only cookies, so refresh/login flows that rely on it use `credentials: "include"` (see `refreshToken()` + Google login in `src/services/authService.js`)
- Token refresh runs via singleton `src/utils/tokenRefreshManager.js` every 2 minutes; it dispatches `tokenRefreshed`
- Cross-component auth event bus uses DOM events; keep these names stable: `authTokensStored`, `tokenRefreshed` (listeners are wired in `src/App.jsx`)

## Calling the API (pick the right helper)
- For authenticated service calls, prefer `fetchWithAuth()` from `src/utils/apiInterceptor.js` so 401/403 triggers global logout + redirect:
	- Pattern:
		- `const res = await fetchWithAuth(getApiUrl(API_ENDPOINTS.CATEGORIES), { method: "GET", headers: getApiHeaders(true) }, t)`
		- `if (shouldRedirectToLogin(res)) return res` (many services return this “redirect result” directly)
- `src/services/apiService.js` (`apiCall/apiGet/...`) returns a raw `Response` and does NOT apply the global 401/403 redirect wrapper.
- Service return shapes vary:
	- Auth services generally return `{ success, data, error }`
	- Some CRUD services throw on non-`ok` responses (e.g. `src/services/transactionService.js`)

## i18n
- Use `const { t } = useLanguage()` and pass translation keys (fallback is English; missing keys return the key string). Translation JSON: `src/translations/en.json`, `src/translations/vi.json`.

## Transactions + filters
- Transaction filtering UI is modularized under `src/components/transactions/filters/` with shared primitives; follow the conventions in `src/components/transactions/README.md`.
- Filtering/sorting payloads are assembled in `src/hooks/useTransactions.js` and posted to `API_ENDPOINTS.TRANSACTIONS_INQUIRY`.

## Docs
- Global 401/403 behavior is described in `docs/API_401_HANDLING.md` (source of truth is `src/utils/apiInterceptor.js`).
