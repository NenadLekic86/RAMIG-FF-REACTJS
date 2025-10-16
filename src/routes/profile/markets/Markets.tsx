import { useState } from 'react';

type ProviderId = 'manifold' | 'polymarket' | 'limitless' | 'kalshi' | 'predictit' | 'zeitgeist';

type Provider = {
  id: ProviderId;
  name: string;
  logo: string; // public asset path
  url: string;
  mode: 'on' | 'off';
  address?: string;
  apiKey?: string;
  balanceUsd?: string; // for display only, e.g. "$12,557.55"
  state: 'disconnected' | 'connecting' | 'connected';
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-underline-gradient' : 'bg-neutral-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-[14px] text-white/44 hover:text-white/80 inline-flex items-center gap-1">
      {href}
      <img src="/Arrow--up-right.svg" alt="Open" className="w-4 h-4 opacity-70" />
    </a>
  );
}

function LabeledInput({
  icon,
  label,
  placeholder,
  value,
  onChange,
  readOnly = false,
}: {
  icon?: string | null;
  label?: string | null;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="w-full flex items-center gap-2 rounded-md bg-white/6 px-3 py-3">
      {label ? (
        <span className="text-[10px] uppercase tracking-wide bg-neutral-800 text-neutral-300 px-2 py-1 rounded">{label}</span>
      ) : icon ? (
        <img src={icon} alt="icon" className="w-4 h-4 opacity-80" />
      ) : null}
      <input
        className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
      />
    </div>
  );
}

function ConnectButton({ state, onClick }: { state: Provider['state']; onClick?: () => void }) {
  const label = state === 'connecting' ? 'Connecting' : state === 'connected' ? 'Connected' : 'Connect';
  return (
    <button onClick={onClick} className={`w-full h-12 rounded-[10px] btn-gradient-border flex items-center justify-center gap-2`}> 
      {state === 'connecting' && <img src="/3rd-party-connected.svg" alt="progress" className="w-4 h-4 animate-spin" />}
      {label === 'Connect' && <img src="/Unlink.svg" alt="Connect" className="w-4 h-4 opacity-80" />}
      <span className="font-button">{label}</span>
    </button>
  );
}

function WithdrawButton() {
  return (
    <button className="w-full h-11 px-4 rounded-lg btn-gradient-border bg-[#272728] flex items-center justify-center gap-2">
      <img src="/Upload.svg" alt="Withdraw" className="w-5 h-5" />
      <span className="font-button">Withdraw</span>
    </button>
  );
}

function ProviderCard({ p, onUpdate }: { p: Provider; onUpdate: (x: Partial<Provider>) => void }) {
  // Provider colored icon background (48x48)
  const providerBg: Record<ProviderId, string> = {
    manifold: '#4337C4',
    polymarket: '#1751F0',
    limitless: '#DCF58D',
    kalshi: '#179F61',
    predictit: '#07A0BA',
    zeitgeist: '#FFFFFF',
  };
  const logoWrapStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 8,
    background: providerBg[p.id],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Determine if required inputs are satisfied for Connect button visibility
  const hasRequired = (
    (p.id === 'manifold' && !!(p.apiKey && p.apiKey.trim())) ||
    (p.id === 'polymarket' && !!(p.address && p.address.trim())) ||
    (p.id === 'limitless' && !!(p.address && p.address.trim())) ||
    p.id === 'kalshi' ||
    p.id === 'predictit' ||
    p.id === 'zeitgeist'
  );

  return (
    <div className="rounded-[12px] border border-customGray44 bg-customGray17 p-4 flex flex-col justify-between gap-4 min-h-[200px] overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={logoWrapStyle}>
            <img src={p.logo} alt={p.name} className="w-8 h-8" />
          </div>
          <div>
            <div className="text-base font-heading">{p.name}</div>
            <ExternalLink href={p.url} />
          </div>
        </div>
        <Toggle checked={p.mode === 'on'} onChange={(v) => onUpdate({ mode: v ? 'on' : 'off' })} />
      </div>

      {/* Inputs area varies by provider */}
      {p.id === 'manifold' && (
        <LabeledInput label="API" placeholder="Enter API key..." value={p.apiKey ?? ''} onChange={(v) => onUpdate({ apiKey: v })} />
      )}

      {p.id === 'polymarket' && (
        <LabeledInput icon="/Wallet.svg" placeholder="0x9f3a2b4c6d7e8f90123456789abcd..." value={p.address ?? ''} onChange={(v) => onUpdate({ address: v })} />
      )}

      {p.id === 'limitless' && (
        <>
          <LabeledInput icon="/Wallet.svg" placeholder="0x9f3a2b4c6d7e8f90123456789abcd..." value={p.address ?? ''} onChange={(v) => onUpdate({ address: v })} />
          {p.mode === 'on' && (
            <div className="w-full flex items-stretch gap-2">
              <div className="basis-1/2 min-w-0">
                <LabeledInput icon="/Wallet.svg" value={p.balanceUsd ?? '$12,557.55'} onChange={() => {}} readOnly />
              </div>
              <div className="basis-1/2 min-w-0">
                <WithdrawButton />
              </div>
            </div>
          )}
        </>
      )}

      {(p.id === 'kalshi' || p.id === 'predictit' || p.id === 'zeitgeist') && (
        <div className="pt-1" />
      )}

      {/* Action button (only show when prerequisites provided AND not already connected) */}
      {hasRequired && p.state !== 'connected' && <ConnectButton state={p.state} />}
    </div>
  );
}

export default function Markets() {
  const [providers, setProviders] = useState<Provider[]>([
    { id: 'manifold',   name: 'Manifold',   logo: '/Manifold.svg',   url: 'https://manifold.xyz',      mode: 'off', state: 'disconnected', apiKey: '' },
    { id: 'polymarket', name: 'Polymarket', logo: '/Polymarket.svg', url: 'https://polymarket.com',    mode: 'off', state: 'disconnected', address: '' },
    { id: 'limitless',  name: 'Limitless',  logo: '/Limitless.svg',  url: 'https://limitless.exchange',mode: 'on',  state: 'connected',   address: '0x9f3a2b4c6d7e8f9...', balanceUsd: '$12,557.55' },
    { id: 'kalshi',     name: 'Kalshi',     logo: '/K-Kalshi.svg',   url: 'https://kalshi.com',        mode: 'off', state: 'connecting' },
    { id: 'predictit',  name: 'Predictit',  logo: '/Predictit.svg',  url: 'https://www.predictit.org', mode: 'off', state: 'disconnected' },
    { id: 'zeitgeist',  name: 'Zeitgeist',  logo: '/Zeitgeist.svg',  url: 'https://zeitgeist.pm',      mode: 'off', state: 'disconnected' },
  ]);

  const updateProvider = (id: ProviderId, patch: Partial<Provider>) => {
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 min-h-[200px]">
      {providers.map(p => (
        <ProviderCard key={p.id} p={p} onUpdate={(x) => updateProvider(p.id, x)} />
      ))}
    </div>
  );
}


