import type { ChartSeries } from '../components/Chart/Chart';
import type { CandlestickChartSeries, CandlestickDataPoint } from '../components/Chart/CandlestickChart';

/**
 * Time periods for chart display (now used as zoom presets)
 */
export type TimePeriod = '15m' | '1h' | '6h' | '1d' | 'All';

/**
 * Get the visible time range for a given period (as zoom preset)
 * Returns the from/to timestamps to show for each period
 * Ranges are optimized to clearly show the granularity at each zoom level
 * @param period - The time period to calculate range for
 * @param latestTime - The most recent timestamp in the data (defaults to now)
 */
export function getVisibleTimeRange(period: TimePeriod, latestTime?: number): { from: number; to: number } {
  const now = Math.floor((latestTime || Date.now()) / 1000);
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
  
  switch (period) {
    case '15m':
      // Show 6 hours to clearly see 15-minute intervals (24 candles)
      return { from: now - (6 * SECONDS_PER_HOUR), to: now };
    case '1h':
      // Show 2 days to clearly see hourly intervals (48 candles)
      return { from: now - (2 * SECONDS_PER_DAY), to: now };
    case '6h':
      // Show 7 days to see 6-hour intervals
      return { from: now - (7 * SECONDS_PER_DAY), to: now };
    case '1d':
      // Show 14 days to see daily intervals
      return { from: now - (14 * SECONDS_PER_DAY), to: now };
    case 'All':
    default:
      // Show full 30 days
      return { from: now - (30 * SECONDS_PER_DAY), to: now };
  }
}

/**
 * Generates realistic dummy time-series data for a prediction market outcome
 * with dramatic ups and downs like real market data
 */
function generateOutcomeTimeSeries(
  startValue: number,
  endValue: number,
  days: number = 30,
  pointsPerDay: number = 24,
  volatility: number = 0.08
): { time: number; value: number }[] {
  const now = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 86400;
  const totalPoints = days * pointsPerDay;
  const data: { time: number; value: number }[] = [];

  let currentValue = startValue;
  const valueChange = endValue - startValue;
  const baseTrend = valueChange / totalPoints;
  
  // Add momentum for more realistic swings
  let momentum = 0;
  const momentumDecay = 0.95;
  
  // Create wave-like patterns with different frequencies
  const waveFrequency1 = (2 * Math.PI) / (totalPoints / 3); // ~10 day cycles
  const waveFrequency2 = (2 * Math.PI) / (totalPoints / 7); // ~4 day cycles
  const waveAmplitude1 = volatility * 8; // Larger waves
  const waveAmplitude2 = volatility * 4; // Smaller waves

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = now - (totalPoints - i) * (oneDayInSeconds / pointsPerDay);
    
    // Combine multiple factors for realistic movement:
    
    // 1. Base trend toward end value
    const trendComponent = baseTrend;
    
    // 2. Large wave patterns (market sentiment shifts)
    const wave1 = Math.sin(i * waveFrequency1) * waveAmplitude1;
    
    // 3. Small wave patterns (daily fluctuations)
    const wave2 = Math.sin(i * waveFrequency2 + Math.PI / 3) * waveAmplitude2;
    
    // 4. Random shocks (news events)
    const randomShock = (Math.random() - 0.5) * volatility * 3;
    
    // 5. Momentum (trends continue before reversing)
    momentum = momentum * momentumDecay + randomShock;
    
    // Combine all components
    const totalChange = trendComponent + wave1 + wave2 + momentum;
    currentValue += totalChange;
    
    // Clamp between reasonable bounds (0-100 for percentages)
    currentValue = Math.max(0.5, Math.min(99.5, currentValue));
    
    data.push({
      time: timestamp,
      value: parseFloat(currentValue.toFixed(2)),
    });
  }
  
  // Ensure we end at the target value by adjusting the last few points
  const lastFewPoints = Math.min(24, totalPoints); // Last day
  const finalAdjustment = (endValue - currentValue) / lastFewPoints;
  
  for (let i = totalPoints - lastFewPoints; i < totalPoints; i++) {
    data[i].value += finalAdjustment * (i - (totalPoints - lastFewPoints));
    data[i].value = parseFloat(Math.max(0.5, Math.min(99.5, data[i].value)).toFixed(2));
  }

  return data;
}

/**
 * Generates chart data for multiple outcomes that sum to ~100%
 * This ensures the prediction market constraint where all probabilities sum to 100
 * Always generates full 30 days of data; time periods are handled by chart zoom
 */
export function generatePredictionMarketChartData(
  outcomes: Array<{ label: string; color: string; currentProbability: number }>
): ChartSeries[] {
  const series: ChartSeries[] = [];
  const days = 30;
  const pointsPerDay = 96; // 15-minute intervals (4 per hour × 24 hours = 96 per day)
  
  // Generate historical starting values that sum to 100
  const startValues = outcomes.map(o => {
    // Start with a value that's significantly different from current (30-50% variance)
    const variance = (Math.random() - 0.5) * 0.8; // -40% to +40%
    return Math.max(0.5, o.currentProbability * (1 + variance));
  });
  
  // Normalize start values to sum to 100
  const startSum = startValues.reduce((a, b) => a + b, 0);
  const normalizedStarts = startValues.map(v => (v / startSum) * 100);
  
  outcomes.forEach((outcome, idx) => {
    // Higher volatility for more dramatic movements
    const volatility = 0.08 + Math.random() * 0.04; // 8-12% volatility
    
    series.push({
      label: outcome.label,
      color: outcome.color,
      data: generateOutcomeTimeSeries(
        normalizedStarts[idx],
        outcome.currentProbability,
        days,
        pointsPerDay,
        volatility
      ),
    });
  });

  return series;
}

/**
 * Preset chart data for the Federal Reserve rate decision market
 * Based on the outcomes shown in the TerminalOverlay
 */
export function getFedRateDecisionChartData(): ChartSeries[] {
  return generatePredictionMarketChartData([
    { label: '25 bps decrease', color: '#FFFFFF', currentProbability: 80 },
    { label: '50+ bps decrease', color: '#179F61', currentProbability: 15.8 },
    { label: 'No change', color: '#0BA5EC', currentProbability: 4.5 },
    { label: '25+ bps increase', color: '#DCF58D', currentProbability: 0.7 },
  ]);
}

/**
 * Generate chart data based on card outcomes
 * Falls back to default two-outcome market if no outcomes provided
 * Always generates full 30 days of data; time periods are handled by chart zoom
 */
export function getCardChartData(
  outcomes?: Array<{ label: string; probability: number }>,
  yesPercentage?: number,
  noPercentage?: number
): ChartSeries[] {
  // If we have multiple outcomes, use them
  if (outcomes && outcomes.length > 0) {
    const colors = [
      '#FFFFFF',   // White
      '#179F61',   // Green
      '#0BA5EC',   // Blue
      '#DCF58D',   // Yellow-green
      '#EE46BC',   // Pink
      '#7A5AF8',   // Purple
      '#F79009',   // Orange
    ];
    
    return generatePredictionMarketChartData(
      outcomes.slice(0, 7).map((o, idx) => ({
        label: o.label,
        color: colors[idx % colors.length],
        currentProbability: o.probability,
      }))
    );
  }
  
  // Otherwise, generate simple Yes/No market
  const yes = yesPercentage ?? 50;
  const no = noPercentage ?? 50;
  
  return generatePredictionMarketChartData([
    { label: 'Yes', color: '#31D482', currentProbability: yes },
    { label: 'No', color: '#F97066', currentProbability: no },
  ]);
}

/**
 * Generate a simple single-line chart for sparkline displays
 * Returns just the data points without the series wrapper
 */
export function generateSparklineData(
  currentValue: number,
  days: number = 7,
  volatility: number = 0.08
): { time: number; value: number }[] {
  const now = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 86400;
  const pointsPerDay = 6; // 4-hour intervals for more detail
  const totalPoints = days * pointsPerDay;
  const data: { time: number; value: number }[] = [];

  // Start from a value 20-40% away from current for more dramatic movement
  const variance = (Math.random() - 0.5) * 0.6;
  let value = currentValue * (1 + variance);
  const baseTrend = (currentValue - value) / totalPoints;
  
  let momentum = 0;
  const momentumDecay = 0.9;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = now - (totalPoints - i) * (oneDayInSeconds / pointsPerDay);
    
    // Add trend + momentum + random walk
    const randomChange = (Math.random() - 0.5) * volatility * 3;
    momentum = momentum * momentumDecay + randomChange;
    
    value += baseTrend + momentum;
    value = Math.max(0.1, Math.min(99.9, value));
    
    data.push({
      time: timestamp,
      value: parseFloat(value.toFixed(2)),
    });
  }

  return data;
}

/**
 * Converts time-series line data to OHLC candlestick format
 * Groups hourly data into candles (default: 6-hour candles for 30 days = ~120 candles)
 */
function convertToCandlestickData(
  lineData: { time: number; value: number }[],
  hoursPerCandle: number = 6
): CandlestickDataPoint[] {
  const candles: CandlestickDataPoint[] = [];
  
  if (lineData.length === 0) return candles;
  
  // Group data points into candles
  const secondsPerCandle = hoursPerCandle * 3600;
  const firstTime = lineData[0].time;
  const startOfPeriod = Math.floor(firstTime / secondsPerCandle) * secondsPerCandle;
  
  let currentCandleTime = startOfPeriod;
  let candleData: { time: number; value: number }[] = [];
  
  for (const point of lineData) {
    const candleTime = Math.floor(point.time / secondsPerCandle) * secondsPerCandle;
    
    if (candleTime !== currentCandleTime && candleData.length > 0) {
      // Complete the current candle
      const open = candleData[0].value;
      const close = candleData[candleData.length - 1].value;
      const high = Math.max(...candleData.map(d => d.value));
      const low = Math.min(...candleData.map(d => d.value));
      
      candles.push({
        time: currentCandleTime,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
      
      // Start new candle
      currentCandleTime = candleTime;
      candleData = [point];
    } else {
      candleData.push(point);
    }
  }
  
  // Add the last candle
  if (candleData.length > 0) {
    const open = candleData[0].value;
    const close = candleData[candleData.length - 1].value;
    const high = Math.max(...candleData.map(d => d.value));
    const low = Math.min(...candleData.map(d => d.value));
    
    candles.push({
      time: currentCandleTime,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
  }
  
  return candles;
}

/**
 * Converts line chart series data to candlestick chart format
 * Takes all outcomes and converts them to candlestick format
 * @param lineChartSeries - Array of line chart series
 * @param hoursPerCandle - Hours per candle (default 6 = 4 candles per day)
 * @returns Array of candlestick chart series
 */
export function convertLineToCandlestickData(
  lineChartSeries: ChartSeries[],
  hoursPerCandle: number = 6
): CandlestickChartSeries[] {
  if (lineChartSeries.length === 0) return [];
  
  // Convert each line series to candlestick format
  return lineChartSeries.map(series => ({
    label: series.label,
    data: convertToCandlestickData(series.data, hoursPerCandle),
  }));
}

