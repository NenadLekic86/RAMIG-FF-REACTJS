# Chart Components - Quick Reference

This directory contains reusable chart components built with [lightweight-charts v5](https://github.com/tradingview/lightweight-charts).

> **📖 For complete documentation, see the main [README.md](../../../README.md) in the project root.**

## Components at a Glance

### `Chart.tsx` - Line Chart
Multi-series line chart with zoom controls and time period presets.

```tsx
import Chart, { type ChartHandle } from './Chart';
import { getCardChartData } from '../../utils/chartData';

const chartRef = useRef<ChartHandle>(null);
const chartData = getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage);

<Chart ref={chartRef} series={chartData} height={300} />

// Zoom programmatically
chartRef.current?.zoomIn();
chartRef.current?.zoomOut();
chartRef.current?.zoomReset();
chartRef.current?.setVisibleTimeRange(fromTime, toTime);
```

### `CandlestickChart.tsx` - OHLC Chart
Candlestick chart with professional trading view.

```tsx
import CandlestickChart, { type CandlestickChartHandle } from './CandlestickChart';
import { convertLineToCandlestickData } from '../../utils/chartData';

const candlestickData = convertLineToCandlestickData(lineData, 1); // 1-hour candles

<CandlestickChart ref={chartRef} series={candlestickData} height={300} />
```

### `MiniChart.tsx` - Sparkline
Compact chart for small spaces (cards, thumbnails).

```tsx
import MiniChart from './MiniChart';
import { generateSparklineData } from '../../utils/chartData';

const data = generateSparklineData(75, 7);
<MiniChart data={data} color="#31D482" height={60} />
```

## Data Generation (`src/utils/chartData.ts`)

### Main Functions

| Function | Purpose |
|----------|---------|
| `getCardChartData(outcomes?, yes?, no?)` | Smart function - handles multi-outcome or yes/no markets |
| `generatePredictionMarketChartData(outcomes)` | Creates realistic time-series for outcomes |
| `convertLineToCandlestickData(lineData, hours)` | Converts line data to OHLC candles |
| `generateSparklineData(value, days, volatility)` | Simple sparkline data |
| `getVisibleTimeRange(period, latestTime?)` | Calculates time ranges for zoom presets |

### Time Periods

| Period | Range | Use Case |
|--------|-------|----------|
| `15m` | Last 6 hours | Fine-grained 15-min intervals |
| `1h` | Last 2 days | Hourly overview |
| `6h` | Last 7 days | Weekly trends |
| `1d` | Last 14 days | Two-week view |
| `All` | Full 30 days | Complete history |

## Chart Props

### `Chart` / `CandlestickChart`

```tsx
interface ChartProps {
  series: ChartSeries[] | CandlestickChartSeries[];
  height?: number;        // Default: 300
  className?: string;     // Optional CSS classes
}
```

### `MiniChart`

```tsx
interface MiniChartProps {
  data: { time: number; value: number }[];
  color?: string;         // Default: '#3b82f6'
  height?: number;        // Default: 100
  className?: string;
}
```

## Chart Colors

Standard colors for outcomes:

- **Yes:** `#31D482` (Green)
- **No:** `#F97066` (Red)
- **Outcome 1:** `#FFFFFF` (White)
- **Outcome 2:** `#179F61` (Green)
- **Outcome 3:** `#0BA5EC` (Blue)
- **Outcome 4:** `#DCF58D` (Yellow-green)
- **Outcome 5:** `#EE46BC` (Pink)
- **Outcome 6:** `#7A5AF8` (Purple)
- **Outcome 7:** `#F79009` (Orange)

## Where Used

1. **RightSidebar.tsx** - Market detail panel (line chart)
2. **TerminalOverlay.tsx** - Full terminal (line + candlestick toggle)

## Examples

See `ChartExamples.tsx` for comprehensive usage examples:
1. Basic card integration
2. Simple yes/no markets
3. Pre-configured markets
4. Custom multi-outcome
5. Sparklines
6. Side-by-side comparisons
7. Styled charts with controls
8. Responsive implementations

## Data Format

```typescript
interface ChartDataPoint {
  time: number;  // Unix timestamp (seconds)
  value: number; // Price/probability (0-100)
}

interface ChartSeries {
  label: string;    // Outcome name
  color: string;    // Hex color
  data: ChartDataPoint[];
}

interface CandlestickDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}
```

## Technical Notes

- All timestamps are Unix seconds (not milliseconds)
- Charts auto-fit content on mount
- `useMemo` for performance
- Proper cleanup on unmount
- Responsive to window resize
- No TradingView watermark (attribution disabled)

## Performance

- ✅ 2,880 data points (15-min intervals, 30 days)
- ✅ Multiple series supported
- ✅ Smooth 60fps animations
- ✅ Efficient memory usage

---

**For detailed documentation, architecture, and API integration guide, see the [main README.md](../../../README.md).**
