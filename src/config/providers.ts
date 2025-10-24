// Central provider style configuration used across the app

export type ProviderKey = 'kalshi' | 'manifold' | 'limitless' | 'predictit' | 'polymarket' | 'zeitgeist';

export interface ProviderConfig {
  key: ProviderKey;
  label: string;
  icon: string; // path under /public
  bgHex: string; // background color hex
  textTone: 'light' | 'dark';
  borderHex?: string;
  sparkline?: number[];
}

export const PROVIDER_CONFIGS: Record<ProviderKey, ProviderConfig> = {
  kalshi: { key: 'kalshi', label: 'Kalshi', icon: '/K-Kalshi.svg', bgHex: '#179F61', textTone: 'light', borderHex: '#179F61' },
  manifold: { key: 'manifold', label: 'Manifold', icon: '/Manifold.svg', bgHex: '#4337C4', textTone: 'light', borderHex: '#4337C4' },
  limitless: { key: 'limitless', label: 'Limitless', icon: '/Limitless.svg', bgHex: '#DCF58D', textTone: 'dark', borderHex: '#DCF58D' },
  predictit: { key: 'predictit', label: 'PredictIt', icon: '/Predictit.svg', bgHex: '#07A0BA', textTone: 'light', borderHex: '#07A0BA' },
  polymarket: { key: 'polymarket', label: 'Polymarket', icon: '/Polymarket.svg', bgHex: '#1751F0', textTone: 'light', borderHex: '#1751F0' },
  zeitgeist: { key: 'zeitgeist', label: 'Zeitgeist', icon: '/Zeitgeist.svg', bgHex: '#FFFFFF', textTone: 'dark', borderHex: '#FFFFFF' },
};

export function hexToRgbStr(hex: string): string {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

