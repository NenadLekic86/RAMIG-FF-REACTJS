import React, { useEffect, useState } from 'react'

type SignUpModalProps = {
  open: boolean
  onClose: () => void
  onOpenRestore?: () => void
  onOpenGenerate?: () => void
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const SignUpModal: React.FC<SignUpModalProps> = ({ open, onClose, onOpenRestore, onOpenGenerate }) => {
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

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[512px] max-h-[85vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold">Signup to Converge!</h2>
              <p className="text-white/50 text-sm mt-1">Subtitle goes here.</p>
            </div>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-4 md:py-6 overflow-auto space-y-4">
            {/* Generate Account button (gradient border full width) */}
            <button
              onClick={onOpenGenerate ?? onClose}
              className="h-11 md:h-12 px-5 rounded-[10px] text-basic font-semibold bg-white/10 w-full btn-gradient-border"
              style={{ backgroundImage: 'linear-gradient(#272728, #272728), linear-gradient(45deg, #12B76A 0%, #0BA5EC 25%, #7A5AF8 50%, #EE46BC 75%, #F79009 100%)' }}
            >
              Generate Account
            </button>

            {/* OR divider */}
            <div className="flex items-center">
              <div className="h-px bg-[#212121] flex-1" />
              <span className="mx-2 text-white/60 text-sm">or</span>
              <div className="h-px bg-[#212121] flex-1" />
            </div>

            {/* Google sign-in button (plain full width with icon) */}
            <button onClick={onClose} className="h-11 md:h-12 px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-full flex items-center justify-center gap-3">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              <span>Sign in With Google</span>
            </button>

            {/* Bottom two half-width buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={onClose} className="h-11 md:h-12 px-4 md:px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-1/2 flex items-center justify-center gap-3">
                <img src="/Wallet.svg" alt="Wallet" className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
              <button onClick={onOpenRestore ?? onClose} className="h-11 md:h-12 px-4 md:px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-1/2 flex items-center justify-center gap-3">
                <img src="/Data-backup.svg" alt="Backup" className="w-5 h-5" />
                <span>Load Backup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpModal


