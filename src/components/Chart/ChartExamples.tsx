/**
 * This file contains examples of how to use the Chart components
 * These examples are for reference and can be adapted for different use cases
 */

import { useMemo } from 'react';
import Chart from './Chart';
import MiniChart from './MiniChart';
import { 
  getCardChartData, 
  getFedRateDecisionChartData,
  generateSparklineData,
  generatePredictionMarketChartData
} from '../../utils/chartData';
import type { CardData } from '../../models/card';

/**
 * Example 1: Chart with card data
 * This is the most common use case - displaying chart based on a card's outcomes
 */
export function CardChartExample({ card }: { card: CardData }) {
  const chartData = useMemo(
    () => getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage),
    [card]
  );

  return (
    <div className="w-full">
      <h3 className="text-white mb-4">{card.title}</h3>
      <Chart series={chartData} height={300} />
    </div>
  );
}

/**
 * Example 2: Simple Yes/No market chart
 * Use when you only have yes/no percentages without detailed outcomes
 */
export function SimpleYesNoChart({ yesPercent, noPercent }: { yesPercent: number; noPercent: number }) {
  const chartData = useMemo(
    () => getCardChartData(undefined, yesPercent, noPercent),
    [yesPercent, noPercent]
  );

  return <Chart series={chartData} height={250} />;
}

/**
 * Example 3: Pre-configured Fed Rate chart
 * Uses the preset data for the Federal Reserve rate decision market
 */
export function FedRateChart() {
  const chartData = useMemo(() => getFedRateDecisionChartData(), []);

  return (
    <div className="w-full">
      <div className="flex gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-white"></span>
          <span className="text-white/44">25 bps decrease 80%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#179F61]"></span>
          <span className="text-white/44">50+ bps decrease 15.8%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#0BA5EC]"></span>
          <span className="text-white/44">No change 4.5%</span>
        </div>
      </div>
      <Chart series={chartData} height={320} />
    </div>
  );
}

/**
 * Example 4: Custom multi-outcome chart
 * Use when you need full control over outcomes and colors
 */
export function CustomMultiOutcomeChart() {
  const chartData = useMemo(
    () => generatePredictionMarketChartData([
      { label: 'Team A Wins', color: '#31D482', currentProbability: 45 },
      { label: 'Team B Wins', color: '#F97066', currentProbability: 35 },
      { label: 'Draw', color: '#0BA5EC', currentProbability: 20 },
    ]),
    []
  );

  return <Chart series={chartData} height={280} />;
}

/**
 * Example 5: Sparkline for card preview
 * Compact chart suitable for displaying in card components
 */
export function CardSparkline({ probability }: { probability: number }) {
  const sparklineData = useMemo(
    () => generateSparklineData(probability, 7, 0.05),
    [probability]
  );

  return (
    <div className="w-full h-16 rounded bg-white/5 p-2">
      <MiniChart data={sparklineData} color="#31D482" height={48} />
    </div>
  );
}

/**
 * Example 6: Side-by-side comparison
 * Compare multiple markets or time periods
 */
export function ComparisonCharts({ card1, card2 }: { card1: CardData; card2: CardData }) {
  const chartData1 = useMemo(
    () => getCardChartData(card1.outcomes, card1.yesPercentage, card1.noPercentage),
    [card1]
  );
  
  const chartData2 = useMemo(
    () => getCardChartData(card2.outcomes, card2.yesPercentage, card2.noPercentage),
    [card2]
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-white text-sm mb-2">{card1.title}</h4>
        <Chart series={chartData1} height={200} />
      </div>
      <div>
        <h4 className="text-white text-sm mb-2">{card2.title}</h4>
        <Chart series={chartData2} height={200} />
      </div>
    </div>
  );
}

/**
 * Example 7: Chart with custom styling
 * Add custom wrapper styling and controls
 */
export function StyledChartWithControls({ card }: { card: CardData }) {
  const chartData = useMemo(
    () => getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage),
    [card]
  );

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-white/5">
      {/* Time period controls */}
      <div className="flex items-center gap-2 mb-4 text-xs text-white/44">
        {['15m', '1h', '6h', '1d', 'All'].map((period) => (
          <button 
            key={period}
            className="px-2 py-1 rounded hover:bg-white/10 hover:text-white"
          >
            {period}
          </button>
        ))}
      </div>
      
      {/* Chart */}
      <Chart series={chartData} height={300} />
      
      {/* Stats below chart */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-white/44">High</div>
          <div className="text-white font-semibold">
            {card.yesPercentage > 50 ? card.yesPercentage.toFixed(1) : card.noPercentage.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-white/44">Volume</div>
          <div className="text-white font-semibold">{card.volume || card.liquidity}</div>
        </div>
        <div>
          <div className="text-white/44">Liquidity</div>
          <div className="text-white font-semibold">{card.liquidity}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 8: Responsive chart that adapts to container
 * The chart will automatically resize with its container
 */
export function ResponsiveChartExample({ card }: { card: CardData }) {
  const chartData = useMemo(
    () => getCardChartData(card.outcomes, card.yesPercentage, card.noPercentage),
    [card]
  );

  return (
    <div className="w-full h-full min-h-[200px]">
      <Chart series={chartData} height={300} className="w-full" />
    </div>
  );
}

