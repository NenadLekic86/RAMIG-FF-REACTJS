import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, type IChartApi, type LineData } from 'lightweight-charts';

export interface MiniChartDataPoint {
  time: number;
  value: number;
}

interface MiniChartProps {
  data: MiniChartDataPoint[];
  color?: string;
  height?: number;
  className?: string;
}

/**
 * A minimal sparkline-style chart for displaying trends in compact spaces like cards
 */
export default function MiniChart({ 
  data, 
  color = '#31D482', 
  height = 60, 
  className = '' 
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Create minimal chart without axes or grid
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      crosshair: {
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    // Add line series
    const lineSeries = chart.addSeries(
      LineSeries,
      {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      }
    );

    // Convert data to the format expected by lightweight-charts v5
    const formattedData: LineData[] = data.map(d => ({
      time: d.time as LineData['time'],
      value: d.value,
    }));
    
    lineSeries.setData(formattedData);

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
  }, [data, color, height]);

  return <div ref={chartContainerRef} className={className} />;
}

