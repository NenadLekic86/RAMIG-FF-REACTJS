import React from 'react';
import { useWatchlistStore } from '../../store/watchlist';

// Provider configurations with their unique styling
const PROVIDER_CONFIGS = {
  kalshi: {
    icon: "/K-Kalshi.svg",
    name: 'Kalshi',
    textColor: 'text-white',
    bgColor: 'bg-[#179F61]',
    borderColor: 'border-[#179F61]',
    borderHex: '#179F61',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  manifold: {
    icon: "/Manifold.svg",
    name: 'Manifold',
    textColor: 'text-white',
    bgColor: 'bg-[#4337C4]',
    borderColor: 'border-[#4337C4]',
    borderHex: '#4337C4',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  limitless: {
    icon: "/Limitless.svg",
    name: 'Limitless',
    textColor: 'text-[#171717]',
    bgColor: 'bg-[#DCF58D]',
    borderColor: 'border-[#DCF58D]',
    borderHex: '#DCF58D',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  predictit: {
    icon: "/Predictit.svg",
    name: 'PredictIt',
    textColor: 'text-white',
    bgColor: 'bg-[#07A0BA]',
    borderColor: 'border-[#07A0BA]',
    borderHex: '#07A0BA',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  polymarket: {
    icon: "/Polymarket.svg",
    name: 'Polymarket',
    textColor: 'text-white',
    bgColor: 'bg-[#1751F0]',
    borderColor: 'border-[#1751F0]',
    borderHex: '#1751F0',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  },
  zeitgeist: {
    icon: "/Zeitgeist.svg",
    name: 'Zeitgeist',
    textColor: 'text-[#171717]',
    bgColor: 'bg-[#FFFFFF]',
    borderColor: 'border-[#FFFFFF]',
    borderHex: '#FFFFFF',
    sparkline: [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195, 200]
  }
};

// Utilities for deterministic sparkline jittering
const hashStringToSeed = (key: string) => {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

const seededRandom = (initialSeed: number) => {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed & 0xffffffff) / 0xffffffff;
  };
};

const jitterSeries = (values: number[] | undefined, amplitudeFraction: number, seedKey: string) => {
  if (!values || values.length === 0) return values ?? [];
  const seed = hashStringToSeed(seedKey);
  const rand = seededRandom(seed);
  const result: number[] = [];
  let drift = 0;
  for (let i = 0; i < values.length; i++) {
    drift += (rand() - 0.5) * 0.25;
    if (drift > 1) drift = 1;
    if (drift < -1) drift = -1;
    const noise = (rand() - 0.5) * 2;
    const factor = 1 + amplitudeFraction * (0.6 * drift + 0.4 * noise);
    const v = Math.max(0, values[i] * factor);
    result.push(v);
  }
  return result;
};

export interface CardData {
  id: string;
  title: string;
  description?: string;
  provider: keyof typeof PROVIDER_CONFIGS;
  liquidity: string;
  createdDate: string;
  imageUrl?: string;
  iconUrl?: string;
  yesPercentage: number;
  noPercentage: number;
  volume?: string;
  hasHoverEffect?: boolean;
  category?: string;
  endDate?: string;
  isActive?: boolean;
  sparkline?: number[];
}

interface CardProps {
  data: CardData;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ data, onClick, className = '' }) => {
  const providerConfig = PROVIDER_CONFIGS[data.provider];
  const hasHover = data.hasHoverEffect ?? true;
  const isBookmarked = useWatchlistStore((s) => s.isBookmarked(data.id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggle);

  const hexToRgba = (hex: string, alpha: number) => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const hoverShadowColor = hexToRgba(providerConfig.borderHex, 0.72);
  const sparkValues = (data.sparkline && data.sparkline.length > 1) ? data.sparkline : providerConfig.sparkline;

  const randomizedSparkValues = React.useMemo(
    () => jitterSeries(sparkValues, 0.18, `${data.id}-${data.provider}`),
    [sparkValues, data.id, data.provider]
  );

  const cardClasses = `
    relative overflow-hidden transition-all duration-200 cursor-pointer
    ${hasHover ? 'hover:shadow-[0_0_0_4px_var(--hover-shadow-color)]' : ''}
    card border-1 ${providerConfig.borderColor}
    ${className}
  `;

  const ProviderBadge = () => (
    <div className={`inline-flex items-center gap-1 px-2 py-2 rounded-bl-lg text-xs font-semibold text-white ${providerConfig.bgColor}`}>
      <img
          src={providerConfig.icon}
          alt={data.provider}
          className="w-[16px] h-[16px]"
        />
      <span className={`text-xs font-medium tracking-[0.5%] ${providerConfig.textColor}`}>{providerConfig.name}</span>
    </div>
  );

  const MiniAreaChart: React.FC<{
    values: number[];
    color: string;
    width?: number;
    height?: number;
    id: string;
    startAtY?: number; // optional vertical anchor in px from top
    endAtY?: number; // optional right edge anchor in px from top
  }> = React.memo(({ values, color, width = 300, height = 56, id, startAtY, endAtY }) => {
    if (!values || values.length < 2) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const normalized = values.map(v => (v - min) / range);

    const leftPad = 1;
    const rightPad = 1;
    const topPad = 1;
    const bottomPad = 1;

    const innerW = width - leftPad - rightPad;
    const innerH = height - topPad - bottomPad;
    const xStep = innerW / (values.length - 1);

    let points: Array<[number, number]>;
    if (typeof startAtY === 'number') {
      // Anchor the first value at startAtY and scale deltas so they fit without clamping
      const baselineY = Math.min(height - bottomPad, Math.max(topPad, startAtY));
      const baseN = normalized[0];
      const deltas = normalized.map(n => n - baseN);
      const maxAbsDelta = deltas.reduce((m, d) => Math.max(m, Math.abs(d)), 0) || 1;
      const amplitudeLimitPx = Math.max(1, Math.min(baselineY - topPad, height - bottomPad - baselineY) - 1);
      const scale = amplitudeLimitPx / maxAbsDelta;

      points = deltas.map((d, i) => [
        leftPad + i * xStep,
        baselineY - d * scale
      ]);
    } else {
      points = normalized.map((n, i) => [
        leftPad + i * xStep,
        height - bottomPad - n * innerH
      ]);
    }

    // If endAtY provided, shift points linearly so the last point matches endAtY without clamping
    if (typeof endAtY === 'number' && points.length > 1) {
      const targetEndY = Math.min(height - bottomPad, Math.max(topPad, endAtY));
      const currentEndY = points[points.length - 1][1];
      const deltaTarget = targetEndY - currentEndY;
      const lastIndex = points.length - 1;
      let minDelta = -Infinity;
      let maxDelta = Infinity;
      for (let i = 1; i <= lastIndex; i++) {
        const t = i / lastIndex; // 0..1
        const y = points[i][1];
        // Bounds: topPad <= y + delta*t <= height - bottomPad
        const low = (topPad - y) / t;
        const high = ((height - bottomPad) - y) / t;
        if (low > minDelta) minDelta = low;
        if (high < maxDelta) maxDelta = high;
      }
      const delta = Math.max(minDelta, Math.min(maxDelta, deltaTarget));
      for (let i = 1; i <= lastIndex; i++) {
        const t = i / lastIndex;
        points[i][1] = points[i][1] + delta * t;
      }
    }

    const pathLine = 'M ' + points.map(p => p.join(' ')).join(' L ');
    const pathArea =
      pathLine +
      ` L ${points[points.length - 1][0]} ${height - bottomPad}` +
      ` L ${leftPad} ${height - bottomPad} Z`;

    const fillId = `grad-${id}`;

    const hexToRgba = (hex: string, alpha: number) => {
      const sanitized = hex.replace('#', '');
      const bigint = parseInt(sanitized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hexToRgba(color, 0.32)} />
            <stop offset="100%" stopColor={hexToRgba(color, 0)} />
          </linearGradient>
        </defs>
        <path d={pathArea} fill={`url(#${fillId})`} />
        <path d={pathLine} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
      </svg>
    );
  });

  return (
    <div className={cardClasses} onClick={onClick} style={{ ['--hover-shadow-color']: hoverShadowColor } as React.CSSProperties}>
      {/* Card Header */}
      <div className="p-4 space-y-3 mb-4 relative z-10">
        {/* Provider Badge */}
        <div className="absolute top-0 right-0">
          <div className="rounded-bl-lg">
            <ProviderBadge />
          </div>
        </div>

        {/* Card Image (if provided) */}
        {data.imageUrl && (
          <div className="relative w-[44px] h-full rounded-sm overflow-hidden">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Card Title */}
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-md leading-tight line-clamp-2 tracking-[-2%]">
            {data.title}
          </h3>
          <button
            type="button"
            aria-label={isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}
            aria-pressed={isBookmarked}
            className="p-0 m-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist(data);
            }}
          >
            <img
              src={isBookmarked ? '/Bookmark--filled.svg' : '/Bookmark-icon.svg'}
              alt={isBookmarked ? 'Bookmarked' : 'Bookmark'}
              className="w-[20px] h-[20px]"
            />
          </button>
        </div>

        

        {/* Card Description (if provided) */}
        {data.description && (
          <p className="text-white/44 text-xs leading-tight tracking-[-1%]">
            {data.description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 space-y-1 relative z-10">
        {/* Liquidity and Date */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center justify-between gap-2 bg-white/[0.04] backdrop-blur-[6px] px-2 py-3 rounded-[8px] w-100">
            <span className="text-white/44">Liquidity</span>
            <span className="text-white">{data.liquidity}</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-white/[0.04] backdrop-blur-[6px] px-2 py-3 rounded-[8px] w-100">
            <span className="text-white/44">Created</span>
            <span className="text-white">{data.createdDate}</span>
          </div>
        </div>

        {/* Yes/No Options */}
        <div className="space-y-1">
          <div className="flex flex-row items-center justify-center bg-white/[0.04] backdrop-blur-[6px] px-2 py-0.5 rounded-[8px] gap-2">
            <div className="basis-2/5 whitespace-nowrap overflow-hidden flex items-center">
              <span className="text-xs text-white">50+ bps decreased</span>
            </div>
            <div className="basis-1/5 flex items-center justify-end">
              <span className="text-xs font-semibold text-white">80.0%</span>
            </div>
            <div className="basis-2/5 flex gap-1 items-center justify-end">
              <button className="p-2 text-[#31D482] text-xs rounded-[8px] border-1 border-[#31D482]/72 hover:bg-green-500/30 transition-colors ">
                Yes
              </button>
              <button className="p-2 text-[#F97066] text-xs rounded-[8px] border-1 border-[#F97066]/72 hover:bg-red-500/30 transition-colors">
                No
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center bg-white/[0.04] backdrop-blur-[6px] px-2 py-0.5 rounded-[8px] gap-2">
            <div className="basis-2/5 whitespace-nowrap overflow-hidden flex items-center">
              <span className="text-xs text-white">25+ bps decreased</span>
            </div>
            <div className="basis-1/5 flex items-center justify-end">
              <span className="text-xs font-semibold text-white">20.0%</span>
            </div>
            <div className="basis-2/5 flex gap-1 items-center justify-end">
              <button className="p-2 text-[#31D482] text-xs rounded-[8px] border-1 border-[#31D482]/72 hover:bg-green-500/30 transition-colors ">
                Yes
              </button>
              <button className="p-2 text-[#F97066] text-xs rounded-[8px] border-1 border-[#F97066]/72 hover:bg-red-500/30 transition-colors">
                No
              </button>
            </div>
          </div>
        </div>
      </div>
      {randomizedSparkValues && randomizedSparkValues.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 w-full pointer-events-none z-0">
          <MiniAreaChart
            values={randomizedSparkValues}
            color={providerConfig.borderHex}
            id={`${data.id}-bg`}
            width={320}
            height={200}
            startAtY={100}
            endAtY={['kalshi','limitless','zeitgeist'].includes(data.provider) ? 150 : 60}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
