## Ramig FF ReactJS

React 19 + TypeScript + Vite 7 app with Tailwind CSS, Zustand, TanStack Query/Table/Virtual, and Lightweight Charts.

### Requirements
- Node.js 18+ (LTS) or 20+
- npm 9+ (bundled with Node)

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment (optional but recommended)
Create a `.env.local` in the project root to point the app at your API and WebSocket endpoints. Without `VITE_API_URL`, API calls will throw an error by design.

```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws

# Optional: serve app under a sub-path (affects Vite base)
# Examples: "/" (default), "/app/", "/ramig/"
VITE_BASE_PATH=/
```

Notes:
- `VITE_API_URL` is used by `src/services/api.ts`. If not set, the client throws "API not configured. Set VITE_API_URL in your .env file." to avoid accidental network calls.
- `VITE_WS_URL` is used where WebSockets are needed via `src/services/ws.ts`.
- `VITE_BASE_PATH` controls the Vite `base` option (see `vite.config.ts`). If you deploy under a sub-path, ensure it ends with `/`.

### 3) Start the app (local development)
```bash
npm run dev
```
Then open the printed URL (usually `http://localhost:5173`).

### 4) Build for production
```bash
npm run build
```
This outputs a production build to `dist/`.

Optional preview of the built app:
```bash
npm run preview
```

### Lint (optional)
```bash
npm run lint
```

### Tech stack highlights
- Vite for dev/build (`vite.config.ts` respects `VITE_BASE_PATH`)
- React 19 with SWC (`@vitejs/plugin-react-swc`)
- Tailwind CSS v4
- State: Zustand
- Data: TanStack Query/Table/Virtual
- Charts: `lightweight-charts`

### Troubleshooting
- API not configured error: set `VITE_API_URL` in `.env.local` and restart the dev server.
- 404s when deploying under a sub-path: set `VITE_BASE_PATH` (e.g. `/myapp/`) before building.
- Port conflict on 5173: Vite will choose another port; check the terminal output.
- Clean install issues: remove `node_modules` and `package-lock.json`, then `npm install`.
