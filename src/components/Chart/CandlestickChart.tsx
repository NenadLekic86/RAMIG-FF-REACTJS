import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi, type CandlestickData } from 'lightweight-charts';

export interface CandlestickDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartSeries {
  label: string;
  data: CandlestickDataPoint[];
}

interface CandlestickChartProps {
  series: CandlestickChartSeries[];
  height?: number;
  className?: string;
}

export interface CandlestickChartHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setVisibleTimeRange: (fromTime: number, toTime: number) => void;
}

/**
 * Candlestick Chart Component for displaying OHLC market data
 * Shows price movement with open, high, low, close values for each time period
 */
const CandlestickChart = forwardRef<CandlestickChartHandle, CandlestickChartProps>(({ series, height = 300, className = '' }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Expose zoom methods to parent
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (!chartRef.current) return;
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      if (!visibleRange) return;
      
      const from = visibleRange.from as number;
      const to = visibleRange.to as number;
      const delta = (to - from) * 0.25; // Zoom in by 25%
      
      timeScale.setVisibleRange({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        from: (from + delta) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to: (to - delta) as any,
      });
    },
    zoomOut: () => {
      if (!chartRef.current) return;
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleRange();
      if (!visibleRange) return;
      
      const from = visibleRange.from as number;
      const to = visibleRange.to as number;
      const delta = (to - from) * 0.25; // Zoom out by 25%
      
      timeScale.setVisibleRange({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        from: (from - delta) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to: (to + delta) as any,
      });
    },
    zoomReset: () => {
      if (!chartRef.current) return;
      chartRef.current.timeScale().fitContent();
    },
    setVisibleTimeRange: (fromTime: number, toTime: number) => {
      if (!chartRef.current) return;
      chartRef.current.timeScale().setVisibleRange({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        from: fromTime as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to: toTime as any,
      });
    },
  }), []);

  useEffect(() => {
    if (!chartContainerRef.current || series.length === 0) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.6)',
        fontFamily: 'GeneralSans, system-ui, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    });

    chartRef.current = chart;

    // For candlestick charts, we typically show the first/primary series
    // Multiple candlestick series would overlap, so we take the most significant one
    const primarySeries = series[0];
    
    if (primarySeries) {
      const candlestickSeries = chart.addSeries(
        CandlestickSeries,
        {
          upColor: '#31D482',
          downColor: '#F97066',
          borderUpColor: '#31D482',
          borderDownColor: '#F97066',
          wickUpColor: '#31D482',
          wickDownColor: '#F97066',
        }
      );

      // Convert data to the format expected by lightweight-charts v5
      const formattedData: CandlestickData[] = primarySeries.data.map(d => ({
        time: d.time as CandlestickData['time'],
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      
      candlestickSeries.setData(formattedData);
    }

    // Auto-fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [series, height]);

  return <div ref={chartContainerRef} className={className} />;
});

CandlestickChart.displayName = 'CandlestickChart';

export default CandlestickChart;

