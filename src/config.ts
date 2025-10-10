export const API_URL = import.meta.env.VITE_API_URL ?? '';
export const WS_URL = import.meta.env.VITE_WS_URL ?? '';

export const API_CONFIGURED = typeof API_URL === 'string' && API_URL.length > 0;

export const DEFAULT_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
};

export type ApiResult<T> = Promise<T>;


