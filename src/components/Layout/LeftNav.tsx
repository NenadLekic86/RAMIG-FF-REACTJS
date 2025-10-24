import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/ui';
import { demoCards } from '../../models/card';

function SidebarIcon({ src, alt, to, active = false, onClick }: { src: string; alt: string; to?: string; active?: boolean; onClick?: () => void }) {
    const wrapper = "group flex items-center justify-center w-12 h-12 rounded-[12px] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.08)]";
    const img = (
        <img
            src={src}
            alt={alt}
            className={active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
            width={24}
            height={24}
        />
    );
    if (to) return <NavLink to={to} onClick={onClick} className={wrapper}>{img}</NavLink>;
    if (onClick) return <button onClick={onClick} className={wrapper}>{img}</button>;
    return <div className={wrapper}>{img}</div>;
}

export function LeftNav() {
    const isWatchlistOpen = useUIStore(s => s.isWatchlistOpen);
    const openWatchlist = useUIStore(s => s.openWatchlist);
    const closeWatchlist = useUIStore(s => s.closeWatchlist);
    const isTerminalOpen = useUIStore(s => s.isTerminalOpen);
    const openTerminal = useUIStore(s => s.openTerminal);
    const closeTerminal = useUIStore(s => s.closeTerminal);
    const closeRightSidebar = useUIStore(s => s.closeRightSidebar);
    const chartsActive = isTerminalOpen;
    const bookmarksActive = isWatchlistOpen;
    const exploreActive = !chartsActive && !bookmarksActive;
    // toggleWatchlist not used anymore – handled by handleBookmarksClick
    const handleExploreClick = () => {
        // Close overlays/sidebars to show plain Explore
        if (isTerminalOpen) closeTerminal();
        if (isWatchlistOpen) closeWatchlist();
        closeRightSidebar();
    };
    const handleChartsClick = () => {
        // Close any other overlays immediately (e.g., RightSidebar)
        closeRightSidebar();
        // Ensure Watchlist is open
        if (!isWatchlistOpen) openWatchlist();
        // Ensure Terminal is open (don't toggle off if already open)
        if (!isTerminalOpen) {
            const first = demoCards[0];
            if (first) {
                openTerminal(first);
            }
        }
    };
    const handleBookmarksClick = () => {
        if (isWatchlistOpen) {
            closeWatchlist();
            return;
        }
        if (isTerminalOpen) closeTerminal();
        openWatchlist();
    };
    return (
        <div className="flex flex-col items-center justify-between h-dvh py-4">
            <div className="flex flex-col items-center gap-2 w-full">
                <div className="h-12 flex items-center justify-center mb-10">
                    <a href="/">
                        <img src="/convergewhite.svg" alt="Converge" width={48} height={48} />
                    </a>
                </div>
                <nav className="mt-2 flex flex-col items-center w-full gap-4">
                    <SidebarIcon src="/Search--locate.svg" alt="Explore" to="/" onClick={handleExploreClick} active={exploreActive} />
                    <SidebarIcon src="/Chart--candlestick.svg" alt="Charts" onClick={handleChartsClick} active={chartsActive} />
                    <div className="w-8 h-px my-2 bg-[var(--border)]" />
                    <button onClick={handleBookmarksClick} className="group flex items-center justify-center w-12 h-12 rounded-[12px] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.08)]" aria-pressed={bookmarksActive} aria-label="Bookmarks">
                        <img src={bookmarksActive ? '/Bookmark--filled.svg' : '/Bookmark-icon.svg'} alt="Bookmarks" className={bookmarksActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} width={24} height={24} />
                    </button>
                </nav>
            </div>
            <div className="pb-2">
                <NavLink to="/profile" className="block" onClick={() => { if (isTerminalOpen) closeTerminal(); if (isWatchlistOpen) closeWatchlist(); closeRightSidebar(); }}>
                    <div className="avatar-gradient p-1 rounded-full">
                        <img src="/main-avatar.png" alt="Me" className="w-10 h-10 rounded-full block" />
                    </div>
                </NavLink>
            </div>
        </div>
    );
}


