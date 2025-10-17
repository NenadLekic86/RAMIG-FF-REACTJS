import { useState } from 'react';
type ProviderId = 'manifold' | 'limitless' | 'zeitgeist' | 'polymarket' | 'kalshi' | 'predictit';
import DepositModal from '../../../components/Modals/DepositModal';
import WithdrawModal from '../../../components/Modals/WithdrawModal';

type Provider = {
    id: ProviderId;
    name: string;
    url: string;
    logo: string; // public asset path
    bgHex: string; // square icon background
    balanceUsd: string;
};

function ExternalLink({ href }: { href: string }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className="text-[14px] text-white/44 hover:text-white/80 inline-flex items-center gap-1">
            {href}
            <img src="/Arrow--up-right.svg" alt="Open" className="w-4 h-4 opacity-70" />
        </a>
    );
}

function WithdrawButton({ onClick }: { onClick?: () => void }) {
    return (
        <button onClick={onClick} className="h-12 px-4 rounded-[10px] bg-[#272728] flex items-center justify-center gap-2 whitespace-nowrap">
            <img src="/Upload.svg" alt="Withdraw" className="w-5 h-5" />
            <span className="font-button">Withdraw</span>
        </button>
    );
}

function DepositButton({ onClick }: { onClick?: () => void }) {
    return (
        <button onClick={onClick} className="h-12 px-4 rounded-[10px] btn-gradient-border bg-[#272728] flex items-center justify-center gap-2 whitespace-nowrap">
            <img src="/Download.svg" alt="Deposit" className="w-5 h-5" />
            <span className="font-button">Deposit</span>
        </button>
    );
}

function ProviderRow({ p, onDeposit, onWithdraw }: { p: Provider; onDeposit: (p: Provider) => void; onWithdraw: (p: Provider) => void }) {
    return (
        <div className="rounded-[12px] border border-customGray44 bg-customGray17 px-4 py-4 grid items-center grid-cols-[auto_1fr_auto] gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-12 h-12 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: p.bgHex }}
                >
                    <img src={p.logo} alt={p.name} className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                    <div className="text-base font-heading truncate">{p.name}</div>
                    <ExternalLink href={p.url} />
                </div>
            </div>

            <div className="text-center">
                <div className="text-[24px] leading-none font-semibold">{p.balanceUsd}</div>
                <div className="text-xs text-white/44 mt-1">Available Balance</div>
            </div>

            <div className="flex items-center justify-end gap-2">
                <WithdrawButton onClick={() => onWithdraw(p)} />
                <DepositButton onClick={() => onDeposit(p)} />
            </div>
        </div>
    );
}

export default function Accounts() {
    const providers: Provider[] = [
        { id: 'manifold',   name: 'Manifold',   url: 'https://manifold.xyz',       logo: '/Manifold.svg',  bgHex: '#4337C4', balanceUsd: '$568.33' },
        { id: 'limitless',  name: 'Limitless',  url: 'https://limitless.exchange', logo: '/Limitless.svg', bgHex: '#DCF58D', balanceUsd: '$568.33' },
        { id: 'zeitgeist',  name: 'Zeitgeist',  url: 'https://zeitgeist.pm',       logo: '/Zeitgeist.svg', bgHex: '#FFFFFF', balanceUsd: '$568.33' },
        { id: 'polymarket', name: 'Polymarket', url: 'https://polymarket.com',     logo: '/Polymarket.svg',bgHex: '#1751F0', balanceUsd: '$568.33' },
        { id: 'kalshi',     name: 'Kalshi',     url: 'https://kalshi.com',         logo: '/K-Kalshi.svg',  bgHex: '#179F61', balanceUsd: '$568.33' },
        { id: 'predictit',  name: 'Predictit',  url: 'https://www.predictit.org',  logo: '/Predictit.svg', bgHex: '#07A0BA', balanceUsd: '$568.33' },
    ];

    const [depositOpen, setDepositOpen] = useState(false);
    const [selected, setSelected] = useState<Provider | null>(null);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    const onDeposit = (p: Provider) => {
        setSelected(p);
        setDepositOpen(true);
    };

    const onWithdraw = (p: Provider) => {
        setSelected(p);
        setWithdrawOpen(true);
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                {providers.map(p => (
                    <ProviderRow key={p.id} p={p} onDeposit={onDeposit} onWithdraw={onWithdraw} />
                ))}
            </div>
            <DepositModal
                open={depositOpen}
                onClose={() => setDepositOpen(false)}
                providerName={selected?.name}
                balanceUsd={selected?.balanceUsd}
                tokenSymbol="USDC"
                chainName="Polygon"
                depositAddress="0x61b3706511418DdA92A59A34f0E0A1C4ADDD70A8"
                tokenIconSrc="/USDCCoinLogo.svg"
                chainIconSrc="/PolygonCoinLogo.svg"
            />
            <WithdrawModal
                open={withdrawOpen}
                onClose={() => setWithdrawOpen(false)}
                providerName={selected?.name}
                balanceUsd={selected?.balanceUsd}
                chainName="Polygon"
                withdrawAddress="0x61b3706511418DdA92A59A34f0E0A1C4ADDD70A8"
                tokenSymbol="USDC"
                tokenIconSrc="/USDCCoinLogo.svg"
                chainIconSrc="/PolygonCoinLogo.svg"
            />
        </>
    );
}