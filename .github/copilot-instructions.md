## Purpose
Help AI coding agents become productive quickly in this repo by highlighting architecture, conventions, workflows, and key integration points.

## Quick orientation
- Tech: React + Vite, TailwindCSS. Dev server: `npm run dev` (Vite). Mock API: `npm run server` (json-server on port 3001).
- Env: `VITE_API_BASE_URL` overrides `src/config/api.js` default `http://localhost:8080`.
- State/data fetching: `@tanstack/react-query` is installed; many services use native `fetch` via `src/services/apiService.js` and `src/utils/apiInterceptor.js`.

## Architecture & data flow (high level)
- UI components call hooks in `src/hooks/` (e.g. `useTransactions`) which call services in `src/services/` (e.g. `transactionService`, `authService`).
- Services use `src/config/api.js` helpers (`getApiUrl`, `getApiHeaders`) to construct requests.
- Access tokens are stored in `sessionStorage` via `src/utils/tokenManager.js`. Refresh tokens are stored in HTTP-only cookies (not accessible to JavaScript).
- Token refresh happens automatically via `src/utils/tokenRefreshManager.js` (singleton) every 2 minutes.
- Cross-component auth events use the DOM event bus: `window.dispatchEvent(new CustomEvent(...))` (e.g. `authTokensStored`, `tokenRefreshed`).

## Key files to inspect for changes
- API and headers: `src/config/api.js`
- Generic HTTP: `src/services/apiService.js`
- Auth flows: `src/services/authService.js`, `src/utils/tokenManager.js`, `src/utils/tokenRefreshManager.js`, `src/utils/apiInterceptor.js`
- Transactions + filters: `src/hooks/useTransactions.js` and `src/components/transactions/` (see `README.md` in that folder for filter conventions)
- i18n: `src/translations/` — use translation keys rather than hard-coded strings.

## Important conventions and gotchas
- Tokens: stored in `sessionStorage` (not localStorage) — expect tab-lifetime tokens and explicit removal on logout.
- Token refresh is periodic (interval in `tokenRefreshManager`) and may redirect to `/login` on invalid refresh token.
- API methods return raw `fetch` responses in some utils and normalized `{ success, data, error }` objects in services — inspect the service you modify.
- Although `axios` is listed in `package.json`, the codebase predominantly uses `fetch` through `apiService` and `apiInterceptor`.

## Developer workflows
- Start local mock backend (optional): `npm run server` (json-server watches `db.json` on port 3001).
- Start frontend: `npm run dev` (Vite). To preview production build: `npm run build` then `npm run preview`.
- Linting: `npm run lint` uses ESLint config at project root.

## Pull request & change guidance for AI agents
- Prefer minimal, focused changes. Update only files needed to implement a behavior.
- When editing API calls, update `src/config/api.js` usage and ensure headers include `getAuthHeader()` when appropriate.
- When changing auth flow, ensure `tokenRefreshManager.start()` is invoked after storing tokens and that `removeTokens()` is called on logout.
- Preserve event names (`authTokensStored`, `tokenRefreshed`) to avoid breaking components that listen on `window`.

## Examples (patterns to mimic)
- Add authenticated GET: use `apiGet(API_ENDPOINTS.CATEGORIES)` (or `apiCall` with `getApiHeaders(true)`). See `src/services/apiService.js`.
- Update token storage: use `storeTokens(token)` in `src/utils/tokenManager.js` and call `tokenRefreshManager.start()` after successful login (see `src/services/authService.js`). Refresh tokens are managed via HTTP-only cookies.
- Implement transaction filters by following `src/hooks/useTransactions.js` patterns: build `filterPayload` objects and call `fetchTransactions(page, size, payload)`.

## Missing / not configured
- No test script in `package.json` — unit tests are not configured in scripts.

## Feedback
If any section is unclear or you'd like more examples (component props, event listeners, or API response shapes), tell me which area to expand.
