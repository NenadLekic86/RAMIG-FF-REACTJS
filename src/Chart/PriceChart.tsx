import { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

export function PriceChart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, { layout: { background: { color: '#0a0a0a' }, textColor: '#d4d4d8' } });
    chartRef.current = chart;
    const series = chart.addAreaSeries({ lineColor: '#22c55e', topColor: 'rgba(34,197,94,.3)', bottomColor: 'rgba(34,197,94,0)' });
    series.setData([{ time: 1715040000, value: 100 }, { time: 1715126400, value: 105 }]);
    const resize = () => chart.applyOptions({ width: ref.current!.clientWidth, height: 360 });
    resize();
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); chart.remove(); };
  }, []);

  return <div ref={ref} className="w-full h-[360px]" />;
}