import { create } from 'zustand';

export type ProviderKey = 'kalshi' | 'manifold' | 'polymarket' | 'predictit' | 'zeitgeist' | 'limitless';

export interface ProviderFilterState {
  selectedProviders: Set<ProviderKey>;
  addProvider: (key: ProviderKey) => void;
  removeProvider: (key: ProviderKey) => void;
  clearProviders: () => void;
  setProviders: (keys: ProviderKey[] | Set<ProviderKey>) => void;
}

export const useProviderFilters = create<ProviderFilterState>((set) => ({
  selectedProviders: new Set<ProviderKey>([
    'kalshi',
    'manifold',
    'polymarket',
    'predictit',
    'zeitgeist',
    'limitless',
  ]),
  addProvider: (key) => set((state) => {
    const next = new Set(state.selectedProviders);
    next.add(key);
    return { selectedProviders: next };
  }),
  removeProvider: (key) => set((state) => {
    const next = new Set(state.selectedProviders);
    next.delete(key);
    return { selectedProviders: next };
  }),
  clearProviders: () => set({ selectedProviders: new Set<ProviderKey>() }),
  setProviders: (keys) => set({ selectedProviders: new Set(Array.from(keys)) as Set<ProviderKey> }),
}));


