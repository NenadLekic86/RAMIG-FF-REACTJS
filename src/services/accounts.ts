import { api, emptyResult } from './api.ts';

export type Account = {
    id: string;
    provider: 'polymarket' | 'kalshi' | 'limitless' | 'internal';
    balance: number;
    currency: string;
};

export async function listAccounts(): Promise<Account[]> {
    if (!api.isConfigured) return emptyResult<Account[]>([]);
    return api.get<Account[]>('accounts');
}


