import { useMemo, useState } from "react";
import SignUpModal from "../Modals/SignUpModal";
import RestoreAccountModal from "../Modals/RestoreAccountModal";
import GenerateAccountModal from "../Modals/GenerateAccountModal";
import { demoCards, type CardData, getProviderIcon, getProviderLabel } from "../../models/card";
import { providerBalances } from "../../models/accounts";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/ui";

type TabKey = "positions" | "balances";

interface TopNavItem {
    id: string;
    icon: string;
    title: string;
    changeText: string;
    changeClassName: string;
    tag: string;
    card?: CardData;
}

export function TopNav() {
    const [activeTab, setActiveTab] = useState<TabKey>("positions");
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isRestoreOpen, setIsRestoreOpen] = useState(false);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const openWatchlist = useUIStore(s => s.openWatchlist);
    const openTerminal = useUIStore(s => s.openTerminal);
    // Instant-close variants to avoid layout lag on navigation
    const closeWatchlistImmediate = useUIStore(s => s.closeWatchlistImmediate);
    const closeRightSidebarImmediate = useUIStore(s => s.closeRightSidebarImmediate);
    const closeTerminalImmediate = useUIStore(s => s.closeTerminalImmediate);
    const navigate = useNavigate();

    const positionItems: TopNavItem[] = useMemo(() => {
        const cards = demoCards.filter(c => !!c.position).slice(0, 3);
        return cards.map((c) => {
            const pnl = c.position?.pnl ?? '';
            const isPositive = pnl.startsWith('+');
            return {
                id: `pos-${c.id}`,
                icon: getProviderIcon(c.provider),
                title: c.title,
                changeText: pnl || `${Math.round(c.yesPercentage ?? 0)}%`,
                changeClassName: pnl ? (isPositive ? "text-green-700" : "text-red-700") : "text-white/50",
                tag: getProviderLabel(c.provider),
                card: c,
            } as TopNavItem;
        });
    }, []);

    const balanceItems: TopNavItem[] = useMemo(() => {
        return providerBalances.slice(0, 6).map((p, idx) => ({
            id: `bal-${idx + 1}`,
            icon: p.logo,
            title: p.name,
            changeText: p.balanceUsd,
            changeClassName: "text-white/50",
            tag: p.balanceUsd,
        }));
    }, []);

    const itemsToRender = activeTab === "positions" ? positionItems : balanceItems;

    const getBgClassForIcon = (iconPath: string) => {
        switch (iconPath) {
            case "/K-Kalshi.svg":
                return "bg-[#179F61]";
            case "/Manifold.svg":
                return "bg-[#4337C4]";
            case "/Limitless.svg":
                return "bg-[#DCF58D]";
            case "/Predictit.svg":
                return "bg-[#07A0BA]";
            case "/Polymarket.svg":
                return "bg-[#1751F0]";
            case "/Zeitgeist.svg":
                return "bg-[#FFFFFF]";
            default:
                return "bg-white/10";
        }
    };

    const renderItemIcon = (item: TopNavItem) => {
        if (activeTab === "balances") {
            const bg = getBgClassForIcon(item.icon);
            return (
                <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center ${bg}`}>
                    <img
                        src={item.icon}
                        alt={item.title}
                        className="w-[12px] h-[12px]"
                    />
                </div>
            );
        }
        return (
            <img
                src={item.icon}
                alt={item.title}
                className="w-full h-full max-w-[18px] "
            />
        );
    };

    return (
        <div className="w-full">
            <div className="pl-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto scroll-thin whitespace-nowrap">
                    <div className="flex items-center border-r border-white/10">
                        <button
                            type="button"
                            onClick={() => setActiveTab("positions")}
                            className={`px-2 py-1 text-xs ${activeTab === "positions" ? "font-semibold" : "text-white/50"}`}
                        >
                            <span>My Positions</span>
                            <span className="ml-2 bg-[#ffffff]/10 text-white rounded-full px-1.5 py-1">{positionItems.length}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("balances")}
                            className={`px-2 py-1 text-xs ${activeTab === "balances" ? "font-semibold" : "text-white/50"}`}
                        >
                            <span>My Balances</span>
                            <span className="ml-2 bg-[#ffffff]/10 text-white rounded-full px-1.5 py-1">{balanceItems.length}</span>
                        </button>
                    </div>
                    {itemsToRender.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center cursor-pointer shrink-0"
                            onClick={() => {
                                if (activeTab === "positions" && item.card) {
                                    openWatchlist();
                                    openTerminal(item.card);
                                    return;
                                }
                                if (activeTab === "balances") {
                                    // Instantly remove overlays to prevent layout lag before navigation
                                    if (closeTerminalImmediate) closeTerminalImmediate();
                                    if (closeRightSidebarImmediate) closeRightSidebarImmediate();
                                    if (closeWatchlistImmediate) closeWatchlistImmediate();
                                    navigate('/profile/accounts');
                                }
                            }}
                        >
                            {renderItemIcon(item)}
                            <span className={`pl-2 text-xs whitespace-nowrap ${activeTab === "balances" ? "text-white/44" : ""}`}>
                                {item.title}
                                {activeTab === "positions" && (
                                    <span className={`pl-1 ${item.changeClassName}`}>{item.changeText}</span>
                                )}
                                {activeTab === "balances" && (
                                    <span className={`pl-1 ${item.changeClassName}`}>{item.changeText}</span>
                                )}
                            </span>
                            {/* <span className="flex items-center text-xs gap-1 ml-1">
                                {activeTab === "positions" ? (
                                    <>
                                        <span className="px-1">x</span>
                                        {item.tag}
                                    </>
                                ) : (
                                    <>{item.tag}</>
                                )}
                            </span> */}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-0 shrink-0">
                    <button className="h-9 w-18 text-xs font-semibold bg-customGray17 border-l border-customBorder">
                        Login
                    </button>
                    <button onClick={() => setIsSignUpOpen(true)} className="h-9 w-21 text-xs sign-up-gradient text-white font-semibold border-b border-customBorder">
                        Sign Up
                    </button>
                </div>
            </div>
            {isSignUpOpen && (
                <SignUpModal
                    open={isSignUpOpen}
                    onClose={() => setIsSignUpOpen(false)}
                    onOpenGenerate={() => {
                        setIsSignUpOpen(false)
                        setIsGenerateOpen(true)
                    }}
                    onOpenRestore={() => {
                        setIsSignUpOpen(false)
                        setIsRestoreOpen(true)
                    }}
                />
            )}
            {isRestoreOpen && (
                <RestoreAccountModal open={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} />
            )}
            {isGenerateOpen && (
                <GenerateAccountModal open={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} />
            )}
        </div>
    );
}


