import { create } from 'zustand';
import type { CardData } from '../models/card';

interface UIState {
  isRightSidebarOpen: boolean;
  isRightSidebarClosing: boolean;
  selectedCard: CardData | null;
  openRightSidebar: (card: CardData) => void;
  openRightSidebarWithOutcome: (card: CardData, outcomeLabel: string, tradeTab: 'buy' | 'sell') => void;
  closeRightSidebar: () => void;
  closeRightSidebarImmediate: () => void;
  rightSidebarPreset: {
    view: 'detail';
    outcomeLabel?: string;
    tradeTab?: 'buy' | 'sell';
  } | null;
  setRightSidebarPreset: (p: UIState['rightSidebarPreset']) => void;
  clearRightSidebarPreset: () => void;
  // Watchlist sidebar state
  isWatchlistOpen: boolean;
  isWatchlistClosing: boolean;
  openWatchlist: () => void;
  closeWatchlist: () => void;
  closeWatchlistImmediate: () => void;
  // Watchlist width (px)
  watchlistWidth: number;
  setWatchlistWidth: (w: number) => void;
  // Full-screen terminal overlay state
  isTerminalOpen: boolean;
  isTerminalClosing: boolean;
  openTerminal: (card: CardData) => void;
  closeTerminal: () => void;
  closeTerminalImmediate: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isRightSidebarOpen: false,
  isRightSidebarClosing: false,
  selectedCard: null,
  openRightSidebar: (card: CardData) => {
    // Reset closing state and open
    set({ isRightSidebarOpen: true, isRightSidebarClosing: false, selectedCard: card });
  },
  openRightSidebarWithOutcome: (card: CardData, outcomeLabel: string, tradeTab: 'buy' | 'sell') => {
    set({
      isRightSidebarOpen: true,
      isRightSidebarClosing: false,
      selectedCard: card,
      rightSidebarPreset: { view: 'detail', outcomeLabel, tradeTab },
    });
  },
  closeRightSidebar: () => {
    const state = get();
    if (!state.isRightSidebarOpen || state.isRightSidebarClosing) return; // no-op
    set({ isRightSidebarClosing: true });
    // Wait for CSS animation to complete before unmounting
    setTimeout(() => {
      const stillTerminalOpen = get().isTerminalOpen;
      set({
        isRightSidebarOpen: false,
        isRightSidebarClosing: false,
        ...(stillTerminalOpen ? {} : { selectedCard: null }),
      });
    }, 260);
  },
  closeRightSidebarImmediate: () => {
    set({ isRightSidebarOpen: false, isRightSidebarClosing: false });
  },
  rightSidebarPreset: null,
  setRightSidebarPreset: (p) => set({ rightSidebarPreset: p }),
  clearRightSidebarPreset: () => set({ rightSidebarPreset: null }),
  // Watchlist sidebar controls
  isWatchlistOpen: false,
  isWatchlistClosing: false,
  openWatchlist: () => set({ isWatchlistOpen: true, isWatchlistClosing: false }),
  closeWatchlist: () => {
    const state = get();
    if (!state.isWatchlistOpen || state.isWatchlistClosing) return; // no-op
    set({ isWatchlistClosing: true });
    setTimeout(() => {
      set({ isWatchlistOpen: false, isWatchlistClosing: false });
    }, 260);
  },
  closeWatchlistImmediate: () => {
    set({ isWatchlistOpen: false, isWatchlistClosing: false });
  },
  // Watchlist width (defaults to 320 on first use)
  watchlistWidth: 320,
  setWatchlistWidth: (w: number) => set({ watchlistWidth: Math.max(320, Math.min(720, Math.round(w))) }),
  // Terminal overlay controls
  isTerminalOpen: false,
  isTerminalClosing: false,
  openTerminal: (card: CardData) => {
    set({ isTerminalOpen: true, isTerminalClosing: false, selectedCard: card });
  },
  closeTerminal: () => {
    const state = get();
    if (!state.isTerminalOpen || state.isTerminalClosing) return;
    set({ isTerminalClosing: true });
    setTimeout(() => {
      set({ isTerminalOpen: false, isTerminalClosing: false, selectedCard: null });
    }, 300);
  },
  closeTerminalImmediate: () => {
    set({ isTerminalOpen: false, isTerminalClosing: false, selectedCard: null });
  },
}));

// Simple toast system
export type ToastType = 'processing' | 'success' | 'error';
export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: ToastItem[];
  pushToast: (t: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (t) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, ...t } as ToastItem;
    set({ toasts: [item, ...get().toasts].slice(0, 5) });
    // Auto-clear processing after 3s, others after 5s
    const timeout = t.type === 'processing' ? 3000 : 5000;
    setTimeout(() => {
      const { removeToast } = get();
      removeToast(id);
    }, timeout);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));


