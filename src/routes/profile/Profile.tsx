import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useRef, useState, useEffect } from 'react';
import TabUnderline from '../../components/Tabs/TabUnderline';
import DepositModal from '../../components/Modals/DepositModal';
import WithdrawModal from '../../components/Modals/WithdrawModal';

export default function Profile() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeKeyFromPath = useMemo(() => {
    const p = location.pathname.replace(/\/$/, '');
    if (p.endsWith('/profile') || p.endsWith('/profile/')) return 'my-profile';
    if (p.includes('/profile/markets')) return 'markets';
    if (p.includes('/profile/accounts')) return 'accounts';
    if (p.includes('/profile/points')) return 'points';
    return 'my-profile';
  }, [location.pathname]);
  const [activeKey, setActiveKey] = useState(activeKeyFromPath);
  useEffect(() => setActiveKey(activeKeyFromPath), [activeKeyFromPath]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="avatar-gradient p-1 rounded-full">
            <img src="/main-avatar.png" alt="Profile" className="w-16 h-16 rounded-full block" />
          </div>
          <div>
            <div className="text-2xl font-heading">John Doe</div>
            <div className="text-sm text-zinc-400">Joined September, 2025</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsWithdrawOpen(true)} className="h-11 px-4 rounded-lg border border-customBorder bg-[#171717] flex items-center gap-2">
            <img src="/Upload.svg" alt="Withdraw" className="w-5 h-5" />
            <span className="font-button">Withdraw</span>
          </button>
          <button onClick={() => setIsDepositOpen(true)} className="h-11 px-4 rounded-lg btn-gradient-border bg-[#272728] flex items-center gap-2">
            <img src="/Download.svg" alt="Deposit" className="w-5 h-5" />
            <span className="font-button">Deposit</span>
          </button>
        </div>
      </div>

      {/* Stats row (static for now) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-lg font-heading">$240.00 <span className="text-red-700 text-sm align-middle">-1.45%</span></div>
          <div className="text-sm text-zinc-400 mt-1">Positions Value</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-lg font-heading">$1,828.33 <span className="text-green-700 text-sm align-middle">+115.82%</span></div>
          <div className="text-sm text-zinc-400 mt-1">All Time P&L</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-lg font-heading">$2,068.33 <span className="text-green-700 text-sm align-middle">+137.82%</span></div>
          <div className="text-sm text-zinc-400 mt-1">Total Portfolio Balance</div>
        </div>
        <div className="rounded-md border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-lg font-heading">$5,533.38</div>
          <div className="text-sm text-zinc-400 mt-1">Volume Traded</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-with-indicator" ref={containerRef}>
        <div className="flex items-center gap-6">
          <NavLink to="." end data-tab-key="my-profile" className={({ isActive }) => `px-3 py-3 filter-tab ${isActive ? 'active' : ''}`}>My Profile</NavLink>
          <NavLink to="markets" data-tab-key="markets" className={({ isActive }) => `px-3 py-3 filter-tab ${isActive ? 'active' : ''}`}>Manage Markets</NavLink>
          <NavLink to="accounts" data-tab-key="accounts" className={({ isActive }) => `px-3 py-3 filter-tab ${isActive ? 'active' : ''}`}>Account</NavLink>
          <NavLink to="points" data-tab-key="points" className={({ isActive }) => `px-3 py-3 filter-tab ${isActive ? 'active' : ''}`}>Points</NavLink>
        </div>
        <TabUnderline containerRef={containerRef} activeKey={activeKey} bottom={-1} height={2} />
      </div>

      {/* Animated tab content wrapper: replays on route change */}
      <div key={location.pathname} className="animate-rsb-in panel-transition">
        <Outlet />
      </div>
      <DepositModal open={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal open={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
    </div>
  );
}