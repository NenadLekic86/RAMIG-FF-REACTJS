import React, { useEffect, useState } from 'react'

type WithdrawModalProps = {
  open: boolean
  onClose: () => void
  providerName?: string
  balanceUsd?: string
  chainName?: string
  withdrawAddress?: string
  tokenSymbol?: string
  tokenIconSrc?: string
  chainIconSrc?: string
  termsUrl?: string
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[14px] tracking-wide text-white/50 mb-1">{children}</div>
)

export default function WithdrawModal({
  open,
  onClose,
  providerName = 'Polymarket',
  balanceUsd = '$2,563.50',
  chainName = 'Polygon',
  withdrawAddress = '0x61b3706511418DdA92A59A34f0E0A1C4ADDD70A8',
  tokenSymbol = 'USDC',
  tokenIconSrc = '/USDCCoinLogo.svg',
  chainIconSrc = '/PolygonCoinLogo.svg',
  termsUrl = '#',
}: WithdrawModalProps) {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('0.00')

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsClosing(false)
    } else if (isVisible) {
      setIsClosing(true)
      const t = setTimeout(() => setIsVisible(false), 220)
      return () => clearTimeout(t)
    }
  }, [open, isVisible])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(withdrawAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy withdraw address', err)
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[560px] max-h-[90vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Withdraw Crypto</h2>
              <div className="text-white/80 text-sm mt-1">
                {providerName} Balance: <span className="font-semibold">{balanceUsd}</span>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-4 md:py-6 overflow-auto space-y-6">
            {/* Chain */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Supported chain</Label>
                <div className="text-white/40 text-sm">$3 min.</div>
              </div>
              <div className="h-11 px-3 rounded-[10px] bg-white/6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={chainIconSrc} alt={chainName} className="w-5 h-5" />
                  <span className="text-[15px]">{chainName}</span>
                </div>
                <img src="/Chevron--sort.svg" alt="select" className="w-4 h-4 opacity-70" />
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Your withdraw address</Label>
                <a href={termsUrl} target="_blank" rel="noreferrer" className="text-white/60 text-sm inline-flex items-center gap-1">
                  Terms Apply
                  <img src="/Arrow--up-right.svg" alt="Open" className="w-4 h-4 opacity-70" />
                </a>
              </div>
              <div className="h-11 px-3 rounded-[10px] bg-white/6 flex items-center justify-between">
                <span className="truncate text-[15px]">{withdrawAddress}</span>
                <button onClick={handleCopy} className="ml-3 h-8 px-3 rounded-[8px] bg-white/10 text-sm">{copied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <Label>Amount to withdraw</Label>
              <div className="h-11 px-3 rounded-[10px] bg-white/6 flex items-center gap-2">
                <img src={tokenIconSrc} alt={tokenSymbol} className="w-5 h-5" />
                <input
                  className="w-full bg-transparent outline-none text-[15px]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Withdraw button */}
            <div className="w-full flex items-center justify-center">
              <button className="h-12 md:h-12 px-5 rounded-[10px] text-basic font-semibold bg-white/10 w-full btn-gradient-border max-w-[520px]">
                <div className="flex items-center justify-center gap-2">
                  <img src="/Upload.svg" alt="Withdraw" className="w-5 h-5" />
                  <span>Withdraw</span>
                </div>
              </button>
            </div>

            {/* Estimates */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between border-b border-[#212121] pb-2">
                <span>Est. price impact</span>
                <span className="text-white">0.10%</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#212121] pb-2">
                <span>Est. slippage</span>
                <span className="text-white">0.00%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Est. processing time</span>
                <span className="text-white">2 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Have questions?</span>
                <a href={termsUrl} target="_blank" rel="noreferrer" className="flex flex-row items-center gap-1">
                  <span className="text-white">Terms Apply</span>
                  <img src="/Arrow--up-right.svg" alt="Open" className="w-4 h-4 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


