import { create } from 'zustand';
import type { CardData } from '../models/card';

export interface WatchlistState {
  itemsById: Map<string, CardData>;
  add: (card: CardData) => void;
  remove: (id: string) => void;
  toggle: (card: CardData) => void;
  isBookmarked: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  itemsById: new Map<string, CardData>(),
  add: (card) => set((state) => {
    const next = new Map(state.itemsById);
    next.set(card.id, card);
    return { itemsById: next };
  }),
  remove: (id) => set((state) => {
    const next = new Map(state.itemsById);
    next.delete(id);
    return { itemsById: next };
  }),
  toggle: (card) => {
    const { itemsById, add, remove } = get();
    if (itemsById.has(card.id)) {
      remove(card.id);
    } else {
      add(card);
    }
  },
  isBookmarked: (id) => get().itemsById.has(id),
}));


