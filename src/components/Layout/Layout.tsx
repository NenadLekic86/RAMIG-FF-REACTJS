import { Outlet } from 'react-router-dom';
import { LeftNav } from './LeftNav.tsx';
import { TopNav } from './TopNav.tsx';
import { RightSidebar } from './RightSidebar.tsx';
import WatchlistSidebar from '../Watchlist/WatchlistSidebar.tsx';
import { useUIStore } from '../../store/ui';
import ToastHost from './ToastHost';

export function Layout() {
  const { isRightSidebarOpen, isRightSidebarClosing, closeRightSidebar, isWatchlistOpen } = useUIStore();
  return (
    <div className="relative h-dvh">
      {/* Left Navigation - Fixed position, full height */}
      <aside className="fixed left-0 top-0 z-30 h-dvh w-[80px] border-r border-customBorder hidden lg:block">
        <LeftNav />
      </aside>

      {/* Top Navigation - Fixed position, starts after left nav, full width */}
      <div className="fixed top-0 z-20 border-b border-customBorder lg:left-[80px] w-full lg:w-[calc(100vw-80px)]">
        <TopNav />
      </div>

      {/* Main Content Area - Accounts for fixed elements */}
      <main className={`h-dvh overflow-hidden flex flex-col pt-[57px] lg:ml-[80px]`}>
        {/* Scrollable content area only */}
        <div className={`flex-1 overflow-y-auto p-4 ${isWatchlistOpen ? 'lg:ml-[320px]' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* Watchlist Sidebar (left of trading right sidebar) */}
      {isWatchlistOpen && (
        <WatchlistSidebar />
      )}

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
        <>
          <div
            className={`fixed inset-0 z-30 bg-black/40 ${isRightSidebarClosing ? 'animate-backdrop-out' : 'animate-backdrop-fade'}`}
            onClick={closeRightSidebar}
          />
          <RightSidebar />
        </>
      )}
      <ToastHost />
    </div>
  );
}