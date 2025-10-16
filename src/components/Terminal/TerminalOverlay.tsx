import { useEffect, useMemo, useRef, useState } from 'react';
import TabUnderline from '../Tabs/TabUnderline.tsx';
import OrderBook from './OrderBook';
import { useUIStore, useToast } from '../../store/ui';
import type { Outcome } from '../../models/card';
import { PROVIDER_CONFIGS } from '../../config/providers';

export default function TerminalOverlay() {
  const {
    isTerminalOpen,
    isTerminalClosing,
    isWatchlistOpen,
    selectedCard,
  } = useUIStore();
  const { pushToast } = useToast();

  const providerIconMap: Record<string, string> = Object.fromEntries(
    Object.entries(PROVIDER_CONFIGS).map(([k, v]) => [k, v.icon])
  );

  const [view] = useState<'list' | 'detail'>('list');
  const [detail, setDetail] = useState<{ label: string; side: 'buy' | 'sell' | 'yes' | 'no' } | null>({ label: '50+ bps decreased', side: 'yes' });
  const [activeOutcome, setActiveOutcome] = useState<string>('50+ bps decreased');
  const [slippage, setSlippage] = useState<number>(44);
  const [amount, setAmount] = useState<string>('10.00');
  const [price, setPrice] = useState<string>('5.00');
  const balanceUsd = 2500;
  const [tradeTab, setTradeTab] = useState<'buy' | 'sell'>('buy');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLButtonElement>(null);
  const sellRef = useRef<HTMLButtonElement>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  useEffect(() => {
    if (view === 'detail') {
      const cached = sessionStorage.getItem('term_slippage');
      if (cached !== null) {
        const parsed = parseInt(cached, 10);
        if (!Number.isNaN(parsed)) setSlippage(parsed);
      } else {
        setSlippage(44);
      }
    } else {
      sessionStorage.removeItem('term_slippage');
    }
  }, [view]);

  useEffect(() => {
    if (view === 'detail') {
      sessionStorage.setItem('term_slippage', String(slippage));
    }
  }, [slippage, view]);

  const sanitizeCurrencyInput = (value: string): string => {
    let v = value.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    const parts = v.split('.');
    if (parts[1] !== undefined) {
      parts[1] = parts[1].slice(0, 2);
      v = parts[0] + '.' + parts[1];
    }
    if (parts[0] && parts[0].length > 1 && parts[0].startsWith('0') && firstDot !== 1) {
      v = String(parseInt(parts[0], 10)) + (parts[1] !== undefined ? '.' + parts[1] : '');
    }
    return v;
  };

  // Compute layout class before any early returns to satisfy hooks rule
  const leftOffsetClass = useMemo(
    () => (isWatchlistOpen ? 'lg:left-[400px]' : 'lg:left-[80px]'),
    [isWatchlistOpen]
  );

  if (!isTerminalOpen || !selectedCard) return null;

  // selected card headline percent is used via outcomes map below
  const outcomePercentByLabel: Record<string, number> = (selectedCard.outcomes || []).reduce((acc: Record<string, number>, o: Outcome) => {
    acc[o.label] = o.probability;
    return acc;
  }, {});
  const selectedOutcomePercent = outcomePercentByLabel[activeOutcome] ?? selectedCard.yesPercentage;
  const selectedOutcomePercentText = `${selectedOutcomePercent.toFixed(1)}%`;
  const amountValue = parseFloat(amount || '0');
  const isOverBalance = !Number.isNaN(amountValue) && amountValue > balanceUsd;

  return (
    <div className={`fixed ${leftOffsetClass} right-0 top-[57px] z-30 h-[calc(100dvh-57px)] border-l border-customGray44 bg-customBg shadow-xl ${isTerminalClosing ? 'animate-rsb-out' : 'animate-rsb-in'} flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-customGray44">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-[8px] shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src={selectedCard.imageUrl || '/placeholder_img.png'}
                alt={selectedCard.title}
                className="w-full h-full object-cover rounded-[8px]"
              />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 p-0.5 rounded-full"
                style={{
                  border: `1px solid ${PROVIDER_CONFIGS[selectedCard.provider as keyof typeof PROVIDER_CONFIGS]?.bgHex ?? 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: PROVIDER_CONFIGS[selectedCard.provider as keyof typeof PROVIDER_CONFIGS]?.bgHex ?? 'rgba(0,0,0,0.24)'
                }}
              >
                <img
                  src={providerIconMap[selectedCard.provider] || '/placeholder.svg'}
                  alt={selectedCard.provider}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate mb-1">{selectedCard.title}</h2>
              <div className="mt-1 flex flex-wrap gap-2 text-[12px]">
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Liquidity:</span>
                  <span className="ml-1 text-white">{selectedCard.liquidity ?? '-'}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Prob.:</span>
                  <span className="ml-1 text-white">{`${Math.round(selectedCard.yesPercentage ?? 0)}%`}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Category:</span>
                  <span className="ml-1 text-white">{selectedCard.category ?? '-'}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Created:</span>
                  <span className="ml-1 text-white">{selectedCard.createdDate ?? '-'}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">Yes:</span>
                  <span className="ml-1 text-white">{`${Math.round(selectedCard.yesPercentage ?? 0)}%`}</span>
                </span>
                <span className="px-1 py-1 rounded-[8px] bg-white/4">
                  <span className="text-white/44">No:</span>
                  <span className="ml-1 text-white">{`${Math.round(selectedCard.noPercentage ?? 0)}%`}</span>
                </span>
              </div>
            </div>
          </div>
            <div className="flex items-center gap-2">
            <button className="p-3 text-[14px] flex items-center gap-2 bg-customGray17 rounded-[8px]" aria-label="Related Markets">
              <img src="/3rd-party-connected.svg" alt="Related Markets" className="w-5 h-5" />
              Related Markets
            </button>
            <button className="p-3 text-[14px] flex items-center gap-2 bg-customGray17 rounded-[8px]" aria-label="Portfolio">
            <img src="/User--avatar.svg" alt="Portfolio" className="w-5 h-5" />
            Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Content grid: large chart/content + ticket */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-0 h-full">
          {/* Left content */}
          <div className="h-full overflow-y-auto">
            {/* Legend */}
            {view === 'list' && (
              <div className="p-6 pb-4">
                <div className="flex flex-wrap gap-3 text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-white"></span><span className="text-white/44 text-xs">25 bps decrease 80%</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#179F61]"></span><span className="text-white/44 text-xs">50+ bps decrease 15.8%</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#0BA5EC]"></span><span className="text-white/44 text-xs">No change 4.5%</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-[#DCF58D]"></span><span className="text-white/44 text-xs">25+ bps increase &lt;1%</span></div>
                </div>
              </div>
            )}

            {view === 'list' && (
              <div className="px-6 py-2 flex items-center gap-2 text-[11px] text-white/44">
                {['15m','1h','6h','1d','All'].map((t) => (
                  <button key={t} className={`px-2 py-1 rounded ${t==='15m' ? 'text-white' : 'hover:bg-white/5'}`}>{t}</button>
                ))}
                <div className="ml-auto flex items-center gap-3">
                    <button type="button" onClick={() => setChartType('line')} aria-label="Line chart" aria-pressed={chartType==='line'}>
                      <img src="/Chart--line.svg" alt="Chart line" className={`w-5 h-5 ${chartType==='line' ? 'opacity-100' : 'opacity-44 hover:opacity-80'}`} />
                    </button>
                    <button type="button" onClick={() => setChartType('candlestick')} aria-label="Candlestick chart" aria-pressed={chartType==='candlestick'}>
                      <img src="/Chart--candlestick.svg" alt="Chart candlestick" className={`w-5 h-5 ${chartType==='candlestick' ? 'opacity-100' : 'opacity-44 hover:opacity-80'}`} />
                    </button>
                    <span> | </span>
                  <img src="/Zoom--out.svg" alt="zoom" className="w-5 h-5 opacity-70" />
                  <img src="/Zoom--in.svg" alt="search" className="w-5 h-5 opacity-70" />
                  <img src="/Zoom--reset.svg" alt="search" className="w-5 h-5 opacity-70" />
                </div>
              </div>
            )}

            {view === 'list' && (
              <div className="px-6 py-4">
                <div className="h-auto flex items-center justify-center text-xs text-white/40">
                  <img src={chartType==='line' ? '/LineChart-rightsidebar.png' : '/LineChart.svg'} alt="chart" className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Outcomes list with collapsible detail per item */}
            {view === 'list' && (
              <div className="py-2 px-6">
                {(selectedCard.outcomes && selectedCard.outcomes.length > 0
                  ? selectedCard.outcomes
                  : [
                      { label: '50+ bps decreased', probability: selectedCard.yesPercentage ?? 0, volume: '$20,660,050' },
                      { label: '25 bps decrease', probability: 15.8, volume: '$20,660,050' },
                      { label: 'No change', probability: 4.5, volume: '$20,660,050' },
                    ]
                ).map((o) => (
                  <OrderBook
                    key={o.label}
                    label={o.label}
                    probability={o.probability}
                    volumeText={`${o.volume ?? '$20,660,050'} Vol.`}
                    isActive={activeOutcome === o.label}
                    onSelect={() => { setActiveOutcome(o.label); setDetail({ label: o.label, side: tradeTab }); }}
                    onYes={() => { setDetail({ label: o.label, side: 'yes' }); }}
                    onNo={() => { setDetail({ label: o.label, side: 'no' }); }}
                  />
                ))}
                {/* Market Description as last expandable item */}
                <OrderBook
                  key="market-description"
                  label="Market Description"
                  isActive={activeOutcome === 'Market Description'}
                  onSelect={() => { setActiveOutcome('Market Description'); setDetail({ label: 'Market Description', side: tradeTab }); }}
                  volumeText={undefined}
                  description={
                    'The FED interest rates are defined in this market by the upper bound of the target federal funds range. The decisions on the target federal fund range are made by the Federal Open Market Committee (FOMC) meetings.\n\n' +
                    "This market will resolve to the amount of basis points the upper bound of the target federal funds rate is changed by versus the level it was prior to the Federal Reserve's September 2025 meeting.\n\n" +
                    "If the target federal funds rate is changed to a level not expressed in the displayed options, the change will be rounded up to the nearest 25 and will resolve to the relevant bracket. (e.g. if there's a cut/increase of 12.5 bps it will be considered to be 25 bps)"
                  }
                />
              </div>
            )}
          </div>

          {/* Right ticket panel (vertical scroll only) */}
          <div className="border-l border-customGray44 bg-customBg p-6 h-full overflow-y-auto overflow-x-hidden">
              <div>
                {/* Buy/Sell tabs with order type on the right */}
                <div className="px-1 pb-3 border-b border-customGray44 relative tabs-with-indicator">
                  <div className="flex items-center justify-between">
                    <div ref={tabsContainerRef} className="relative flex items-center gap-10">
                      <button
                        ref={buyRef}
                        data-tab-key="buy"
                        className={`px-2 py-1 text-[14px] font-semibold text-[#039855]`}
                        onClick={() => setTradeTab('buy')}
                        type="button"
                      >
                        Buy
                      </button>
                      <button
                        ref={sellRef}
                        data-tab-key="sell"
                        className={`px-2 py-1 text-[14px] font-semibold text-[#D92D20]`}
                        onClick={() => setTradeTab('sell')}
                        type="button"
                      >
                        Sell
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <span>Limit</span>
                      <img src="/Chevron--sort.svg" alt="Sort" className="w-5 h-5 opacity-80" />
                    </div>
                  </div>
                  <TabUnderline
                    containerRef={tabsContainerRef}
                    activeKey={tradeTab}
                    height={2}
                    bottom={-1}
                    background={tradeTab==='buy' ? '#039855' : '#D92D20'}
                    getTabEl={(key: string, container: HTMLElement) => container.querySelector(`[data-tab-key="${key}"]`) as HTMLElement | null}
                    widthScale={4}
                  />
                </div>
                <div className="py-4 border-b border-customGray44 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[14px] text-white/90">{detail?.label ?? activeOutcome}</h3>
                  </div>
                  <div className="text-right text-white font-semibold text-[18px]">{selectedOutcomePercentText}</div>
                </div>

                {/* Amount */}
                <div className="mt-6 border-b border-customGray44 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Amount</span>
                    <span className="text-white/44">Balance: ${balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 py-3 w-full">
                      <span className="text-white/50 text-[18px]">$</span>
                      <input className="bg-transparent outline-none w-full text-[28px]" inputMode="decimal" value={amount} onChange={(e) => setAmount(sanitizeCurrencyInput(e.target.value))} />
                    </div>
                    <div className="flex items-center gap-2">
                      {['+1','+20','+100','MAX'].map(t => (
                        <button key={t} className="px-2 py-2 rounded bg-white/5 text-xs text-white/70 border border-customGray44" onClick={() => {
                          if (t === 'MAX') {
                            setAmount(balanceUsd.toFixed(2));
                          } else {
                            const inc = parseInt(t.replace('+',''), 10);
                            const current = parseFloat(amount || '0');
                            const next = (Number.isNaN(current) ? 0 : current) + inc;
                            setAmount(next.toFixed(2));
                          }
                        }}>{t}</button>
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
                <div className="border-b border-customGray44 py-4">
                  <div className="text-white/90">Price</div>
                  <div className="text-xs text-white/44">Input price to change to limit order</div>
                  <div className="flex items-center gap-2 pt-2 w-full">
                    <span className="text-white/50 text-[18px]">$</span>
                    <input className="bg-transparent outline-none w-full text-[28px]" inputMode="decimal" value={price} onChange={(e) => setPrice(sanitizeCurrencyInput(e.target.value))} />
                  </div>
                </div>

                {/* Slippage */}
                <div className="py-8 border-b border-customGray44">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/90">Slippage</div>
                      <div className="text-xs text-white/44">Protects against sudden price swings</div>
                    </div>
                    <div className="text-white/70">{slippage}%</div>
                  </div>
                  <div className="mt-3 relative h-6">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded" style={{ width: `${slippage}%`, background: 'linear-gradient(90deg, #12B76A 0%, #0BA5EC 25%, #EE46BC 50%, #7A5AF8 75%, #F79009 100%)' }} />
                    <input type="range" min={0} max={100} step={1} value={slippage} onChange={(e) => setSlippage(parseInt(e.target.value, 10))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Slippage" />
                    <div className="absolute top-1/2 -translate-y-1/2 z-10 w-4 h-4 bg-white rounded-full shadow pointer-events-none" style={{ left: `calc(${slippage}% - 8px)` }} />
                  </div>
                </div>

                {/* Estimate Profit */}
                <div className="py-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/90">Estimate Profit</div>
                      <div className="text-xs text-white/44">Average price 4.6¢</div>
                    </div>
                    <div className="text-[#039855] font-semibold">$12,578.50</div>
                  </div>
                  <button className={`mt-5 h-[56px] w-full rounded-[12px] ${tradeTab==='buy' ? 'bg-[#31D482]/72 hover:bg-[#31D482]' : 'bg-[#D92D20]/60 hover:bg-[#D92D20]'} text-white font-semibold transition-colors duration-300 ${isOverBalance ? (tradeTab==='buy' ? 'opacity-50 cursor-not-allowed hover:bg-[#31D482]/72' : 'opacity-50 cursor-not-allowed hover:bg-[#D92D20]/60') : ''}`} disabled={isOverBalance} aria-disabled={isOverBalance} onClick={() => {
                    pushToast({ type: 'processing', title: 'Order processing', description: 'Submitting your order...' });
                    setTimeout(() => {
                      const ok = Math.random() > 0.33;
                      if (ok) {
                        pushToast({ type: 'success', title: 'Order executed', description: 'Your order was filled.' });
                      } else {
                        pushToast({ type: 'error', title: 'Order failed', description: 'There was a problem placing your order.' });
                      }
                    }, 1200);
                  }}>{tradeTab==='buy' ? 'Buy Yes' : 'Sell Yes'}</button>
                </div>

                {/* Bottom meta */}
                <div className="grid grid-cols-2 gap-3 text-sm">
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
          </div>
        </div>
      </div>
    </div>
  );
}


