import { useMemo, useRef, useState } from 'react';
import { useUIStore } from '../../store/ui';
import TabUnderline from '../Tabs/TabUnderline.tsx';
import { useWatchlistStore } from '../../store/watchlist';
import { filterByQuery } from '../../utils/search';

type TabKey = 'trending' | 'watchlist' | 'positions';

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
  const [activeTab, setActiveTab] = useState<TabKey>('trending');
  const watchlistMap = useWatchlistStore(s => s.itemsById);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Placeholder rows for trending tab (to be replaced with API data)
  const items = useMemo(() => (
    [
      { id: '1', provider: 'manifold', title: 'Human Mars 2030' },
      { id: '2', provider: 'kalshi', title: 'Human Mars 2030' },
      { id: '3', provider: 'kalshi', title: 'Human Mars 2030' },
      { id: '4', provider: 'zeitgeist', title: 'Human Mars 2030' },
      { id: '5', provider: 'polymarket', title: 'Human Mars 2030' },
      { id: '6', provider: 'manifold', title: 'Human Mars 2030' },
    ].map((x) => ({
      ...x,
      description: 'Will SpaceX land humans on Mars by 2023?',
      liquidity: '$1.0M',
      prob: '59%',
      created: '19 Jul, 2025',
      yes: '47%',
      no: '53%',
      category: 'Tech',
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
    if (activeTab === 'watchlist') return watchlistItems;
    // For now, positions mirrors trending placeholder
    if (activeTab === 'positions') return items;
    return items;
  }, [activeTab, items, watchlistItems]);

  // Apply provider filtering based on selected chips and removed ids
  const filteredItems = useMemo(() => {
    const activeProviders = new Set(
      chips.map(label => providerLabelToKey[label] ?? label.toLowerCase())
    );
    const base = activeProviders.size === 0 ? baseItems : baseItems.filter(x => activeProviders.has(x.provider));
    const withoutRemoved = base.filter(x => !removedIds.has(x.id));
    const searched = filterByQuery(withoutRemoved, searchQuery, {
      fields: [
        'title',
        'description',
        'category',
        (x) => x.provider,
      ],
    });
    return searched;
  }, [baseItems, chips, removedIds, searchQuery]);

  const renderProviderBadge = (provider: string) => {
    switch (provider) {
      case 'kalshi':
        return (
          <div className="w-10 h-10 rounded bg-[#179F61] border border-[#179F61] flex items-center justify-center">
            <img src="/K-Kalshi.svg" alt="Kalshi" className="w-7 h-7" />
          </div>
        );
      case 'manifold':
        return (
          <div className="w-10 h-10 rounded bg-[#4337C4] border border-[#4337C4] flex items-center justify-center">
            <img src="/Manifold.svg" alt="Manifold" className="w-7 h-7" />
          </div>
        );
      case 'limitless':
        return (
          <div className="w-10 h-10 rounded bg-[#DCF58D] border border-[#DCF58D] flex items-center justify-center">
            <img src="/Limitless.svg" alt="Limitless" className="w-7 h-7" />
          </div>
        );
      case 'polymarket':
        return (
          <div className="w-10 h-10 rounded bg-[#1751F0] border border-[#1751F0] flex items-center justify-center">
            <img src="/Polymarket.svg" alt="Polymarket" className="w-7 h-7" />
          </div>
        );
      case 'predictit':
        return (
          <div className="w-10 h-10 rounded bg-[#07A0BA] border border-[#07A0BA] flex items-center justify-center">
            <img src="/Predictit.svg" alt="PredictIt" className="w-7 h-7" />
          </div>
        );
      case 'zeitgeist':
        return (
          <div className="w-10 h-10 rounded bg-white border border-white flex items-center justify-center">
            <img src="/Zeitgeist.svg" alt="Zeitgeist" className="w-7 h-7" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded bg-white border border-white flex items-center justify-center">
            <img src="/placeholder.svg" alt="icon" className="w-7 h-7 opacity-80" />
          </div>
        );
    }
  };

  const getProviderBorderRgb = (provider: string): string => {
    switch (provider) {
      case 'kalshi':
        return '23,159,97'; // #179F61
      case 'manifold':
        return '67,55,196'; // #4337C4
      case 'limitless':
        return '220,245,141'; // #DCF58D
      case 'polymarket':
        return '23,81,240'; // #1751F0
      case 'predictit':
        return '7,160,186'; // #07A0BA
      case 'zeitgeist':
        return '255,255,255'; // white
      default:
        return '255,255,255';
    }
  };

  return (
    <aside className={`hidden lg:flex flex-col fixed left-[80px] top-8 z-30 h-dvh w-[320px] border-r border-customGray44 ${isWatchlistClosing ? 'animate-lsb-out' : 'animate-lsb-in'}`}>
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
        <button className="h-9 w-9 flex items-center justify-center">
          <img src="/Filter-icon.svg" alt="Filters" className="opacity-[72%] w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Chips row */}
      <div className="pt-3 pb-1 border-b-gradient shrink-0">
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
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto scroll-thin px-3 py-3">
        {filteredItems.map((x) => (
          <div
            key={x.id}
            className="rounded-[12px] border border-[#212121] p-3 mb-3 relative group border-gradient-overlay"
            style={{ ['--border-grad-rgb' as unknown as string]: getProviderBorderRgb(x.provider) }}
          >
            {activeTab === 'watchlist' ? (
              <div className="absolute top-2 right-2 p-1 rounded">
                <img src="/Bookmark--filled.svg" alt="Bookmarked" className="w-4 h-4 opacity-64" />
              </div>
            ) : (
              <button
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                aria-label="Remove card"
                onClick={() => {
                  removeCard(x.id);
                }}
              >
                <img src="/Trash-can.svg" alt="Delete" className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-start gap-2">
              {renderProviderBadge(x.provider)}
              <div className="min-w-0">
                <div className="text-[16px] font-semibold truncate">{x.title}</div>
                <div className="text-[12px] text-white/44 truncate tracking-[-2%]">{x.description}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
              <span className="px-1 py-1 rounded-[8px] bg-white/4">
                <span className="text-white/44">Liquidity:</span>
                <span className="ml-1 text-white">{x.liquidity}</span>
              </span>
              <span className="px-1 py-1 rounded-[8px] bg-white/4">
                <span className="text-white/44">Prob.:</span>
                <span className="ml-1 text-white">{x.prob}</span>
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
          </div>
        ))}
      </div>
    </aside>
  );
}


