import { api, emptyResult } from './api.ts';

export type Market = {
    id: string;
    name: string;
    source: 'polymarket' | 'kalshi' | 'limitless' | 'unknown';
    lastPrice?: number;
};

export async function listMarkets(): Promise<Market[]> {
    if (!api.isConfigured) return emptyResult<Market[]>([]);
    return api.get<Market[]>('markets');
}

export async function getMarket(marketId: string): Promise<Market | null> {
    if (!api.isConfigured) return emptyResult<Market | null>(null);
    return api.get<Market>(`markets/${marketId}`);
}


