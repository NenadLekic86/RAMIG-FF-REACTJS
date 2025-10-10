import React, { useEffect, useState } from 'react'

type RestoreAccountModalProps = {
  open: boolean
  onClose: () => void
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({ open, onClose }) => {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const [backupPhrase, setBackupPhrase] = useState('')

  const DEMO_PHRASE = 'Apple Tiger Drift Lunar Garden Rocket Silent Velvet Pancake Island Coral Voice'
  const isPhraseValid = backupPhrase.trim() === DEMO_PHRASE

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

  if (!isVisible) return null

  const getBgClassForIcon = (iconPath: string) => {
    switch (iconPath) {
      case '/K-Kalshi.svg':
        return 'bg-[#179F61]'
      case '/Manifold.svg':
        return 'bg-[#4337C4]'
      case '/Limitless.svg':
        return 'bg-[#DCF58D]'
      case '/Predictit.svg':
        return 'bg-[#07A0BA]'
      case '/Polymarket.svg':
        return 'bg-[#1751F0]'
      case '/Zeitgeist.svg':
        return 'bg-[#FFFFFF]'
      default:
        return 'bg-white/10'
    }
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[512px] max-h-[85vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <div>
              <h2 className="text-xl md:text-3xl font-semibold">Restore Existing Account</h2>
              <p className="text-white/50 text-sm md:text-lg mt-1">Restore access to your account with your backup phrase.</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-4 md:py-6 overflow-auto space-y-6">
            <div>
              <label className="block text-white/80 text-base md:text-lg mb-3">Enter your backup phrase</label>
              <textarea
                className="w-full min-h-[77px] px-4 md:px-5 py-3 rounded-xl bg-[#1B1B1C] border border-[#212121] placeholder:text-white/30 text-white outline-none resize-none break-normal"
                placeholder="Start typing here..."
                value={backupPhrase}
                onChange={(e) => setBackupPhrase(e.target.value)}
              />
            </div>

            {isPhraseValid && (
              <div>
                <p className="text-sm text-white/60 mb-3">Connected exchanges</p>
                <div className="rounded-xl overflow-hidden divide-y divide-[#212121]">
                  {[
                    { icon: '/Manifold.svg', name: 'Manifold', url: 'https://manifold.xyz' },
                    { icon: '/Limitless.svg', name: 'Limitless', url: 'https://limitless.exchange' },
                    { icon: '/Zeitgeist.svg', name: 'Zeitgeist', url: 'https://zeitgeist.pm' },
                    { icon: '/Polymarket.svg', name: 'Polymarket', url: 'https://polymarket.com' },
                    { icon: '/K-Kalshi.svg', name: 'Kalshi', url: 'https://kalshi.com' },
                  ].map((ex) => (
                    <a key={ex.name} href={ex.url} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-3 bg-[#101011] hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center ${getBgClassForIcon(ex.icon)}`}>
                          <img src={ex.icon} alt={ex.name} className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{ex.name}</span>
                      </div>
                      <span className="text-white/40 text-sm">{ex.url} ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#212121]">
            <button
              onClick={onClose}
              disabled={!isPhraseValid}
              className={`h-12 md:h-14 px-5 rounded-[12px] text-lg font-semibold w-full btn-gradient-border ${!isPhraseValid ? 'opacity-60 cursor-not-allowed' : 'bg-white/10'}`}
              style={{ backgroundImage: 'linear-gradient(#272728, #272728), linear-gradient(45deg, #12B76A 0%, #0BA5EC 25%, #7A5AF8 50%, #EE46BC 75%, #F79009 100%)' }}
            >
              Restore Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestoreAccountModal


