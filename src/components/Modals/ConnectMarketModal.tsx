import React, { useEffect, useMemo, useState } from 'react'

type ProviderId = 'manifold' | 'polymarket' | 'limitless' | 'kalshi' | 'predictit' | 'zeitgeist'

export type ConnectMarketModalProvider = {
  id: ProviderId
  name: string
  url: string
  address?: string
  apiKey?: string
}

type ConnectMarketModalProps = {
  open: boolean
  onClose: () => void
  provider?: ConnectMarketModalProvider | null
  onActionClick?: (providerId: ProviderId, stepId: string) => void
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const ExternalLink = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-[14px] text-white/70 hover:text-white/90 inline-flex items-center gap-1">
    {href}
    <img src="/Arrow--up-right.svg" alt="Open" className="w-4 h-4 opacity-70" />
  </a>
)

type Step = {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  ctaLabel?: string
}

function StepRow({ step, onClick }: { step: Step; onClick?: () => void }) {
  const isCompleted = step.status === 'completed'
  return (
    <div className="w-full py-4 flex items-center justify-between">
      <div className="min-w-0 pr-4">
        <div className="text-[18px] leading-6 font-semibold">{step.title}</div>
        {step.description ? (
          <div className="text-white/40 text-[14px] mt-1 leading-5">{step.description}</div>
        ) : null}
      </div>
      {isCompleted ? (
        <div className="inline-flex items-center gap-2 text-white/70">
          <img src="/Checkmark.svg" alt="Completed" className="w-5 h-5" />
          <span className="text-[16px] font-semibold">Completed</span>
        </div>
      ) : (
        <button onClick={onClick} className="h-10 md:h-11 px-5 rounded-[10px] text-basic font-semibold bg-white/10 btn-gradient-border">
          {step.ctaLabel ?? 'Continue'}
        </button>
      )}
    </div>
  )
}

const Divider = () => <div className="h-px w-full bg-[#212121]" />

const buildStepsForProvider = (provider?: ConnectMarketModalProvider | null): Step[] => {
  if (!provider) return []
  const hasAddress = !!(provider.address && provider.address.trim())
  const hasApiKey = !!(provider.apiKey && provider.apiKey.trim())

  const baseSteps: Step[] = [
    {
      id: 'deploy-proxy',
      title: 'Deploy Proxy Wallet',
      description: `Deploy your proxy wallet to trade on ${provider.name}.`,
      status: 'completed',
    },
    {
      id: 'enable-trading',
      title: 'Enable Trading',
      description: 'You need to sign this each time you trade on a new browser.',
      status: 'pending',
      ctaLabel: 'Sign',
    },
    {
      id: 'approve-tokens',
      title: 'Approve Tokens',
      description: 'Start trading securely with your USDC.',
      status: 'pending',
      ctaLabel: 'Sign',
    },
  ]

  switch (provider.id) {
    case 'manifold': {
      const pre: Step = {
        id: 'provide-api-key',
        title: 'Provide API Key',
        description: 'Paste your Manifold API key to enable account actions.',
        status: hasApiKey ? 'completed' : 'pending',
        ctaLabel: 'Add Key',
      }
      return [pre, ...baseSteps]
    }
    case 'limitless': {
      const pre: Step = {
        id: 'connect-wallet',
        title: 'Connect Wallet',
        description: 'Link your wallet address to Limitless.',
        status: hasAddress ? 'completed' : 'pending',
        ctaLabel: 'Connect',
      }
      return [pre, ...baseSteps]
    }
    case 'polymarket':
    case 'kalshi':
    case 'predictit':
    case 'zeitgeist':
      return baseSteps
    default:
      return baseSteps
  }
}

const ConnectMarketModal: React.FC<ConnectMarketModalProps> = ({ open, onClose, provider, onActionClick }) => {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)

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

  const steps = useMemo(() => buildStepsForProvider(provider), [provider])

  if (!isVisible) return null

  const title = provider ? `Connect ${provider.name}` : 'Connect Market'

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[560px] max-h-[85vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
              {provider?.url ? (
                <div className="mt-1">
                  <ExternalLink href={provider.url} />
                </div>
              ) : null}
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-2 md:py-3 overflow-auto">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                {idx > 0 && <Divider />}
                <StepRow step={s} onClick={() => onActionClick?.(provider!.id, s.id)} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectMarketModal


