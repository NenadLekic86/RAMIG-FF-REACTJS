import React from 'react';
import type { Outcome } from '../../models/card';
import { useWatchlistStore } from '../../store/watchlist';
import type { CardData as UnifiedCardData } from '../../models/card';
import { PROVIDER_CONFIGS } from '../../config/providers';
import { useUIStore } from '../../store/ui';

interface CardProps {
  data: UnifiedCardData;
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

  const hoverShadowColor = hexToRgba(providerConfig.borderHex || providerConfig.bgHex, 0.72);
  const selectedCardId = useUIStore((s) => s.selectedCard?.id);
  const isActiveCard = selectedCardId === data.id;

  const borderColorHex = providerConfig.borderHex || providerConfig.bgHex;

  const cardClasses = `
    relative overflow-hidden transition-all duration-200 cursor-pointer
    ${hasHover ? 'hover:shadow-[0_0_0_4px_var(--hover-shadow-color)]' : ''}
    ${isActiveCard ? 'shadow-[0_0_0_4px_var(--hover-shadow-color)]' : ''}
    card border-1
    ${className}
  `;

  const ProviderBadge = () => (
    <div className={`inline-flex items-center gap-1 px-2 py-2 rounded-bl-lg text-xs font-semibold text-white`} style={{ backgroundColor: providerConfig.bgHex }}>
      <img
          src={providerConfig.icon}
          alt={data.provider}
          className="w-[16px] h-[16px]"
        />
      <span className={`text-xs font-medium tracking-[0.5%] ${providerConfig.textTone === 'dark' ? 'text-[#171717]' : 'text-white'}`}>{providerConfig.label}</span>
    </div>
  );

  

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={{ ['--hover-shadow-color']: hoverShadowColor, borderColor: borderColorHex } as React.CSSProperties}
    >
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

        {/* Yes/No Options sourced from centralized outcomes */}
        <div className="space-y-1">
          {(data.outcomes ?? []).slice(0, 2).map((o: Outcome) => (
            <div key={o.label} className="flex flex-row items-center justify-center bg-white/[0.04] backdrop-blur-[6px] px-2 py-0.5 rounded-[8px] gap-2">
              <div className="basis-2/5 whitespace-nowrap overflow-hidden flex items-center">
                <span className="text-xs text-white">{o.label}</span>
              </div>
              <div className="basis-1/5 flex items-center justify-end">
                <span className="text-xs font-semibold text-white">{o.probability.toFixed(1)}%</span>
              </div>
              <div className="basis-2/5 flex gap-1 items-center justify-end">
                <button
                  className="p-2 text-[#31D482] text-xs rounded-[8px] border-1 border-[#31D482]/72 hover:bg-green-500/30 transition-colors "
                  onClick={(e) => {
                    e.stopPropagation();
                    const openRightSidebarWithOutcome = useUIStore.getState().openRightSidebarWithOutcome;
                    openRightSidebarWithOutcome(data, o.label, 'buy');
                  }}
                >
                  Yes
                </button>
                <button
                  className="p-2 text-[#F97066] text-xs rounded-[8px] border-1 border-[#F97066]/72 hover:bg-red-500/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const openRightSidebarWithOutcome = useUIStore.getState().openRightSidebarWithOutcome;
                    openRightSidebarWithOutcome(data, o.label, 'sell');
                  }}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Card;
