# Ramig FF - Prediction Markets Trading Platform

A modern, full-featured React 19 + TypeScript + Vite 7 application for exploring and trading prediction markets with real-time interactive charts, unified UI, and seamless multi-provider integration.

## ✨ Features

### 🎨 **Modern UI/UX**
- Sleek dark theme optimized for trading
- Responsive layout with smooth animations
- Left navigation, top activity bar, and dynamic sidebars
- Toast notifications for real-time feedback
- Flash effects and state persistence

### 📊 **Interactive Charts**
- **Real-time line charts** with multiple outcome tracking
- **Candlestick charts** with OHLC data visualization
- **Zoom controls** (in, out, reset) with smooth transitions
- **Time period presets** (15m, 1h, 6h, 1d, All) as quick zoom levels
- **15-minute granularity** - drill down to fine-grained market movements
- **Chart type toggle** - seamlessly switch between line and candlestick views
- Powered by `lightweight-charts` library by TradingView

### 💹 **Trading Features**
- **Full trading terminal** with buy/sell tickets
- **Slippage controls** with visual slider
- **Limit and market orders**
- **Amount validation** and balance checking
- **Multi-outcome markets** support
- **Real-time price updates** ready for WebSocket integration

### 🔍 **Market Explorer**
- Advanced filtering by providers (Polymarket, Kalshi, Metaculus, etc.)
- Full-text search across markets
- Animated card grid with hover effects
- Provider icons and color-coded badges
- Quick access to market details

### 📁 **User Profile**
- Markets dashboard
- Account management with deposit/withdraw
- Points tracking system
- Multi-account support across providers

### 🎯 **Watchlist & Bookmarks**
- Persistent watchlist with Zustand state management
- Quick add/remove from any view
- Resizable sidebar
- Flash animations on card updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS) or 20+
- **npm** 9+ (bundled with Node)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
# .env.local

# API Configuration (optional - runs with demo data if not set)
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws

# Base Path (for deploying under sub-path)
VITE_BASE_PATH=/
```

**Key Notes:**
- `VITE_API_URL` - Backend API endpoint (app uses demo data if not configured)
- `VITE_WS_URL` - WebSocket endpoint for real-time updates
- `VITE_BASE_PATH` - Must end with `/` (e.g., `/app/`, `/ramig/`)

### 3. Start Development Server

```bash
npm run dev
```

Open the URL shown in console (usually `http://localhost:5174/`)

### 4. Build for Production

```bash
npm run build
npm run preview
```

Build output is generated in the `dist/` directory.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on entire project |

---

## 📊 Chart System (Interactive Data Visualization)

### Overview

The application features a comprehensive interactive charting system that replaces static images with real-time, zoomable charts powered by **lightweight-charts v5** (TradingView).

### Chart Components

#### 1. **Line Chart** (`Chart.tsx`)
The primary chart component for displaying multi-outcome prediction markets.

**Features:**
- Multiple colored series for different outcomes
- Interactive crosshair for data inspection
- Smooth zoom in/out with programmable controls
- Responsive resizing
- 15-minute data granularity (2,880 data points over 30 days)
- Time-based zoom presets

**Usage:**
```tsx
import Chart, { type ChartHandle } from './components/Chart/Chart';
import { getCardChartData } from './utils/chartData';

function MyComponent({ card }) {
  const chartRef = useRef<ChartHandle>(null);
  const chartData = useMemo(
    () => getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage),
    [card]
  );
  
  return (
    <>
      <Chart ref={chartRef} series={chartData} height={300} />
      <button onClick={() => chartRef.current?.zoomIn()}>Zoom In</button>
    </>
  );
}
```

#### 2. **Candlestick Chart** (`CandlestickChart.tsx`)
Professional OHLC (Open, High, Low, Close) chart for trading-style visualization.

**Features:**
- 1-hour candles aggregated from 15-minute data
- Green/red candles for up/down movements
- Automatic conversion from line data
- Same zoom and time period controls as line charts

**Usage:**
```tsx
import CandlestickChart, { type CandlestickChartHandle } from './components/Chart/CandlestickChart';
import { getCardChartData, convertLineToCandlestickData } from './utils/chartData';

const lineData = getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage);
const candlestickData = convertLineToCandlestickData(lineData, 1); // 1-hour candles

return <CandlestickChart ref={chartRef} series={candlestickData} height={300} />;
```

#### 3. **Mini Chart** (`MiniChart.tsx`)
Compact sparkline for card previews and small spaces.

**Features:**
- Minimal design without axes
- Single-line visualization
- Perfect for thumbnails
- Ultra-lightweight

**Usage:**
```tsx
import MiniChart from './components/Chart/MiniChart';
import { generateSparklineData } from './utils/chartData';

const data = generateSparklineData(card.yesPercentage, 7);
return <MiniChart data={data} color="#31D482" height={60} />;
```

### Chart Data Generation

All chart data is generated by `src/utils/chartData.ts` with realistic market behavior.

#### Key Functions

**`getCardChartData(outcomes?, yesPercentage?, noPercentage?)`**
Smart function that automatically handles both multi-outcome and yes/no markets.

```tsx
// Multi-outcome market
const chartData = getCardChartData([
  { label: '50+ bps decrease', probability: 80 },
  { label: '25 bps decrease', probability: 15.8 },
  { label: 'No change', probability: 4.5 },
]);

// Yes/No market
const chartData = getCardChartData(undefined, 65, 35);
```

**`generatePredictionMarketChartData(outcomes)`**
Creates realistic time-series data for prediction markets.

- 30 days of historical data
- 15-minute intervals (96 points per day = 2,880 total points)
- Multiple wave patterns for realistic movement
- Momentum and volatility modeling
- Random shocks simulating news events
- Outcomes sum to 100% (market constraint)

**`convertLineToCandlestickData(lineData, hoursPerCandle)`**
Converts line chart data into OHLC candlestick format.

```tsx
const candlestickData = convertLineToCandlestickData(lineData, 1);
// Returns 1-hour candles aggregated from 15-minute data
```

**`getVisibleTimeRange(period, latestTime?)`**
Calculates timestamp ranges for time period presets.

| Period | Range Displayed | Purpose |
|--------|----------------|---------|
| `15m` | Last 6 hours | Clear 15-minute intervals |
| `1h` | Last 2 days | Hourly data visibility |
| `6h` | Last 7 days | Weekly overview |
| `1d` | Last 14 days | Two-week trends |
| `All` | Full 30 days | Complete history |

### Chart Controls & Interactions

#### Zoom Controls

All charts expose these methods via refs:

```tsx
const chartRef = useRef<ChartHandle>(null);

chartRef.current?.zoomIn();      // Zoom in by 25%
chartRef.current?.zoomOut();     // Zoom out by 25%
chartRef.current?.zoomReset();   // Reset to fit all data
chartRef.current?.setVisibleTimeRange(from, to); // Jump to specific range
```

#### Time Period Buttons

Time period buttons act as **zoom presets** that jump to specific views:

- Click **"15m"** → Zoom to last 6 hours (perfect for seeing 15-minute candles)
- Click **"1h"** → Zoom to last 2 days (hourly overview)
- Click **"6h"** → Zoom to last 7 days
- Click **"1d"** → Zoom to last 14 days
- Click **"All"** → Show full 30-day range

**Users can still manually zoom beyond these presets!** The manual zoom controls allow free exploration of any time range.

#### Chart Type Toggle

In `TerminalOverlay.tsx`, users can switch between chart types:

```tsx
<button onClick={() => setChartType('line')}>
  <img src="/Chart--line.svg" />
</button>
<button onClick={() => setChartType('candlestick')}>
  <img src="/Chart--candlestick.svg" />
</button>
```

### Where Charts Are Used

1. **`src/components/Layout/RightSidebar.tsx`**
   - Line chart at 240px height
   - Time period and zoom controls
   - Updates on card selection

2. **`src/components/Terminal/TerminalOverlay.tsx`**
   - Line chart at 320px height (larger terminal view)
   - Candlestick chart toggle
   - Full zoom and time period controls
   - Chart type switcher

### Color Scheme

Standardized colors for market outcomes:

| Outcome | Color | Hex Code |
|---------|-------|----------|
| Primary Yes | Green | `#31D482` |
| Primary No | Red | `#F97066` |
| Outcome 1 | White | `#FFFFFF` |
| Outcome 2 | Green | `#179F61` |
| Outcome 3 | Blue | `#0BA5EC` |
| Outcome 4 | Yellow-Green | `#DCF58D` |
| Outcome 5 | Pink | `#EE46BC` |
| Outcome 6 | Purple | `#7A5AF8` |
| Outcome 7 | Orange | `#F79009` |

### Performance

- ✅ Handles 2,880 data points smoothly
- ✅ `useMemo` hooks prevent unnecessary re-renders
- ✅ Efficient cleanup on component unmount
- ✅ Responsive resize handling
- ✅ No TradingView watermark

---

## 🏗️ Architecture

### Tech Stack

- **React 19** with TypeScript
- **Vite 7** with React SWC plugin
- **React Router** for navigation
- **Tailwind CSS v4** for styling
- **Zustand** for state management
- **TanStack Query** for data fetching
- **TanStack Table/Virtual** for lists
- **lightweight-charts v5** for charts
- **reconnecting-websocket** for live updates

### Project Structure

```
src/
├── components/
│   ├── Chart/
│   │   ├── Chart.tsx              # Line chart component
│   │   ├── CandlestickChart.tsx   # OHLC candlestick chart
│   │   ├── MiniChart.tsx          # Sparkline component
│   │   ├── ChartExamples.tsx      # Usage examples
│   │   └── README.md              # Chart documentation
│   ├── Layout/
│   │   ├── Layout.tsx             # Main app shell
│   │   ├── LeftNav.tsx            # Navigation sidebar
│   │   ├── TopNav.tsx             # Activity bar
│   │   ├── RightSidebar.tsx       # Trading ticket (with chart)
│   │   └── WatchlistSidebar.tsx   # Bookmarks panel
│   ├── Terminal/
│   │   ├── TerminalOverlay.tsx    # Full-screen terminal (with charts)
│   │   └── OrderBook.tsx          # Outcome list component
│   ├── Card/
│   │   └── Card.tsx               # Market card component
│   ├── Modals/                    # Auth, deposit, withdraw modals
│   └── Tabs/                      # Tab components with animations
├── routes/
│   ├── explore/
│   │   └── Explore.tsx            # Market explorer page
│   ├── profile/
│   │   ├── Profile.tsx            # Profile hub
│   │   ├── my-profile/            # User profile
│   │   ├── accounts/              # Account management
│   │   └── points/                # Points dashboard
│   └── terminal/
│       └── Terminal.tsx           # Terminal page placeholder
├── store/
│   ├── ui.ts                      # UI state (sidebars, terminal, toasts)
│   ├── watchlist.ts               # Bookmark management
│   └── filters.ts                 # Provider filters
├── services/
│   ├── api.ts                     # API client wrapper
│   ├── markets.ts                 # Market data services
│   ├── accounts.ts                # Account services
│   └── ws.ts                      # WebSocket helper
├── utils/
│   ├── chartData.ts               # Chart data generation
│   └── search.ts                  # Search utilities
├── models/
│   ├── card.ts                    # CardData types & demo data
│   └── accounts.ts                # Account types
├── config/
│   └── providers.ts               # Provider configs (icons, colors)
├── App.tsx                        # Router & Query provider
├── main.tsx                       # Entry point
└── index.css                      # Global styles & Tailwind config
```

### State Management (Zustand)

#### **UI Store** (`src/store/ui.ts`)
- Right sidebar state (open/close, selected card)
- Watchlist sidebar state (open/close, width)
- Terminal overlay state (open/close, selected card)
- Toast system (success, error, processing notifications)
- Preset system for deep-linking to specific views

#### **Watchlist Store** (`src/store/watchlist.ts`)
- Bookmark management using `Map<string, CardData>`
- Add/remove/toggle bookmarks
- Persistence ready

#### **Filters Store** (`src/store/filters.ts`)
- Provider selection (Polymarket, Kalshi, Metaculus, etc.)
- Used by Explore page for filtering

### Data Flow

1. **Demo Mode (Default)**
   - Uses `demoCards` from `src/models/card.ts`
   - Charts display realistic dummy data
   - All UI features fully functional

2. **API Mode (When `VITE_API_URL` is configured)**
   - Services in `src/services/*` call backend APIs
   - TanStack Query handles caching and updates
   - WebSocket for real-time price updates

3. **Chart Updates**
   - Charts re-generate data when selected card changes
   - `useMemo` prevents unnecessary recalculations
   - Smooth transitions between different markets

---

## 🔌 Connecting to Real APIs

### Step 1: Configure API URL

Set `VITE_API_URL` in `.env.local` and restart the dev server:

```bash
VITE_API_URL=https://your-api-endpoint.com
VITE_WS_URL=wss://your-api-endpoint.com/ws
```

### Step 2: Implement Backend Endpoints

Your backend should provide these endpoints:

**GET /markets**
```json
[
  {
    "id": "mkt_1",
    "title": "Will inflation be below 3% by Dec 2025?",
    "provider": "kalshi",
    "yesPercentage": 65.5,
    "noPercentage": 34.5,
    "liquidity": "$2.5M",
    "category": "Economics",
    "outcomes": [
      { "label": "Yes", "probability": 65.5 },
      { "label": "No", "probability": 34.5 }
    ]
  }
]
```

**GET /markets/:marketId**
```json
{
  "id": "mkt_1",
  "title": "Will inflation be below 3% by Dec 2025?",
  "provider": "kalshi",
  "yesPercentage": 65.5,
  "noPercentage": 34.5,
  "history": [
    { "time": 1640000000, "value": 60.5 },
    { "time": 1640003600, "value": 61.2 },
    ...
  ]
}
```

**GET /markets/:marketId/history**
For real chart data:
```json
[
  { "time": 1640000000, "value": 60.5 },
  { "time": 1640003600, "value": 61.2 },
  { "time": 1640007200, "value": 62.1 }
]
```

**GET /accounts**
```json
[
  {
    "id": "acc_1",
    "provider": "polymarket",
    "balance": 2563.50,
    "currency": "USD"
  }
]
```

### Step 3: Replace Demo Data

In your components, replace `getCardChartData()` with real API data:

```tsx
// Before (demo data)
const chartData = getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage);

// After (real API data)
const { data: historyData } = useQuery({
  queryKey: ['market-history', card.id],
  queryFn: () => api.request(`/markets/${card.id}/history`)
});

const chartData = historyData?.map(outcome => ({
  label: outcome.label,
  color: outcome.color,
  data: outcome.history
})) || [];
```

### Step 4: WebSocket Integration

For real-time updates:

```tsx
import { makeWS } from './services/ws';

const ws = makeWS(import.meta.env.VITE_WS_URL);

ws.addEventListener('message', (event) => {
  const update = JSON.parse(event.data);
  // Update chart data, prices, etc.
});
```

---

## 🎨 Styling & Theming

### Tailwind CSS v4

- Custom CSS variables in `src/index.css`
- Dark theme by default
- Custom animations and transitions
- Gradient utilities for underlines and borders

### Key CSS Variables

```css
--brand-underline-gradient: linear-gradient(90deg, #12B76A, #0BA5EC, #EE46BC, #7A5AF8, #F79009);
--customBg: #0D0D0D;
--customGray17: #171717;
--customGray44: #2C2C2C;
```

### Custom Utilities

```css
.panel-transition  /* Smooth panel animations */
.flash-once        /* Flash effect on updates */
.animate-rsb-in    /* Right sidebar slide in */
.animate-rsb-out   /* Right sidebar slide out */
```

### Fonts

Self-hosted fonts in `public/fonts/`:
- **Source Sans 3** (regular, semibold, bold)
- **Geist Mono** (monospace for numbers)

---

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

Output goes to `dist/` directory.

### Sub-Path Deployment

To deploy under a sub-path (e.g., `https://example.com/app/`):

1. Set `VITE_BASE_PATH` in `.env.local`:
```bash
VITE_BASE_PATH=/app/
```

2. Rebuild:
```bash
npm run build
```

3. Configure your server to rewrite all requests to `index.html`

### Static Hosting (Vercel, Netlify)

- Enable **SPA mode** or set up rewrites to `index.html`
- All routes will work correctly
- Assets will load from the correct base path

### Docker Deployment

Example `Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Development Tips

### Adding a New Market Provider

1. Add provider to `src/config/providers.ts`:
```tsx
export const PROVIDER_CONFIGS = {
  // ...
  newprovider: {
    icon: '/icons/newprovider.svg',
    bgHex: '#FF5733',
    label: 'New Provider'
  }
};
```

2. Update `ProviderKey` type
3. Use in card data: `card.provider = 'newprovider'`

### Creating Custom Modals

1. Create component in `src/components/Modals/`
2. Import in `TopNav.tsx` or relevant parent
3. Use Zustand for modal state
4. Follow existing modal patterns for animations

### Adding New Chart Types

The chart system is extensible:

1. Create new component in `src/components/Chart/`
2. Follow the pattern from `Chart.tsx` or `CandlestickChart.tsx`
3. Use `forwardRef` and `useImperativeHandle` for zoom controls
4. Add data conversion utilities to `src/utils/chartData.ts`

### Performance Optimization

- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers
- Keep Zustand stores small and focused
- Avoid deep prop drilling - use context or Zustand
- Lazy load heavy components with `React.lazy()`

---

## 🐛 Troubleshooting

### Chart Not Displaying

- Check console for errors
- Ensure parent container has defined height
- Verify data format matches `ChartSeries` type
- Check that `lightweight-charts` is installed

### API Not Working

- Verify `VITE_API_URL` is set correctly
- Restart dev server after changing `.env.local`
- Check network tab for failed requests
- Ensure backend CORS is configured

### Time Periods Not Working

- Check that `getVisibleTimeRange()` is imported
- Verify chart refs are properly initialized
- Ensure `setVisibleTimeRange()` method exists on chart

### Build Errors

- Clear `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check TypeScript errors: `npm run build`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Port Already in Use

Vite will automatically try another port. Check console output for the actual port being used.

---

## 📚 Additional Resources

### Documentation

- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **TailwindCSS:** https://tailwindcss.com
- **Zustand:** https://zustand-demo.pmnd.rs
- **TanStack Query:** https://tanstack.com/query
- **lightweight-charts:** https://tradingview.github.io/lightweight-charts/

### Chart Examples

See `src/components/Chart/ChartExamples.tsx` for 8 comprehensive examples covering:
- Basic usage
- Multi-outcome markets
- Custom styling
- Responsive layouts
- Side-by-side comparisons

---

## 🎯 Roadmap

### Completed ✅
- ✅ Interactive line charts
- ✅ Candlestick charts
- ✅ Zoom controls (in, out, reset)
- ✅ Time period presets (15m, 1h, 6h, 1d, All)
- ✅ 15-minute data granularity
- ✅ Chart type toggle
- ✅ Multi-outcome market support
- ✅ Realistic dummy data generation

### Planned 🚀
- [ ] Real API integration
- [ ] WebSocket live updates
- [ ] Volume overlays on charts
- [ ] Export chart as image
- [ ] Technical indicators (RSI, MACD, etc.)
- [ ] Custom annotations and drawings
- [ ] Split view (multiple charts)
- [ ] Portfolio tracking
- [ ] Historical P&L charts
- [ ] Mobile app (React Native)

---

## 📄 License

This repository is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgements

Built with:
- React, Vite, TypeScript, Tailwind CSS
- TanStack Query, Table, Virtual
- Zustand for state management
- lightweight-charts by TradingView
- reconnecting-websocket

**Built for clarity, speed, and extensibility.**

---

## 📞 Support

For questions or issues, please contact the development team.

---

**Happy Trading! 📈**
