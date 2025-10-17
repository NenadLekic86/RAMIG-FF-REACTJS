import React, { useEffect, useRef, useState } from 'react'

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
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false)
  const [selectedChain, setSelectedChain] = useState(chainName)
  const chainDropdownRef = useRef<HTMLDivElement | null>(null)
  const chainOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4']

  const sanitizeAmount = (value: string) => {
    let next = value.replace(/[^\d.]/g, '')
    const firstDot = next.indexOf('.')
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '')
    }
    if (next.startsWith('.')) {
      next = `0${next}`
    }
    return next
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(sanitizeAmount(e.target.value))
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab']
    if (allowedControlKeys.includes(e.key)) return
    if (e.key >= '0' && e.key <= '9') return
    if (e.key === '.') {
      const input = e.currentTarget
      const hasDot = input.value.includes('.')
      const selection = input.value.substring(input.selectionStart ?? 0, input.selectionEnd ?? 0)
      // Allow dot if none exists or selected text contains the existing dot
      if (!hasDot || selection.includes('.')) return
    }
    e.preventDefault()
  }

  const handleAmountPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const sanitized = sanitizeAmount(pasted)
    const target = e.currentTarget
    const start = target.selectionStart ?? target.value.length
    const end = target.selectionEnd ?? target.value.length
    const nextValue = sanitizeAmount(target.value.slice(0, start) + sanitized + target.value.slice(end))
    setAmount(nextValue)
  }

  const handleAmountBlur = () => {
    if (!amount || amount.trim() === '') {
      setAmount('0.00')
    }
  }

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

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(e.target as Node)) {
        setChainDropdownOpen(false)
      }
    }
    if (chainDropdownOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [chainDropdownOpen])

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
              <div ref={chainDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setChainDropdownOpen((v) => !v)}
                  className="h-11 w-full px-3 rounded-[10px] bg-white/6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img src={chainIconSrc} alt={selectedChain} className="w-5 h-5" />
                    <span className="text-[15px]">{selectedChain}</span>
                  </div>
                  <img src="/Chevron--sort.svg" alt="select" className="w-4 h-4 opacity-70" />
                </button>
                {chainDropdownOpen ? (
                  <div className="absolute z-10 mt-2 w-full rounded-[10px] border border-[#212121] bg-[#0F0F10] shadow-lg overflow-hidden">
                    <ul className="max-h-60 overflow-auto py-1">
                      {chainOptions.map((opt) => (
                        <li key={opt}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChain(opt)
                              setChainDropdownOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 text-[14px] hover:bg-white/10"
                          >
                            {opt}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
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
                  inputMode="decimal"
                  value={amount}
                  onKeyDown={handleAmountKeyDown}
                  onChange={handleAmountChange}
                  onPaste={handleAmountPaste}
                  onBlur={handleAmountBlur}
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


