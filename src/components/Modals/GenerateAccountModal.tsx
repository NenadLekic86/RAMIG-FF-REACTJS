import React, { useEffect, useMemo, useState } from 'react'

type GenerateAccountModalProps = {
  open: boolean
  onClose: () => void
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

function generateRandomAccountId(): string {
  // Cheap readable pseudo account id for demo purposes
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

const GenerateAccountModal: React.FC<GenerateAccountModalProps> = ({ open, onClose }) => {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const [backupPhrase, setBackupPhrase] = useState('')
  const [showBackup, setShowBackup] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const accountId = useMemo(() => generateRandomAccountId(), [open])

  const words = backupPhrase
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backupPhrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[512px] max-h-[85vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <div>
              <h2 className="text-xl md:text-3xl font-semibold">Account Generation</h2>
              <p className="text-white/50 text-sm md:text-lg mt-1">Accounts are stored clientside, backup!</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-4 md:py-6 overflow-auto space-y-6">
            <div>
              <label className="block text-white/80 text-base md:text-lg mb-3">Generated account</label>
              <input
                className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl bg-[#1B1B1C] border border-[#212121] text-white outline-none select-all"
                type="text"
                value={accountId}
                readOnly
              />
            </div>

            <div>
              <label className="block text-white/80 text-base md:text-lg mb-3">Public profile name</label>
              <input
                className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl bg-[#1B1B1C] border border-[#212121] placeholder:text-white/30 text-white outline-none"
                type="text"
                placeholder="Start typing here..."
              />
            </div>

            <div>
              <label className="block text-white/80 text-base md:text-lg mb-3">Enter your backup phrase</label>
              <textarea
                className="w-full min-h-[77px] px-4 md:px-5 py-3 rounded-xl bg-[#1B1B1C] border border-[#212121] placeholder:text-white/30 text-white outline-none resize-none break-normal"
                placeholder="Start typing here..."
                value={backupPhrase}
                onChange={(e) => setBackupPhrase(e.target.value)}
              />
            </div>

            {showBackup && (
              <>
                <div className="h-px bg-[#212121] my-4" />
                <div className="rounded-[12px] p-[1px] btn-gradient-border" style={{ backgroundImage: 'linear-gradient(#0F0F10, #0F0F10), linear-gradient(45deg, #12B76A 0%, #0BA5EC 25%, #7A5AF8 50%, #EE46BC 75%, #F79009 100%)' }}>
                  <div className="rounded-[11px] bg-white/[0.06]">
                  <div className="flex items-center justify-between px-4 py-4">
                    <button onClick={() => setShowBackup(false)} className="text-white font-semibold">Hide Backup</button>
                    <button onClick={handleCopy} className="flex items-center gap-2 text-white/70 hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9.5C9 8.39543 9.89543 7.5 11 7.5H17C18.1046 7.5 19 8.39543 19 9.5V15.5C19 16.6046 18.1046 17.5 17 17.5H11C9.89543 17.5 9 16.6046 9 15.5V9.5Z" stroke="currentColor" strokeWidth="1.6"/><path d="M7 15.5H6C4.89543 15.5 4 14.6046 4 13.5V7.5C4 6.39543 4.89543 5.5 6 5.5H12C13.1046 5.5 14 6.39543 14 7.5V8.5" stroke="currentColor" strokeWidth="1.6"/></svg>
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="border-t border-[#212121] px-3 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {words.map((w, idx) => (
                        <span key={idx} className="px-3 h-9 inline-flex items-center rounded-full bg-transparent border border-white/[0.12] text-sm">
                          <span className="mr-2 text-white/50">{idx + 1}</span>
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!showBackup && (
            <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#212121] flex items-center gap-3">
              <button
                onClick={() => setShowBackup(true)}
                disabled={words.length === 0}
                className={`h-12 px-5 rounded-[12px] text-lg font-semibold w-full btn-gradient-border ${words.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ backgroundImage: 'linear-gradient(#272728, #272728), linear-gradient(45deg, #12B76A 0%, #0BA5EC 25%, #7A5AF8 50%, #EE46BC 75%, #F79009 100%)' }}
              >
                Reveal Backup
              </button>
            </div>
          )}

          {/* Bottom buttons */}
          <div className="px-5 md:px-6 pb-6 -mt-2 flex items-center gap-3">
            <button onClick={onClose} className="h-11 md:h-12 px-4 md:px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-1/2">
              Connect Exchange
            </button>
            <button onClick={onClose} className="h-11 md:h-12 px-4 md:px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-1/2">
              Visit Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateAccountModal


