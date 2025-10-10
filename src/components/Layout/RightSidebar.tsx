import { useEffect, useState } from 'react';
import { useUIStore } from '../../store/ui';
import { useToast } from '../../store/ui';

export function RightSidebar() {
  const { isRightSidebarOpen, selectedCard, closeRightSidebar } = useUIStore();
  const { pushToast } = useToast();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [detail, setDetail] = useState<{ label: string; side: 'buy' | 'sell' | 'yes' | 'no' } | null>(null);
  const [slippage, setSlippage] = useState<number>(44);
  const [amount, setAmount] = useState<string>('10.00');
  const [price, setPrice] = useState<string>('5.00');
  const balanceUsd = 2500; // static for now; will come from API later

  // Persist slippage only while on the detail view (cleared when leaving)
  useEffect(() => {
    if (view === 'detail') {
      const cached = sessionStorage.getItem('rsb_slippage');
      if (cached !== null) {
        const parsed = parseInt(cached, 10);
        if (!Number.isNaN(parsed)) setSlippage(parsed);
      } else {
        setSlippage(44);
      }
    } else {
      sessionStorage.removeItem('rsb_slippage');
    }
  }, [view]);

  useEffect(() => {
    if (view === 'detail') {
      sessionStorage.setItem('rsb_slippage', String(slippage));
    }
  }, [slippage, view]);

  const sanitizeCurrencyInput = (value: string): string => {
    let v = value.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      // remove extra dots
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    // limit to two decimals
    const parts = v.split('.');
    if (parts[1] !== undefined) {
      parts[1] = parts[1].slice(0, 2);
      v = parts[0] + '.' + parts[1];
    }
    // avoid leading zeros like 0005
    if (parts[0] && parts[0].length > 1 && parts[0].startsWith('0') && firstDot !== 1) {
      v = String(parseInt(parts[0], 10)) + (parts[1] !== undefined ? '.' + parts[1] : '');
    }
    return v;
  };

  // Early return to fully unmount when closed
  if (!isRightSidebarOpen || !selectedCard) return null;

  // Derive some placeholder values for now (static mocked later)
  const yesPrice = `${selectedCard.yesPercentage.toFixed(1)}%`;
  const amountValue = parseFloat(amount || '0');
  const isOverBalance = !Number.isNaN(amountValue) && amountValue > balanceUsd;

  return (
    <aside className="fixed right-0 top-0 z-40 h-dvh w-[440px] border-l border-customGray44 bg-customGray17 shadow-xl">
      {/* Floating outside close button */}
      <button
        onClick={closeRightSidebar}
        aria-label="Close panel"
        className="absolute -left-[56px] top-12 z-50 flex items-center justify-center rounded-full border"
        style={{ width: 44, height: 44, background: '#171717', borderColor: '#212121' }}
      >
        <img src="/Right-panel--close--filled.svg" alt="Close" className="w-5 h-5" />
      </button>

      {/* Header Top Row: icon + actions */}
      <div className="px-6 pt-6 pb-6 border-b border-customGray44">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {selectedCard.imageUrl && (
              <img src={selectedCard.imageUrl} alt={selectedCard.title} className="w-11 h-11 rounded" />
            )}
          </div>

          <div className="flex items-center text-xs gap-1 shrink-0">
            <button className="inline-flex items-center gap-2 px-2 py-1" aria-label="Open Terminal">
              <img src="/Chart--candlestick.svg" alt="Chart" className="w-5 h-5 opacity-70" />
              <span className="hidden sm:inline text-white/72 text-xs">Open Terminal</span>
            </button>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <button className="p-1" aria-label="Bookmark">
              <img src="/Bookmark-icon.svg" alt="Bookmark" className="w-5 h-5 opacity-70" />
            </button>
            <button className="p-1" aria-label="Link">
              <img src="/Link-icon.svg" alt="Link" className="w-5 h-5 opacity-70" />
            </button>

            <span className="mx-1 h-6 w-px bg-white/10" />

            <button onClick={closeRightSidebar} className="p-2" aria-label="Close">
              <img src="/Right-panel--close--filled.svg" alt="Close" className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Title and subtitle under the top row */}
        <div className="mt-6 min-w-0">
          <h2 className="text-base font-semibold truncate mb-1">{selectedCard.title}</h2>
          <p className="text-xs text-white/44 truncate">{selectedCard.description ?? '—'}</p>
        </div>
      </div>

      {/* Legend (hidden in detail view) */}
      {view === 'list' && (
      <div className="px-6 py-3 border-b border-customGray44">
        <div className="flex flex-wrap gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-white"></span>
            <span className="text-white/44 text-xs">25 bps decrease 80%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#179F61]"></span>
            <span className="text-white/44 text-xs">50+ bps decrease 15.8%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#0BA5EC]"></span>
            <span className="text-white/44 text-xs">No change 4.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#DCF58D]"></span>
            <span className="text-white/44 text-xs">25+ bps increase &lt;1%</span>
          </div>
        </div>
      </div>
      )}

      {/* Timeframe toolbar (static, hidden in detail view) */}
      {view === 'list' && (
      <div className="px-6 py-2 flex items-center gap-2 text-[11px] text-white/44">
        {['15m','1h','6h','1d','All'].map((t) => (
          <button key={t} className={`px-2 py-1 rounded ${t==='15m' ? 'text-white' : 'hover:bg-white/5'}`}>{t}</button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <img src="/Zoom--out.svg" alt="zoom" className="w-5 h-5 opacity-70" />
          <img src="/Zoom--in.svg" alt="search" className="w-5 h-5 opacity-70" />
          <img src="/Zoom--reset.svg" alt="search" className="w-5 h-5 opacity-70" />
        </div>
      </div>
      )}

      {/* Chart placeholder (hidden in detail view) */}
      {view === 'list' && (
      <div className="px-6 py-4 border-b border-customGray44">
        <div className="h-auto flex items-center justify-center text-xs text-white/40">
          <img src="/LineChart-rightsidebar.png" alt="chart" className="w-full h-full" />
        </div>
      </div>
      )}

      {view === 'list' ? (
        /* Order blocks list */
        <div className="p-6">
          {/* Block 1 */}
          <div className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: '50+ bps decreased', side: 'buy' }); }} className="min-w-0 text-left">
                <h3 className="text-[14px] text-white/80">50+ bps decreased</h3>
                <p className="mt-1 text-sm text-white/44">$20,660,050 Vol.</p>
              </button>
              <div className="text-right text-white font-semibold text-[18px]">{yesPrice}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: '50+ bps decreased', side: 'buy' }); }} className="h-[40px] rounded-[8px] border-1 border-[#31D482]/72 text-[#31D482] text-[14px] font-semibold hover:bg-[#31D482]/10">Buy 80¢</button>
              <button onClick={() => { setView('detail'); setDetail({ label: '50+ bps decreased', side: 'sell' }); }} className="h-[40px] rounded-[8px] border-1 border-[#F97066]/72 text-[#F97066] text-[14px] font-semibold hover:bg-[#F97066]/10">Sell 20¢</button>
            </div>
            <div className="-mx-6 mt-6 h-px bg-white/10" />
          </div>

          {/* Block 2 */}
          <div className="py-4">
            <div className="flex items-start justify-between gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: '25 bps decrease', side: 'buy' }); }} className="min-w-0 text-left">
                <h3 className="text-[14px] text-white/80">25 bps decrease</h3>
                <p className="mt-1 text-sm text-white/44">$20,660,050 Vol.</p>
              </button>
              <div className="text-right text-white font-semibold text-[18px]">15.8%</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: '25 bps decrease', side: 'buy' }); }} className="h-[40px] rounded-[8px] border-1 border-[#31D482]/72 text-[#31D482] text-[14px] font-semibold hover:bg-[#31D482]/10">Buy 15.8¢</button>
              <button onClick={() => { setView('detail'); setDetail({ label: '25 bps decrease', side: 'sell' }); }} className="h-[40px] rounded-[8px] border-1 border-[#F97066]/72 text-[#F97066] text-[14px] font-semibold hover:bg-[#F97066]/10">Sell 84.2¢</button>
            </div>
            <div className="-mx-6 mt-6 h-px bg-white/10" />
          </div>

          {/* Block 3 */}
          <div className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: 'No change', side: 'yes' }); }} className="min-w-0 text-left">
                <h3 className="text-[14px] text-white/80">No change</h3>
                <p className="mt-1 text-sm text-white/44">$20,660,050 Vol.</p>
              </button>
              <div className="text-right text-white font-semibold text-[18px]">4.5%</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button onClick={() => { setView('detail'); setDetail({ label: 'No change', side: 'yes' }); }} className="h-[40px] rounded-[8px] border-1 border-[#31D482]/72 text-[#31D482] text-[14px] font-semibold hover:bg-[#31D482]/10">Yes</button>
              <button onClick={() => { setView('detail'); setDetail({ label: 'No change', side: 'no' }); }} className="h-[40px] rounded-[8px] border-1 border-[#F97066]/72 text-[#F97066] text-[14px] font-semibold hover:bg-[#F97066]/10">No</button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected outcome detail view */
        <div>
          {/* Bar with back + title and order type (full width divider) */}
          <div className="border-b border-customGray44">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { setView('list'); sessionStorage.removeItem('rsb_slippage'); setSlippage(44); }} aria-label="Back">
                  <img src="/Chevron--left.svg" alt="Back" className="w-5 h-5" />
                </button>
                <span className="font-semibold">Selected outcome</span>
              </div>
              <button className="flex items-center gap-1 text-white/80" aria-label="Order type">
                <span>Limit</span>
                <img src="/Chevron--sort.svg" alt="Sort" className="w-5 h-5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Outcome row */}
          <div className="p-6 mt-0 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[14px] text-white/80">{detail?.label ?? ''}</h3>
              <p className="mt-1 text-sm text-white/44">$20,660,050 Vol.</p>
            </div>
            <div className="text-right text-white font-semibold text-[18px]">{yesPrice}</div>
          </div>
          <div className="px-6 grid grid-cols-2 gap-4">
            <button className="h-[44px] rounded-[10px] bg-transparent hover:bg-[#31D482]/72 border-1 border-[#31D482]/72 text-white text-[14px] font-semibold transition-colors duration-300">Buy 80¢</button>
            <button className="h-[44px] rounded-[10px] bg-transparent hover:bg-[#F97066]/72 border-1 border-[#F97066]/72 text-[#F97066] hover:text-white text-[14px] font-semibold transition-colors duration-300">Sell 20¢</button>
          </div>

          {/* Amount */}
          <div className="px-6 mt-8 border-b border-customGray44 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-white/90">Amount</span>
              <span className="text-white/44">Balance: ${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 py-3 w-full">
                <span className="text-white/50 text-[18px]">$</span>
                <input
                  className="bg-transparent outline-none w-full text-[28px]"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(sanitizeCurrencyInput(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                {['+1','+20','+100','MAX'].map(t => (
                  <button
                    key={t}
                    className="px-2 py-2 rounded bg-white/5 text-xs text-white/70 border border-customGray44"
                    onClick={() => {
                      if (t === 'MAX') {
                        setAmount(balanceUsd.toFixed(2));
                      } else {
                        const inc = parseInt(t.replace('+',''), 10);
                        const current = parseFloat(amount || '0');
                        const next = (Number.isNaN(current) ? 0 : current) + inc;
                        setAmount(next.toFixed(2));
                      }
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const a = parseFloat(amount || '0');
              if (!Number.isNaN(a) && a > balanceUsd) {
                return (
                  <div className="mt-2 flex items-center gap-2" role="alert" aria-live="polite">
                    <img src="/Warning--filled.svg" alt="Warning" className="w-4 h-4" />
                    <span className="text-[13px]" style={{ color: '#F97066' }}>Amount exceeds available balance.</span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Price */}
          <div className="px-6 border-b border-customGray44 py-4">
            <div className="text-white/90">Price</div>
            <div className="text-xs text-white/44">Input price to change to limit order</div>
            <div className="flex items-center gap-2 pt-2 w-full">
              <span className="text-white/50 text-[18px]">$</span>
              <input
                className="bg-transparent outline-none w-full text-[28px]"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(sanitizeCurrencyInput(e.target.value))}
              />
            </div>
          </div>

          {/* Slippage */}
          <div className="px-6 border-b border-customGray44 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/90">Slippage</div>
                <div className="text-xs text-white/44">Protects against sudden price swings</div>
              </div>
              <div className="text-white/70">{slippage}%</div>
            </div>
            <div className="mt-3 relative h-6">
              {/* Base track (unused portion) */}
              <div
                className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              />
              {/* Filled track (selected portion) */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded"
                style={{
                  width: `${slippage}%`,
                  background:
                    'linear-gradient(90deg, #12B76A 0%, #0BA5EC 25%, #EE46BC 50%, #7A5AF8 75%, #F79009 100%)',
                }}
              />
              {/* Real range input overlay */}
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={slippage}
                onChange={(e) => setSlippage(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Slippage"
              />
              {/* Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-10 w-4 h-4 bg-white rounded-full shadow pointer-events-none"
                style={{ left: `calc(${slippage}% - 8px)` }}
              />
            </div>
          </div>

          {/* Estimate Profit */}
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/90">Estimate Profit</div>
                <div className="text-xs text-white/44">Average price 4.6¢</div>
              </div>
              <div className="text-[#039855] font-semibold">$12,578.50</div>
            </div>
            <button
              className={`mt-5 h-[56px] w-full rounded-[12px] bg-[#31D482]/72 hover:bg-[#31D482] text-white font-semibold transition-colors duration-300 ${isOverBalance ? 'opacity-50 cursor-not-allowed hover:bg-[#31D482]/72' : ''}`}
              disabled={isOverBalance}
              aria-disabled={isOverBalance}
              onClick={() => {
                // Processing toast
                pushToast({
                  type: 'processing',
                  title: 'Order processing',
                  description: 'Submitting your order...'
                });
                // Simulate async
                setTimeout(() => {
                  const ok = Math.random() > 0.33;
                  if (ok) {
                    pushToast({ type: 'success', title: 'Order executed', description: 'Your order was filled.' });
                  } else {
                    pushToast({ type: 'error', title: 'Order failed', description: 'There was a problem placing your order.' });
                  }
                }, 1200);
              }}
            >
              Buy Yes
            </button>
          </div>

          {/* Bottom meta */}
          <div className="px-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-white/44">Close Date:</div>
              <div className="text-white/44 mt-1">Platform:</div>
            </div>
            <div className="text-right">
                <div className="text-white/80">17 Sep 2025 (8 days)</div>
              <div className="text-white/80 mt-1">Zeitgeist</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default RightSidebar;


