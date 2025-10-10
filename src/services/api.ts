import { API_CONFIGURED, API_URL, DEFAULT_HEADERS } from '../config.ts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
    method?: HttpMethod;
    headers?: Record<string, string>;
    searchParams?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
};

export class ApiClient {
    private baseUrl: string;
    private configured: boolean;
    constructor(baseUrl: string, configured: boolean) {
        this.baseUrl = baseUrl;
        this.configured = configured;
    }

    get isConfigured() {
        return this.configured && this.baseUrl.length > 0;
    }

    private buildUrl(path: string, searchParams?: RequestOptions['searchParams']) {
        const url = new URL(path.replace(/^\//, ''), this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/');
        if (searchParams) {
            for (const [k, v] of Object.entries(searchParams)) {
                if (v !== undefined) url.searchParams.set(k, String(v));
            }
        }
        return url.toString();
    }

    async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
        if (!this.isConfigured) {
            // Not configured yet – intentionally avoid network.
            throw new Error('API not configured. Set VITE_API_URL in your .env file.');
        }
        const { method = 'GET', headers, body, searchParams } = opts;
        const res = await fetch(this.buildUrl(path, searchParams), {
            method,
            headers: { ...DEFAULT_HEADERS, ...headers },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) return (await res.json()) as T;
        return undefined as unknown as T;
    }

    get<T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(path, { ...opts, method: 'GET' });
    }
    post<T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) {
        return this.request<T>(path, { ...opts, method: 'POST', body });
    }
}

export const api = new ApiClient(API_URL, API_CONFIGURED);

// Helper: create a promise-like empty result while API is not configured
export function emptyResult<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}


