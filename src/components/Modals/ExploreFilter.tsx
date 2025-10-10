import React, { useEffect, useState } from 'react'
import { useProviderFilters, type ProviderKey } from '../../store/filters'

type ExploreFilterProps = {
  open: boolean
  onClose: () => void
}

const CloseIcon = ({ className = 'opacity-70' }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const ExploreFilter: React.FC<ExploreFilterProps> = ({ open, onClose }) => {
  const [isVisible, setIsVisible] = useState(open)
  const [isClosing, setIsClosing] = useState(false)
  const providerFilters = useProviderFilters()
  const [tempSelectedProviders, setTempSelectedProviders] = useState<Set<ProviderKey>>(new Set())

  useEffect(() => {
    if (open) {
      setIsVisible(true)
      setIsClosing(false)
      // Initialize local working set from global store on open
      setTempSelectedProviders(new Set(providerFilters.selectedProviders))
    } else if (isVisible) {
      setIsClosing(true)
      const t = setTimeout(() => setIsVisible(false), 220) // match backdrop duration
      return () => clearTimeout(t)
    }
  }, [open, isVisible])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}>
      {/* Backdrop */}
      {/* <div className="absolute inset-0" onClick={onClose} /> */}

      {/* Modal container */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={`w-full max-w-[512px] max-h-[85vh] rounded-2xl bg-[#0F0F10] border border-[#212121] flex flex-col  corner-shadow-tl ${isClosing ? 'animate-modal-umbrella-close' : 'animate-modal-umbrella'}`}>        
          {/* Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between border-b border-[#212121]">
            <h2 className="text-xl md:text-2xl font-semibold">Filters</h2>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center">
              <span className="sr-only">Close</span>
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 md:px-6 py-4 md:py-6 overflow-auto space-y-7">
            <div className="space-y-3">
              <p className="text-sm text-white/60">Providers</p>
              <div className="flex flex-wrap gap-2">
                {(['kalshi','manifold','zeitgeist','polymarket','limitless','predictit'] as ProviderKey[]).map(key => {
                  const selected = tempSelectedProviders.has(key)
                  const label = key.charAt(0).toUpperCase() + key.slice(1)
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setTempSelectedProviders(prev => {
                          const next = new Set(prev)
                          if (selected) next.delete(key)
                          else next.add(key)
                          return next
                        })
                      }}
                      className={`px-3 h-8 inline-flex items-center rounded-full text-xs ${selected ? 'bg-white/[0.06]' : 'bg-customGray17 text-white/70'}`}
                    >
                      {label}
                      {selected && <CloseIcon className="ml-2 rounded-full bg-white/[0.06] w-4 h-4 p-[2px]" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-white/60">Option #2</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">One More Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Another Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-white/60">Option #3</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 h-8 inline-flex items-center rounded-full  text-xs">Yes</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-white/[0.06] text-xs text-white/70">No <CloseIcon className="ml-2 rounded-full bg-white/[0.06] w-4 h-4 p-[2px] opacity-70" /></span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-white/60">Option #4</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-white/[0.06] text-xs">Selected Filter <CloseIcon className="ml-2 rounded-full bg-white/[0.06] w-4 h-4 p-[2px]" /></span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-white/[0.06] text-xs">Selected Filter <CloseIcon className="ml-2 rounded-full bg-white/[0.06] w-4 h-4 p-[2px]" /></span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-customGray17 text-xs text-white/70">Unselected Option</span>
                <span className="px-3 h-8 inline-flex items-center rounded-full bg-white/[0.06] text-xs">Selected Filter <CloseIcon className="ml-2 rounded-full bg-white/[0.06] w-4 h-4 p-[2px]" /></span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 md:px-6 py-4 md:py-5 border-t border-[#212121] flex items-center gap-3">
            <button onClick={() => { setTempSelectedProviders(new Set()); }} className="h-11 md:h-12 px-4 md:px-5 rounded-[10px] bg-white/10 text-basic font-semibold w-1/2">Clear All</button>
            <button
              onClick={() => { providerFilters.setProviders(tempSelectedProviders); onClose(); }}
              className="h-11 md:h-12 px-5 rounded-[10px] text-basic font-semibold bg-white/10 w-1/2 btn-gradient-border"
              style={{ backgroundImage: 'linear-gradient(#272728, #272728), linear-gradient(45deg, #12B76A 0%, #0BA5EC 25%, #7A5AF8 50%, #EE46BC 75%, #F79009 100%)' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreFilter
