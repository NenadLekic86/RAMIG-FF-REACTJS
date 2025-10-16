import { useMemo, useRef, useState } from 'react';
import Card from '../../components/Card/Card.tsx';
import type { CardData } from '../../models/card';
import { demoCards } from '../../models/card';
import ExploreFilter from '../../components/Modals/ExploreFilter';
import { useUIStore } from '../../store/ui';
import TabUnderline from '../../components/Tabs/TabUnderline.tsx';
import { useProviderFilters, type ProviderKey } from '../../store/filters';
import { filterByQuery } from '../../utils/search';

// Sample market data - centralized in models/card for now
const sampleMarketData: CardData[] = demoCards;

export default function Explore() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const openRightSidebar = useUIStore(s => s.openRightSidebar);
    const openWatchlist = useUIStore(s => s.openWatchlist);
    const isWatchlistOpen = useUIStore(s => s.isWatchlistOpen);
    const exploreTabsRef = useRef<HTMLDivElement>(null);
    const providerFilters = useProviderFilters();

    const handleCardClick = (cardData: CardData) => {
        openRightSidebar(cardData);
    };

    return (
    <div className="space-y-5">
        {/* Header & My Watchlist */}
        <div className="flex items-center justify-between">
            <h1 className="font-title text-2xl md:text-3xl">Explore</h1>
            {!isWatchlistOpen && (
            <button onClick={openWatchlist} className="flex items-center gap-2 px-3 py-3 rounded-[8px] bg-customGray17">
                <img src="/Bookmark-icon.svg" alt="My Watchlist" className="opacity-[72%]" width={18} height={18} />
                <span className="text-sm">My Watchlist</span>
            </button>
            )}
        </div>

        {/* Filter tabs */}
        <div ref={exploreTabsRef} className="mt-6 pb-3 flex items-center gap-3 tabs-with-indicator relative">
            <div
                data-tab-key="all"
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
            >
                All
            </div>
            <div
                data-tab-key="grouped"
                className={`filter-tab ${activeFilter === 'grouped' ? 'active' : ''}`}
                onClick={() => setActiveFilter('grouped')}
            >
                Grouped
            </div>
            {/* Animated indicator for Explore tabs */}
            <TabUnderline containerRef={exploreTabsRef} activeKey={activeFilter} />
        </div>

        {/* Search & Filters */}
        <div className="mt-12 flex items-center gap-3">
            <div className="">
                <div className="h-10 rounded-[8px] bg-customGray17 flex items-center pr-6 pl-4 gap-2">
                    <img src="/Search-icon.svg" alt="Search" className="opacity-[72%]" width={18} height={18} />
                    <input
                        className="bg-transparent outline-none text-sm w-full placeholder:text-[white]/48"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <button onClick={() => setIsFiltersOpen(true)} className="h-10 px-3 rounded-[8px] bg-customGray17 text-sm flex items-center gap-2">
                <img src="/Filter-icon.svg" alt="Filters" className="opacity-[72%]" width={18} height={18} />
                Filters
            </button>
        </div>

        {/* Search results */}
        <div className="mt-6">
            <p className="text-xs text-white/48">
            <span className="text-white/48 mr-1">{useMemo(() => {
                const selected = providerFilters.selectedProviders;
                const base = selected.size === 0
                  ? []
                  : sampleMarketData.filter(c => selected.has(c.provider as ProviderKey));
                const afterSearch = filterByQuery(base, searchQuery, {
                  fields: [
                    'title',
                    'description',
                    (c) => (c.provider as string),
                  ],
                });
                return afterSearch.length;
            }, [providerFilters.selectedProviders, searchQuery])}</span> 
            sibling markets</p>
        </div>

        {/* Market cards */}
        <section className={`grid gap-2 sm:grid-cols-2 md:grid-cols-3 ${isWatchlistOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
            {useMemo(() => {
                const selected = providerFilters.selectedProviders;
                const base = selected.size === 0
                  ? []
                  : sampleMarketData.filter(c => selected.has(c.provider as ProviderKey));
                const afterSearch = filterByQuery(base, searchQuery, {
                  fields: [
                    'title',
                    'description',
                    (c) => (c.provider as string),
                  ],
                });
                return afterSearch;
            }, [providerFilters.selectedProviders, searchQuery]).map((cardData) => (
                <Card
                    key={cardData.id}
                    data={cardData}
                    onClick={() => handleCardClick(cardData)}
                />
            ))}
        </section>

        <ExploreFilter open={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </div>
    );
}