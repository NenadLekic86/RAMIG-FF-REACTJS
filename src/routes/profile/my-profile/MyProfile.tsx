import { useEffect, useMemo, useRef, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../Table/DataTable';
import TabUnderline from '../../../components/Tabs/TabUnderline';
import { demoCards } from '../../../models/card';

type PositionRow = {
  name: string;
  invested: string;
  remaining: string;
  sold: string;
  pnlPercent: number; // positive or negative
  pnlCents: number; // absolute +/- cents
  status: 'sell' | 'sold';
};

const sampleRows: PositionRow[] = demoCards
  .filter(c => !!c.position)
  .map((c, i) => ({
    name: c.title,
    invested: c.position?.size ?? '0¢',
    remaining: c.position?.remaining ?? '0¢',
    sold: c.position?.sold ?? '0¢',
    pnlPercent: parseFloat((c.position?.pnl ?? '0').replace(/[^0-9.-]/g, '')) * (c.position?.pnl?.trim().startsWith('-') ? 1 : 1),
    pnlCents: i % 2 === 0 ? -950 : 950,
    status: c.position?.status === 'history' ? 'sold' : 'sell',
  }));

export default function MyProfile() {
  const columns = useMemo<ColumnDef<PositionRow>[]>(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Invested', accessorKey: 'invested' },
    { header: 'Remaining', accessorKey: 'remaining' },
    { header: 'Sold', accessorKey: 'sold' },
    {
      header: 'P&L',
      cell: ({ row }) => {
        const p = row.original.pnlPercent;
        const c = row.original.pnlCents;
        const isPos = p >= 0;
        return (
          <div className="flex flex-col">
            <span className={isPos ? 'text-[#039855]' : 'text-[#D92D20]'}>
              {isPos ? `+${p.toFixed(2)}%` : `${p.toFixed(2)}%`}
            </span>
            <span className={isPos ? 'text-[#039855] text-sm' : 'text-[#D92D20] text-sm'}>
              ({isPos ? `+${c}¢` : `${c}¢`})
            </span>
          </div>
        );
      },
    },
    {
      header: '',
      id: 'action',
      cell: ({ row }) => {
        const { status } = row.original;
        if (status === 'sold') {
          return (
            <div className="inline-flex items-center text-xs px-2 py-1 rounded border border-[#D92D20] text-[#D92D20]">
              Sold
            </div>
          );
        }
        return (
          <button className="text-xs px-3 py-1 rounded-[4px] text-[#D92D20] bg-[#D92D20]/24 hover:bg-[#D92D20]/72 hover:text-white transition-colors duration-300">
            Sell
          </button>
        );
      },
    },
  ], []);

  const [subTab, setSubTab] = useState<'all' | 'active' | 'history'>('all');
  const subTabsRef = useRef<HTMLDivElement | null>(null);

  // Local search/sort state for this page only
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'pnl'>('alphabetical');
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click / ESC
  useEffect(() => {
    if (!isSortOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!sortMenuRef.current || !sortBtnRef.current) return;
      if (!sortMenuRef.current.contains(target) && !sortBtnRef.current.contains(target)) {
        setIsSortOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSortOpen(false); };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isSortOpen]);

  // Derived table rows based on sub-tab + search + sort (local only)
  const displayRows = useMemo(() => {
    let rows = sampleRows;
    if (subTab !== 'all') {
      rows = rows.filter(r => (subTab === 'active' ? r.status !== 'sold' : r.status === 'sold'));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const qDigits = q.replace(/[^0-9.-]/g, '');
      const queryHasNumber = /[0-9]/.test(q);
      rows = rows.filter(r => {
        // Text fields match (name, status 'sell'/'sold')
        const textHit = r.name.toLowerCase().includes(q) || r.status.toLowerCase().includes(q);
        // Numeric fields match by plain string or digits-only includes
        const numericStrings = [
          r.invested,
          r.remaining,
          r.sold,
          String(Math.abs(r.pnlCents)),
          String(Math.abs(r.pnlPercent)),
        ];
        const numberHit = numericStrings.some((val) => {
          const v = (val || '').toString().toLowerCase();
          if (v.includes(q)) return true; // allow matching like "1,580" directly
          if (!queryHasNumber) return false;
          const vDigits = v.replace(/[^0-9.-]/g, '');
          return vDigits.includes(qDigits);
        });
        return textHit || numberHit;
      });
    }
    const copy = [...rows];
    if (sortBy === 'alphabetical') copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'pnl') copy.sort((a, b) => (b.pnlPercent || 0) - (a.pnlPercent || 0));
    return copy;
  }, [subTab, searchQuery, sortBy]);

  return (
    <div className="space-y-4 p-6 bg-customGray17 rounded-[12px] border border-customGray44">
      {/* Inner tabs + right controls */}
      <div className="tabs-with-indicator" ref={subTabsRef}>
        <div className="flex items-center gap-6 justify-between">
          <div className="flex items-center gap-6">
          <button
            data-tab-key="all"
            className={`px-3 py-3 filter-tab ${subTab === 'all' ? 'active' : ''}`}
            onClick={() => setSubTab('all')}
          >
            All Positions
          </button>
          <button
            data-tab-key="active"
            className={`px-3 py-3 filter-tab ${subTab === 'active' ? 'active' : ''}`}
            onClick={() => setSubTab('active')}
          >
            Active Positions
          </button>
          <button
            data-tab-key="history"
            className={`px-3 py-3 filter-tab ${subTab === 'history' ? 'active' : ''}`}
            onClick={() => setSubTab('history')}
          >
            History
          </button>
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 ml-4">
            {/* Animated search input (emerges from icon) */}
            <div
              className={`h-9 flex items-center px-2 rounded-[8px] border border-customGray44 bg-[#171717] overflow-hidden ${
                isSearchOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
              style={{
                width: isSearchOpen ? 200 : 0,
                transition: 'width 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease, transform 200ms ease',
              }}
            >
              <input
                className="bg-transparent outline-none text-sm w-[180px] placeholder:text-[white]/48"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(o => !o)}
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/5"
            >
              <img src="/Search-icon.svg" alt="Search" className="opacity-[72%] w-[18px] h-[18px]" />
            </button>
            {/* Sort dropdown */}
            <div className="relative">
              <button
                ref={sortBtnRef}
                className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/5"
                onClick={() => setIsSortOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={isSortOpen}
              >
                <img src="/Sort--descending.svg" alt="Sort" className="opacity-[72%] w-[18px] h-[18px]" />
              </button>
              {isSortOpen && (
                <div
                  ref={sortMenuRef}
                  role="menu"
                  className="absolute right-0 top-[calc(100%+4px)] z-50 w-[232px] rounded-[16px] border border-customGray44 bg-[#292929] shadow-xl"
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
        </div>
        <TabUnderline containerRef={subTabsRef} activeKey={subTab} bottom={-1} height={2} />
      </div>

      {/* Table (static data for now) */}
      <div className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={displayRows} />
        </div>
      </div>
    </div>
  );
}


