import { useState } from "react";
import SignUpModal from "../Modals/SignUpModal";
import RestoreAccountModal from "../Modals/RestoreAccountModal";
import GenerateAccountModal from "../Modals/GenerateAccountModal";

type TabKey = "positions" | "balances";

interface TopNavItem {
    id: string;
    icon: string;
    title: string;
    changeText: string;
    changeClassName: string;
    tag: string;
}

export function TopNav() {
    const [activeTab, setActiveTab] = useState<TabKey>("positions");
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isRestoreOpen, setIsRestoreOpen] = useState(false);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    const positionItems: TopNavItem[] = [
        {
            id: "pos-1",
            icon: "/icon-3.png",
            title: "Fed decision in September?",
            changeText: "+1.45%",
            changeClassName: "text-green-700",
            tag: "Bitcoin",
        },
        {
            id: "pos-2",
            icon: "/icon-2.svg",
            title: "ETH Merge Anniversary",
            changeText: "-1.14%",
            changeClassName: "text-red-700",
            tag: "Bitcoin",
        },
        {
            id: "pos-3",
            icon: "/icon-1.svg",
            title: "CPI Release",
            changeText: "+0.53%",
            changeClassName: "text-green-700",
            tag: "Bitcoin",
        },
    ];

    const balanceItems: TopNavItem[] = [
        {
            id: "bal-1",
            icon: "/Manifold.svg",
            title: "Manifold",
            changeText: "$12,572.50",
            changeClassName: "text-white/50",
            tag: "$12,572.50",
        },
        {
            id: "bal-2",
            icon: "/Limitless.svg",
            title: "Limitless",
            changeText: "+0.00%",
            changeClassName: "text-white/50",
            tag: "$8,359.23",
        },
        {
            id: "bal-3",
            icon: "/Zeitgeist.svg",
            title: "Zeitgeist",
            changeText: "+0.00%",
            changeClassName: "text-white/50",
            tag: "$4,304.99",
        },
    ];

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
                <div className="flex items-center gap-3 overflow-x-auto scroll-thin">
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
                        <div key={item.id} className="flex items-center">
                            {renderItemIcon(item)}
                            <span className={`pl-2 text-xs ${activeTab === "balances" ? "text-white/44" : ""}`}>
                                {item.title}
                                {activeTab === "positions" && (
                                    <span className={`pl-1 ${item.changeClassName}`}>{item.changeText}</span>
                                )}
                            </span>
                            <span className="flex items-center text-xs gap-1 ml-1">
                                {activeTab === "positions" ? (
                                    <>
                                        <span className="px-1">x</span>
                                        {item.tag}
                                    </>
                                ) : (
                                    <>{item.tag}</>
                                )}
                            </span>
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


