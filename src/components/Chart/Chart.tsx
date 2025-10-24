import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, LineStyle, LineSeries, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';

export interface ChartDataPoint {
  time: number; // Unix timestamp in seconds
  value: number; // Price/probability value
}

export interface ChartSeries {
  label: string;
  color: string;
  data: ChartDataPoint[];
}

interface ChartProps {
  series: ChartSeries[];
  height?: number;
  className?: string;
}

export interface ChartHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setVisibleTimeRange: (fromTime: number, toTime: number) => void;
}

const Chart = forwardRef<ChartHandle, ChartProps>(({ series, height = 300, className = '' }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<'Line'>[]>([]);

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
    if (!chartContainerRef.current) return;

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
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    });

    chartRef.current = chart;

    // Create series for each line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newSeries: any[] = [];
    series.forEach((s) => {
      const lineSeries = chart.addSeries(
        LineSeries,
        {
          color: s.color,
          lineWidth: 2,
          title: s.label,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: s.color,
          crosshairMarkerBackgroundColor: s.color,
        }
      );

      // Convert data to the format expected by lightweight-charts v5
      const formattedData: LineData[] = s.data.map(d => ({
        time: d.time as LineData['time'],
        value: d.value,
      }));
      
      lineSeries.setData(formattedData);
      newSeries.push(lineSeries);
    });

    seriesRefs.current = newSeries;

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

Chart.displayName = 'Chart';

export default Chart;

