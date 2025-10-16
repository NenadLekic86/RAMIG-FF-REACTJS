import { useEffect, useMemo, useRef, useState } from 'react';
import { useUIStore } from '../../store/ui';
import { PROVIDER_CONFIGS, hexToRgbStr } from '../../config/providers';
import type { CardData } from '../../models/card';
import { demoCards } from '../../models/card';
import TabUnderline from '../Tabs/TabUnderline.tsx';
import { useWatchlistStore } from '../../store/watchlist';
import { filterByQuery } from '../../utils/search';

type TabKey = 'trending' | 'watchlist' | 'positions';

// Local view models used for sidebar lists
type BaseItem = {
  id: string;
  provider: string;
  title: string;
  description: string;
  liquidity: string;
  created: string;
  yes: string;
  no: string;
  category: string;
  outcomes?: Array<{ label: string; probability: number; volume?: string }>;
  prob?: string;
};
type PositionItem = BaseItem & {
  status: 'active' | 'history';
  side: 'buy' | 'sell';
  size: string;
  sold: string;
  remaining: string;
  pnl: string;
};

  // Map human-readable chip labels to provider keys used by items
  const providerLabelToKey: Record<string, string> = {
  Kalshi: 'kalshi',
  Manifold: 'manifold',
  Limitless: 'limitless',
  PredictIt: 'predictit',
  Polymarket: 'polymarket',
  Zeitgeist: 'zeitgeist',
};
const providerKeyToLabel: Record<string, string> = {
  kalshi: 'Kalshi',
  manifold: 'Manifold',
  limitless: 'Limitless',
  predictit: 'PredictIt',
  polymarket: 'Polymarket',
  zeitgeist: 'Zeitgeist',
};

export default function WatchlistSidebar() {
  const closeWatchlist = useUIStore(s => s.closeWatchlist);
  const isWatchlistClosing = useUIStore(s => s.isWatchlistClosing);
  const openTerminal = useUIStore(s => s.openTerminal);
  const closeTerminal = useUIStore(s => s.closeTerminal);
  const isTerminalOpen = useUIStore(s => s.isTerminalOpen);
  const selectedCard = useUIStore(s => s.selectedCard);
  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const watchlistMap = useWatchlistStore(s => s.itemsById);
  const [searchQuery, setSearchQuery] = useState('');
  // Positions sub-tabs
  const [positionsSubTab, setPositionsSubTab] = useState<'active' | 'history'>('active');
  // Sort dropdown state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'pnl'>('alphabetical');
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Animated underline controller
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLButtonElement>(null);
  const watchlistRef = useRef<HTMLButtonElement>(null);
  const positionsRef = useRef<HTMLButtonElement>(null);

  // Filters (chips) — selected providers
  // Present labels for selection UI
  const [chips, setChips] = useState<string[]>(['Manifold', 'Kalshi', 'Zeitgeist', 'Polymarket', 'Limitless', 'PredictIt']);
  const removeChip = (label: string) => setChips(prev => prev.filter(c => c !== label));
  const allProviders: string[] = ['Manifold', 'Kalshi', 'Zeitgeist', 'Polymarket', 'Limitless', 'PredictIt'];
  // Track cards removed by the user
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const removeCard = (id: string) => {
    setRemovedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      // If this was the last card for its provider, unselect the chip
      const target = items.find(it => it.id === id);
      if (target) {
        const providerKey = target.provider;
        const hasAnyLeft = items.some(it => it.provider === providerKey && !next.has(it.id));
        if (!hasAnyLeft) {
          const label = providerKeyToLabel[providerKey] ?? providerKey;
          setChips(prevChips => prevChips.filter(c => c !== label));
        }
      }
      return next;
    });
  };

  // Trending/positions items derived from centralized demoCards
  const items: BaseItem[] = useMemo(() => (
    demoCards.map((c) => ({
      id: c.id,
      provider: c.provider,
      title: c.title,
      description: c.description ?? '',
      liquidity: c.liquidity,
      prob: `${Math.round(c.yesPercentage ?? 0)}%`,
      created: c.createdDate,
      yes: `${Math.round(c.yesPercentage ?? 0)}%`,
      no: `${Math.round(c.noPercentage ?? 0)}%`,
      category: c.category ?? '-',
      outcomes: c.outcomes,
    }))
  ), []);

  // Positions items enriched with position fields
  const positionsItems: PositionItem[] = useMemo(() => (
    demoCards
      .filter(c => !!c.position)
      .map((c) => ({
        id: c.id,
        provider: c.provider,
        title: c.title,
        description: c.description ?? '',
        created: c.createdDate,
        liquidity: c.liquidity,
        yes: `${Math.round(c.yesPercentage ?? 0)}%`,
        no: `${Math.round(c.noPercentage ?? 0)}%`,
        category: c.category ?? '-',
        outcomes: c.outcomes,
        // Position meta
        status: c.position!.status,
        side: c.position!.side,
        size: c.position!.size,
        sold: c.position!.sold,
        remaining: c.position!.remaining,
        pnl: c.position!.pnl,
      }))
  ), []);

  // Watchlist items derived from global store
  const watchlistItems = useMemo(() => {
    return Array.from(watchlistMap.values()).map((c) => ({
      id: c.id,
      provider: c.provider,
      title: c.title,
      description: c.description ?? '',
      liquidity: c.liquidity ?? '-',
      prob: `${Math.round(c.yesPercentage ?? 0)}%`,
      created: c.createdDate ?? '',
      yes: `${Math.round(c.yesPercentage ?? 0)}%`,
      no: `${Math.round(c.noPercentage ?? 0)}%`,
      category: c.category ?? '-',
    }));
  }, [watchlistMap]);

  // Base items based on active tab
  const baseItems = useMemo(() => {
    if (activeTab === 'watchlist') return watchlistItems as BaseItem[];
    if (activeTab === 'positions') return positionsItems.filter((p) => p.status === positionsSubTab) as BaseItem[];
    return items as BaseItem[];
  }, [activeTab, items, watchlistItems, positionsItems, positionsSubTab]);

  // Apply provider filtering based on selected chips and removed ids
  const filteredItems = useMemo(() => {
    const activeProviders = new Set(
      chips.map(label => providerLabelToKey[label] ?? label.toLowerCase())
    );
    const base = activeTab === 'positions'
      ? baseItems // positions ignore provider chips
      : (activeProviders.size === 0 ? baseItems : baseItems.filter(x => activeProviders.has(x.provider)));
    const withoutRemoved = base.filter(x => !removedIds.has(x.id));
    const searched = filterByQuery(withoutRemoved, searchQuery, {
      fields: [
        'title',
        'description',
        'category',
        (x) => x.provider,
      ],
    });
    const arr = [...searched];
    if (sortBy === 'alphabetical') {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [activeTab, baseItems, chips, removedIds, searchQuery, sortBy]);

  const filteredPositions: PositionItem[] = useMemo(() => {
    if (activeTab !== 'positions') return [];
    const base = positionsItems.filter((p) => p.status === positionsSubTab);
    const withoutRemoved = base.filter(x => !removedIds.has(x.id));
    const searched = filterByQuery(withoutRemoved, searchQuery, {
      fields: [
        'title',
        'description',
        'category',
        (x) => x.provider,
      ],
    });
    const arr = [...(searched as PositionItem[])];
    if (sortBy === 'alphabetical') {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'pnl') {
      const toNum = (s: string) => {
        const n = parseFloat(s.replace(/[^0-9.-]/g, ''));
        return Number.isNaN(n) ? 0 : n;
      };
      arr.sort((a, b) => toNum(b.pnl) - toNum(a.pnl));
    }
    return arr;
  }, [activeTab, positionsItems, positionsSubTab, removedIds, searchQuery, sortBy]);

  // Close sort dropdown on outside click / ESC
  useEffect(() => {
    if (!isSortOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!sortMenuRef.current || !filterBtnRef.current) return;
      if (!sortMenuRef.current.contains(target) && !filterBtnRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isSortOpen]);

  const renderProviderBadge = (provider: string) => {
    switch (provider) {
      case 'kalshi':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.kalshi.bgHex, border: `1px solid ${PROVIDER_CONFIGS.kalshi.bgHex}` }}>
            <img src="/K-Kalshi.svg" alt="Kalshi" className="w-7 h-7" />
          </div>
        );
      case 'manifold':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.manifold.bgHex, border: `1px solid ${PROVIDER_CONFIGS.manifold.bgHex}` }}>
            <img src="/Manifold.svg" alt="Manifold" className="w-7 h-7" />
          </div>
        );
      case 'limitless':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.limitless.bgHex, border: `1px solid ${PROVIDER_CONFIGS.limitless.bgHex}` }}>
            <img src="/Limitless.svg" alt="Limitless" className="w-7 h-7" />
          </div>
        );
      case 'polymarket':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.polymarket.bgHex, border: `1px solid ${PROVIDER_CONFIGS.polymarket.bgHex}` }}>
            <img src="/Polymarket.svg" alt="Polymarket" className="w-7 h-7" />
          </div>
        );
      case 'predictit':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.predictit.bgHex, border: `1px solid ${PROVIDER_CONFIGS.predictit.bgHex}` }}>
            <img src="/Predictit.svg" alt="PredictIt" className="w-7 h-7" />
          </div>
        );
      case 'zeitgeist':
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: PROVIDER_CONFIGS.zeitgeist.bgHex, border: `1px solid ${PROVIDER_CONFIGS.zeitgeist.bgHex}` }}>
            <img src="/Zeitgeist.svg" alt="Zeitgeist" className="w-7 h-7" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: '#FFFFFF', border: `1px solid #FFFFFF` }}>
            <img src="/placeholder.svg" alt="icon" className="w-7 h-7 opacity-80" />
          </div>
        );
    }
  };

  const getProviderBorderRgb = (provider: string): string => {
    const cfg = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (cfg) return hexToRgbStr(cfg.bgHex);
    return '255,255,255';
  };

  const renderSideBadge = (side: 'buy' | 'sell' | undefined) => {
    const isBuy = side === 'buy';
    const color = isBuy ? '#039855' : '#D92D20';
    const bg = isBuy ? 'rgba(3,152,85,0.18)' : 'rgba(217,45,32,0.18)';
    const label = isBuy ? 'B' : 'S';
    return (
      <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: bg, color }}>
        <span className="text-[12px] leading-none font-semibold">{label}</span>
      </div>
    );
  };

  const getPnlTextColor = (pnl?: string) => {
    if (!pnl) return 'text-white';
    const n = parseFloat(pnl.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(n) || n === 0) return 'text-white';
    return n > 0 ? 'text-[#039855]' : 'text-[#D92D20]';
  };

  return (
    <aside className={`hidden lg:flex flex-col fixed left-[80px] top-8 z-50 h-dvh w-[320px] border-r border-customGray44 ${isWatchlistClosing ? 'animate-lsb-out' : 'animate-lsb-in'}`}>
      {/* Header */}
      <div className="px-4 py-8 flex items-center justify-between">
        <h2 className="text-base font-semibold">My Watchlist</h2>
        <button onClick={closeWatchlist} aria-label="Close watchlist" className="p-2">
          <img src="/Right-panel--open--filled.svg" alt="Close panel" className="w-7 h-7 opacity-70" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-2 pb-3 border-b border-customGray44 relative shrink-0 tabs-with-indicator">
        <div ref={tabsContainerRef} className="flex items-center gap-2">
          <button
            ref={trendingRef}
            data-tab-key="trending"
            className={`filter-tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
            type="button"
          >
            Trending
          </button>
          <button
            ref={watchlistRef}
            data-tab-key="watchlist"
            className={`filter-tab ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
            type="button"
          >
            Watchlist
          </button>
          <button
            ref={positionsRef}
            data-tab-key="positions"
            className={`filter-tab ${activeTab === 'positions' ? 'active' : ''}`}
            onClick={() => setActiveTab('positions')}
            type="button"
          >
            Positions
          </button>
        </div>
        <TabUnderline containerRef={tabsContainerRef} activeKey={activeTab} />
      </div>

      {/* Search + Filters row */}
      <div className="p-3 border-b border-customGray44 flex items-center gap-2 border-b-gradient shrink-0">
        <div className="flex-1 h-9 flex items-center px-3 gap-2">
          <img src="/Search-icon.svg" alt="Search" className="opacity-[72%] w-[18px] h-[18px]" />
          <input
            className="bg-transparent outline-none text-sm w-full placeholder:text-[white]/48"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            ref={filterBtnRef}
            className={`flex items-center justify-center w-[42px] h-[42px] transition-all duration-200 ${isSortOpen ? 'w-[42px] h-[42px] rounded-[8px] bg-[#292929]' : 'h-9 w-9'}`}
            onClick={() => setIsSortOpen(o => !o)}
            aria-haspopup="menu"
            aria-expanded={isSortOpen}
          >
            <img src="/Filter-icon.svg" alt="Filters" className="opacity-[72%] w-[18px] h-[18px]" />
          </button>
          {isSortOpen && (
            <div
              ref={sortMenuRef}
              role="menu"
              className="absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2 z-50 w-[232px] rounded-[16px] border border-customGray44 bg-[#292929] shadow-xl"
            >
              <div className="px-5 pt-5 pb-2 text-white/44 text-[12px]">Sort by</div>
              <button
                className={`my-1 flex items-center justify-between rounded-[12px] mx-1 p-3 text-[14px] w-[93%] ${sortBy==='pnl' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                onClick={() => { setSortBy('pnl'); setIsSortOpen(false); }}
                role="menuitemradio"
                aria-checked={sortBy==='pnl'}
              >
                <span>P&L</span>
                {sortBy==='pnl' && <img src="/Checkmark.svg" alt="Selected" className="w-5 h-5 opacity-80" />}
              </button>
              <button
                className={`my-1 flex items-center justify-between rounded-[12px] mx-1 p-3 text-[14px] w-[93%] ${sortBy==='alphabetical' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                onClick={() => { setSortBy('alphabetical'); setIsSortOpen(false); }}
                role="menuitemradio"
                aria-checked={sortBy==='alphabetical'}
              >
                <span>Alphabetically</span>
                {sortBy==='alphabetical' && <img src="/Checkmark.svg" alt="Selected" className="w-5 h-5 opacity-80" />}
              </button>
              <div className="px-5 pt-4 pb-5 text-white/40 text-[14px]">Active Orders</div>
            </div>
          )}
        </div>
      </div>

      {/* Chips row / Positions sub-tabs */}
      <div className="pt-3 pb-1 border-b-gradient shrink-0">
        {activeTab !== 'positions' ? (
          <div className="flex items-center gap-2 overflow-x-auto scroll-thin pb-2">
            {allProviders.map((c) => {
              const isActive = chips.includes(c);
              return (
                <span
                  key={c}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${isActive ? 'bg-white/5' : 'bg-transparent opacity-70 hover:opacity-100 cursor-pointer border border-transparent'}`}
                  onClick={!isActive ? () => setChips(prev => [...prev, c]) : undefined}
                  role={!isActive ? 'button' : undefined}
                  aria-pressed={isActive ? true : undefined}
                  tabIndex={!isActive ? 0 : -1}
                >
                  <span className="whitespace-nowrap">{c}</span>
                  {isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeChip(c); }}
                      className="opacity-60 hover:opacity-100"
                      aria-label={`Remove ${c}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 pb-2">
            <button
              className={`px-3 py-1 rounded-full text-xs ${positionsSubTab==='active' ? 'bg-white/5' : 'bg-transparent opacity-70 hover:opacity-100 border border-transparent'}`}
              onClick={() => setPositionsSubTab('active')}
              type="button"
            >
              Active Positions
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs ${positionsSubTab==='history' ? 'bg-white/5' : 'bg-transparent opacity-70 hover:opacity-100 border border-transparent'}`}
              onClick={() => setPositionsSubTab('history')}
              type="button"
            >
              History
            </button>
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto scroll-thin px-3 py-3">
        {activeTab === 'positions' && (
          <div className="px-1 pb-2 text-sm text-white/70">{positionsItems.filter(p => p.status==='active').length} Open positions</div>
        )}
        {(activeTab === 'positions' ? filteredPositions : filteredItems).map((x) => {
          const isActive = selectedCard?.id === x.id;
          return (
          <div
            key={x.id}
            className={`rounded-[12px] border border-[#212121] p-3 mb-3 relative group ${isActive ? '' : 'border-gradient-overlay'} cursor-pointer`}
            style={{
              ['--border-grad-rgb' as unknown as string]: getProviderBorderRgb(x.provider),
              ...(isActive ? { background: 'rgba(255,255,255,0.08)' } : {}),
            }}
            onClick={() => {
              if (isTerminalOpen && selectedCard?.id === x.id) {
                closeTerminal();
                return;
              }
              const card: CardData = {
                id: x.id,
                title: x.title,
                description: x.description,
                provider: x.provider as CardData['provider'],
                liquidity: x.liquidity,
                createdDate: x.created,
                category: x.category,
                imageUrl: '/placeholder_img.png',
                yesPercentage: parseFloat((x.yes || '0').replace(/%/g, '')) || 80,
                noPercentage: parseFloat((x.no || '0').replace(/%/g, '')) || 20,
                outcomes: (x as { outcomes?: Array<{ label: string; probability: number; volume?: string }> }).outcomes,
                hasHoverEffect: false,
                isActive: true,
              };
              openTerminal(card);
            }}
          >
            {activeTab === 'watchlist' ? (
              <div className="absolute top-2 right-2 p-1 rounded">
                <img src="/Bookmark--filled.svg" alt="Bookmarked" className="w-4 h-4 opacity-64" />
              </div>
            ) : activeTab === 'positions' ? null : (
              <button
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                aria-label="Remove card"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCard(x.id);
                }}
              >
                <img src="/Trash-can.svg" alt="Delete" className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              {activeTab === 'positions' ? renderSideBadge((x as PositionItem).side) : renderProviderBadge(x.provider)}
              <div className="min-w-0">
                <div className="text-[16px] font-semibold truncate">{x.title}</div>
              </div>
            </div>
            {activeTab !== 'positions' ? (
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Liquidity:</span>
                  <span className="ml-1 text-white">{x.liquidity}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Prob.:</span>
                  <span className="ml-1 text-white">{x.prob ?? x.yes}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Category:</span>
                  <span className="ml-1 text-white">{x.category}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Created:</span>
                  <span className="ml-1 text-white">{x.created}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Yes:</span>
                  <span className="ml-1 text-white">{x.yes}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">No:</span>
                  <span className="ml-1 text-white">{x.no}</span>
                </span>
              </div>
            ) : (
              <div className="mt-3 text-[12px] tracking-[-2%]">
                <div className="flex flex-wrap gap-2">
                  <span className="px-1 py-1 rounded-[8px] bg-white/4">
                    <span className="text-white/44">Created:</span>
                    <span className="ml-1 text-white">{x.created}</span>
                  </span>
                  <span className="px-1 py-1 rounded-[8px] bg-white/4">
                    <span className="text-white/44">Size:</span>
                    <span className="ml-1 text-white">{(x as PositionItem).size}</span>
                  </span>
                  <span className="px-1 py-1 rounded-[8px] bg-white/4">
                    <span className="text-white/44">Sold:</span>
                    <span className="ml-1 text-white">{(x as PositionItem).sold}</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-1 py-1 rounded-[8px] bg-white/4">
                    <span className="text-white/44">Remaining:</span>
                    <span className="ml-1 text-white">{(x as PositionItem).remaining}</span>
                  </span>
                  <span className={`px-1 py-1 rounded-[8px] bg-white/4 ${getPnlTextColor((x as PositionItem).pnl)}`}>
                    <span className="text-white/44">P&L:</span>
                    <span className="ml-1">{(x as PositionItem).pnl}</span>
                  </span>
                </div>
                {(x as PositionItem).status === 'active' && (
                  <div className="mt-3 border-t border-customGray44">
                    <button className="w-full h-9 text-white text-sm">Close Position</button>
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </aside>
  );
}


