## Ramig FF ReactJS

Modern React 19 + TypeScript + Vite 7 application for exploring and trading prediction markets with a unified UI. It ships with a polished dark UI, fast client state via Zustand, data fetching with TanStack Query, and a modular architecture designed for plugging in real provider APIs.

### What you get
- Clean, modern layout with left navigation, top activity bar, watchlist sidebar, and a trading ticket/right sidebar
- Explore page with provider filters, full‑text search, and animated cards
- Terminal overlay with trade ticket, slippage controls, and toast feedback
- Profile area with markets, accounts, and points tabs
- Headless data layer ready for real APIs (mocked locally by default)


## Quick Start

### Requirements
- Node.js 18+ (LTS) or 20+
- npm 9+ (bundled with Node)

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Create `.env.local` (root). If you skip `VITE_API_URL`, the app will run with mocked/demo data only and any API calls will intentionally throw to avoid accidental network usage.

```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws

# Optional: serve under a sub-path (affects router assets and links)
# Examples: "/" (default), "/app/", "/ramig/" — must end with a trailing slash
VITE_BASE_PATH=/
```

Key notes:
- `VITE_API_URL` is consumed by the `ApiClient` in `src/services/api.ts`. When empty, any API call throws: "API not configured…".
- `VITE_WS_URL` is used by `makeWS` in `src/services/ws.ts` for reconnecting sockets.
- `VITE_BASE_PATH` is read by `vite.config.ts` and must end with `/`.

### 3) Start the app (development)
```bash
npm run dev
```
Open the URL from the console (usually `http://localhost:5173`).

### 4) Build & preview
```bash
npm run build
npm run preview
```
Build output lives in `dist/`.


## Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Type‑check (`tsc -b`) then build with Vite
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint over the project


## Architecture Overview

### Foundations
- React 19 + TypeScript
- Router: `react-router-dom` (root: `src/App.tsx`)
- Build: Vite 7 with React SWC plugin (`vite.config.ts`)
- Styling: Tailwind CSS v4 tokens + custom CSS variables (`src/index.css`)
- State: Zustand stores (`src/store/*`)
- Data fetching: TanStack Query (provider instantiated in `src/App.tsx`)
- Tables/Virtualization: TanStack Table/Virtual (available for future lists)
- Charts: `lightweight-charts` (infra is ready; sample imagery included)

### Client services
- `src/services/api.ts` — Minimal `ApiClient` wrapper around `fetch` with JSON handling and explicit "not configured" guard.
- `src/services/markets.ts` — `listMarkets`, `getMarket` (use `ApiClient` when configured; otherwise return empty results).
- `src/services/accounts.ts` — `listAccounts` (same pattern as markets).
- `src/services/ws.ts` — `makeWS(url)` using `reconnecting-websocket`.

### State stores (Zustand)
- `src/store/ui.ts` — UI state for right sidebar, watchlist sidebar, and full‑screen terminal overlay. Also includes a lightweight toast system with auto‑dismiss.
- `src/store/watchlist.ts` — Bookmark/watchlist store using a `Map<string, CardData>`.
- `src/store/filters.ts` — Provider filter set; Explore page uses it to filter displayed markets.

### UI layout
- `src/components/Layout/Layout.tsx` — Shell with fixed left nav, fixed top bar, scrollable outlet, watchlist sidebar, right trading sidebar, and terminal overlay.
- `src/components/Layout/LeftNav.tsx` — App navigation (Explore, Bookmarks, Profile shortcut).
- `src/components/Layout/TopNav.tsx` — Activity bar (“My Positions” / “My Balances”) with auth/registration modals.
- `src/components/Layout/RightSidebar.tsx` — Trading ticket with list/detail views, sanitized currency inputs, slippage control, and toast feedback.
- `src/components/Terminal/TerminalOverlay.tsx` — Full‑screen trade terminal over the main layout with outcomes list and ticket.

### Feature routes
- `src/routes/explore/Explore.tsx` — Explore markets using demo data from `src/models/card.ts` with search and filters.
- `src/routes/terminal/Terminal.tsx` — Page placeholder (the app primarily uses the terminal overlay).
- `src/routes/profile/*` — Profile hub with subroutes: My Profile, Markets, Accounts, Points.

### Data model & demo content
- `src/models/card.ts` — Canonical `CardData` and `Outcome` types plus `demoCards` fixtures. This powers the Explore page locally.
- `src/config/providers.ts` — Visual configuration per provider (icon, colors) consumed across components.


## Directory Layout (high‑value paths)
- `src/main.tsx` — App entry, global styles
- `src/App.tsx` — Router + TanStack Query provider
- `src/components/*` — Layout, cards, tabs, modals, terminal, watchlist UI
- `src/routes/*` — Page‑level routes (Explore, Terminal, Profile and nested)
- `src/services/*` — API client, markets/accounts services, WebSocket helper
- `src/store/*` — Zustand stores (UI, filters, watchlist, toasts)
- `src/models/*` — Shared types and demo data
- `src/utils/*` — Search helpers and misc utilities
- `public/*` — Static assets (icons, fonts, images)


## How It Works (end‑to‑end)

1) You land on Explore (`/`). The page reads selected providers from `useProviderFilters`. Demo cards (`demoCards`) are filtered by provider and by full‑text search using `filterByQuery`.

2) Clicking a card calls `useUIStore().openRightSidebar(card)`, which mounts the trading `RightSidebar`. The sidebar animates in/out and persists a few in‑view settings (e.g., slippage in sessionStorage while open).

3) The “Open Terminal” pattern uses `useUIStore().openTerminal(card)` to show the `TerminalOverlay` above the layout. The overlay presents outcomes, a chart area (imagery by default), and a buy/sell ticket with slippage and amount/price inputs. Submit actions fire toasts using the built‑in toast store.

4) Profile (`/profile`) groups user‑centric actions. The Accounts tab demonstrates deposit/withdraw modals with clipboard copy and simple estimates; you can wire these to real endpoints later.

5) Data flow: When `VITE_API_URL` is configured, services in `src/services/*` use `ApiClient` to call your backend. If it is not configured, the helpers return empty results (or throw if you call `api.request` directly) to make it obvious that you’re still in mock mode.


## Wiring a Real Backend

1) Enable API calls: set `VITE_API_URL` in `.env.local` and restart the dev server.

2) Implement endpoints on your server to match the minimal shapes used by the services:

```json
// GET /accounts
[
  { "id": "acc_1", "provider": "polymarket", "balance": 2563.5, "currency": "USD" }
]
```

```json
// GET /markets
[
  { "id": "mkt_1", "name": "US inflation below 3% by Dec 2025?", "source": "kalshi", "lastPrice": 0.42 }
]
```

```json
// GET /markets/:marketId
{ "id": "mkt_1", "name": "US inflation below 3% by Dec 2025?", "source": "kalshi", "lastPrice": 0.42 }
```

3) Use TanStack Query to fetch and cache. Example pattern (replace demo in Explore):
```ts
// Pseudocode example
// const { data: markets } = useQuery({ queryKey: ['markets'], queryFn: listMarkets });
```

4) WebSockets (optional): set `VITE_WS_URL` and use `makeWS` for live updates. The helper reconnects with backoff.


## Styling & Theming
- Tailwind v4 with custom CSS variables in `src/index.css`
- Tokens like `--brand-underline-gradient` drive underline/indicator visuals
- Fonts are self‑hosted from `public/fonts/*` and loaded via `@font-face`
- Utility classes for animations and gradient borders are centralized in `index.css`


## Routing & Deploy Notes
- Router: `createBrowserRouter` with nested routes inside `Layout`
- Deploying under a sub‑path: set `VITE_BASE_PATH` (must end with `/`) before building
- SPA hosting: configure a fallback/rewrite to `index.html` (e.g., Vercel/Netlify “SPA mode”) to avoid 404s on refresh


## Development Tips
- Keep provider UI styles in `src/config/providers.ts` to avoid scattering color/icon logic
- Add new modals under `src/components/Modals/*` and compose them in `TopNav`/pages
- Prefer TanStack Query for async data and caching; colocate queries near components
- Keep state in small, focused Zustand stores; avoid deep prop drilling
- Use the toast helpers in `useToast` for consistent UX feedback


## Troubleshooting
- API not configured: set `VITE_API_URL` in `.env.local` and restart the dev server
- Sub‑path 404s: set `VITE_BASE_PATH` (e.g., `/myapp/`) and rebuild; configure SPA rewrites
- Port conflicts: Vite auto‑selects a new port; check the dev server output
- Fonts not loading: ensure `public/fonts/*` paths resolve (respect base path in production)
- Stale build: clear `node_modules` and `package-lock.json`, reinstall, and rebuild


## FAQ
- Can I use HashRouter instead of BrowserRouter? Yes, but you’ll lose pretty URLs; change router creation in `src/App.tsx`.
- Where do I add a new provider? Extend `ProviderKey` and add an entry in `src/config/providers.ts`. Use its keys in `CardData.provider`.
- How do I enable real data on Explore? Replace the `demoCards` usage with a query calling `listMarkets()` and map the server’s shape into `CardData` (or adjust the UI to your server model).
- Does the trading ticket place real orders? Not yet. It’s wired for UX (validation, slippage, toasts). Connect its actions to your backend when ready.


## License
This repository is private and unlicensed. If you intend to open‑source, add a license file and update this section.


## Acknowledgements
- React, Vite, Tailwind CSS, TanStack Query/Table/Virtual, Zustand
- `reconnecting-websocket` for reliable WS connections

— Built for clarity, speed, and extensibility.
