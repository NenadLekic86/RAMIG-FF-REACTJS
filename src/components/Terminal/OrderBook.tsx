import { useState } from 'react';

type OrderBookProps = {
  label: string;
  probability?: number;
  volumeText?: string;
  isActive: boolean;
  onSelect?: () => void;
  onYes?: () => void;
  onNo?: () => void;
  description?: string; // when provided, show description panel instead of order book
};

export default function OrderBook({
  label,
  probability,
  volumeText,
  isActive,
  onSelect,
  onYes,
  onNo,
  description,
}: OrderBookProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div
      className={`my-2 bg-customGray17 rounded-[12px] border border-customGray44 gradient-border-rainbow-hover cursor-pointer ${isActive ? 'gradient-border-rainbow-on' : ''}`}
      onClick={() => {
        onSelect?.();
        setExpanded((v) => !v);
      }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3 min-h-[66px]">
        <button className="min-w-0 text-left" type="button">
          <h3 className="text-[14px] text-white">{label}</h3>
          {volumeText ? (
            <p className="mt-1 text-sm text-white/44">{volumeText}</p>
          ) : null}
        </button>
        {typeof probability === 'number' ? (
          <div className="flex-1 text-center text-white font-semibold text-[18px]">{`${probability.toFixed(1)}%`}</div>
        ) : (
          <div className="flex-1" />
        )}
        {!description && (
        <div className="flex items-center gap-3">
          <button
            className="h-[40px] px-4 rounded-[12px] border-1 border-[#31D482]/72 text-[#31D482] text-[14px] font-semibold hover:bg-[#31D482]/72 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onYes?.();
            }}
            type="button"
          >
            Yes
          </button>
          <button
            className="h-[40px] px-4 rounded-[12px] border-1 border-[#F97066]/72 text-[#F97066] text-[14px] font-semibold hover:bg-[#F97066]/72 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onNo?.();
            }}
            type="button"
          >
            No
          </button>
        </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4 border-t border-customGray44 pt-4">
          {description ? null : (
            <div className="flex items-center justify-between mb-4 px-5">
              <h4 className="text-white">Order Book</h4>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="px-2 py-1 rounded bg-white/5">Last: <span className="text-white">75¢</span></span>
                <span className="px-2 py-1 rounded bg-white/5">Spread: <span className="text-white">0.5¢</span></span>
              </div>
            </div>
          )}

          {description ? (
            <div className="px-5 pb-5">
              <div className="p-5 leading-7 text-white/80">
                {description.split('\n').map((p, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-5' : ''}>{p}</p>
                ))}
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Bids column */}
            <div>
              <div className="text-[14px] text-[#039855] font-semibold pl-5">Bids</div>
              <div className="relative h-[2px] w-[95%] mt-2 mb-4 left-5" style={{ backgroundColor: '#039855' }} />

              <div className="flex gap-1 text-[12px] text-white/44">
                <span className="basis-16 shrink-0 text-left pl-5">Price</span>
                <span className="basis-22 text-left pl-5">Contracts</span>
                <span className="basis-22 text-left pl-5">Total</span>
              </div>

              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="relative py-4">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-700/8"
                    style={{ width: `${100 - (i - 1) * 10}%` }}
                  />
                  <div className="relative flex gap-1 items-center text-[14px] text-white">
                    <span className="basis-16 shrink-0 text-left pl-5">75¢</span>
                    <span className="basis-22 text-left pl-5">{[1580, 780, 580][i % 3]}</span>
                    <span className="basis-22 text-left pl-5">$1,555.40</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Asks column */}
            <div>
              <div className="text-[14px] text-[#D92D20] font-semibold text-right pr-5">Asks</div>
              <div className="relative h-[2px] w-[95%] mt-2 mb-4 right-0" style={{ backgroundColor: '#D92D20' }} />

              <div className="flex gap-1 justify-end text-[12px] text-white/44">
                <span className="basis-22 text-right pr-5">Total</span>
                <span className="basis-22 text-right pr-5">Contracts</span>
                <span className="basis-16 shrink-0 text-right pr-5">Price</span>
              </div>

              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="relative py-4">
                  <div
                    className="absolute inset-y-0 right-0 bg-red-700/8"
                    style={{ width: `${100 - (i - 1) * 10}%` }}
                  />
                  <div className="relative flex gap-1 justify-end items-center text-[14px] text-white">
                    <span className="basis-22 text-right pr-5">$1,555.40</span>
                    <span className="basis-22 text-right pr-5">{[1580, 780, 580][i % 3]}</span>
                    <span className="basis-16 shrink-0 text-right pr-5">75¢</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}


