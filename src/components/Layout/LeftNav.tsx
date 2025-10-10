import { NavLink } from 'react-router-dom';

function SidebarIcon({ src, alt, to, active = false }: { src: string; alt: string; to?: string; active?: boolean }) {
    const img = (
        <img
            src={src}
            alt={alt}
            className={active ? 'opacity-100' : 'opacity-50'}
            width={24}
            height={24}
        />
    );
    if (to) return <NavLink to={to} className="flex items-center justify-center h-12">{img}</NavLink>;
    return <div className="flex items-center justify-center h-12">{img}</div>;
}

export function LeftNav() {
    return (
        <div className="flex flex-col items-center justify-between h-dvh py-4">
            <div className="flex flex-col items-center gap-2 w-full">
                <div className="h-12 flex items-center justify-center mb-10">
                    <a href="/">
                        <img src="/convergewhite.svg" alt="Converge" width={48} height={48} />
                    </a>
                </div>
                <nav className="mt-2 flex flex-col items-center w-full gap-4">
                    <SidebarIcon src="/Search--locate.svg" alt="Explore" to="/" active />
                    <SidebarIcon src="/Chart--candlestick.svg" alt="Charts" />
                    <div className="w-8 h-px my-2 bg-[var(--border)]" />
                    <SidebarIcon src="/Bookmark-icon.svg" alt="Bookmarks" />
                </nav>
            </div>
            <div className="pb-2">
                <div className="avatar-gradient p-1 rounded-full">
                    <img src="/main-avatar.png" alt="Me" className="w-10 h-10 rounded-full block" />
                </div>
            </div>
        </div>
    );
}


