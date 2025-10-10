import { create } from 'zustand';
import type { CardData } from '../components/Card/Card';

interface UIState {
  isRightSidebarOpen: boolean;
  isRightSidebarClosing: boolean;
  selectedCard: CardData | null;
  openRightSidebar: (card: CardData) => void;
  closeRightSidebar: () => void;
  // Watchlist sidebar state
  isWatchlistOpen: boolean;
  isWatchlistClosing: boolean;
  openWatchlist: () => void;
  closeWatchlist: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isRightSidebarOpen: false,
  isRightSidebarClosing: false,
  selectedCard: null,
  openRightSidebar: (card: CardData) => {
    // Reset closing state and open
    set({ isRightSidebarOpen: true, isRightSidebarClosing: false, selectedCard: card });
  },
  closeRightSidebar: () => {
    const state = get();
    if (!state.isRightSidebarOpen || state.isRightSidebarClosing) return; // no-op
    set({ isRightSidebarClosing: true });
    // Wait for CSS animation to complete before unmounting
    setTimeout(() => {
      set({ isRightSidebarOpen: false, isRightSidebarClosing: false, selectedCard: null });
    }, 220);
  },
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
    }, 200);
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
    // Auto-clear processing after 1.5s, others after 3.2s
    const timeout = t.type === 'processing' ? 3000 : 5000;
    setTimeout(() => {
      const { removeToast } = get();
      removeToast(id);
    }, timeout);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));


