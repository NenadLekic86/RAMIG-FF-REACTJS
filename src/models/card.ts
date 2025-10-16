import { PROVIDER_CONFIGS, type ProviderKey } from '../config/providers';

// Canonical card data model used across the app
export interface CardData {
  id: string;
  title: string;
  description?: string;
  provider: ProviderKey;
  liquidity: string; // display formatted for now
  createdDate: string; // display formatted for now
  imageUrl?: string;
  yesPercentage: number;
  noPercentage: number;
  volume?: string;
  category?: string;
  endDate?: string;
  sparkline?: number[];
  outcomes?: Outcome[];
  // UI-only flags used by components
  hasHoverEffect?: boolean;
  isActive?: boolean;
  // Optional demo position fields for Positions tab; will be sourced from API later
  position?: {
    status: 'active' | 'history';
    side: 'buy' | 'sell';
    size: string; // e.g. "1,580¢"
    sold: string; // e.g. "1,000¢"
    remaining: string; // e.g. "580¢"
    pnl: string; // e.g. "+155.83%" or "-15.83%"
  };
}

export interface Outcome {
  label: string;
  probability: number; // percent 0..100
  volume?: string;
}

// Display helpers derived from provider config
export function getProviderIcon(provider: ProviderKey): string {
  return PROVIDER_CONFIGS[provider].icon;
}
export function getProviderBgHex(provider: ProviderKey): string {
  return PROVIDER_CONFIGS[provider].bgHex;
}
export function getProviderLabel(provider: ProviderKey): string {
  return PROVIDER_CONFIGS[provider].label;
}

export function formatPercent(n?: number): string {
  const v = typeof n === 'number' ? n : 0;
  return `${Math.round(v)}%`;
}

// Demo fixtures for local development; will be replaced by API fetch
export const demoCards: CardData[] = [
  { id: '1', title: 'US inflation below 3% by Dec 2025?', description: 'Will YoY CPI fall under 3% by December 2025?', provider: 'kalshi', liquidity: '$2.3M', createdDate: '05 Feb, 2025', imageUrl: '/placeholder_img.png', yesPercentage: 42, noPercentage: 58, category: 'Economy', position: { status: 'active', side: 'sell', size: '1,580¢', sold: '1,000¢', remaining: '580¢', pnl: '-15.83%' }, outcomes: [
    { label: '50+ bps decreased', probability: 42, volume: '$20,660,050' },
    { label: '25 bps decrease', probability: 15.8, volume: '$20,660,050' },
    { label: 'No change', probability: 4.5, volume: '$20,660,050' },
  ] },
  { id: '2', title: 'Bitcoin tops $100k in 2025', description: 'Will BTC reach a six-figure price before 2026?', provider: 'manifold', liquidity: '$850k', createdDate: '12 Mar, 2025', imageUrl: '/placeholder_img.png', yesPercentage: 61, noPercentage: 39, category: 'Crypto', position: { status: 'active', side: 'buy', size: '2,340¢', sold: '800¢', remaining: '1,540¢', pnl: '+155.83%' }, outcomes: [
    { label: '50+ bps decreased', probability: 61, volume: '$12,100,000' },
    { label: '25 bps decrease', probability: 22.4, volume: '$12,100,000' },
    { label: 'No change', probability: 7.2, volume: '$12,100,000' },
  ] },
  { id: '3', title: 'AR headset unveiled at WWDC 2026', description: 'Will Apple unveil an AR headset at WWDC 2026?', provider: 'limitless', liquidity: '$1.4M', createdDate: '07 Jun, 2026', imageUrl: '/placeholder_img.png', yesPercentage: 54, noPercentage: 46, category: 'Tech', position: { status: 'active', side: 'buy', size: '900¢', sold: '0¢', remaining: '900¢', pnl: '+22.10%' }, outcomes: [
    { label: '50+ bps decreased', probability: 54, volume: '$8,420,220' },
    { label: '25 bps decrease', probability: 18.5, volume: '$8,420,220' },
    { label: 'No change', probability: 6.1, volume: '$8,420,220' },
  ] },
  { id: '4', title: 'US election 2028: Incumbent reelected?', description: 'Will the sitting president win reelection in 2028?', provider: 'kalshi', liquidity: '$3.1M', createdDate: '22 Sep, 2025', imageUrl: '/placeholder_img.png', yesPercentage: 48, noPercentage: 52, category: 'Politics', position: { status: 'history', side: 'sell', size: '1,200¢', sold: '1,200¢', remaining: '0¢', pnl: '+12.44%' }, outcomes: [
    { label: '50+ bps decreased', probability: 48, volume: '$9,200,000' },
    { label: '25 bps decrease', probability: 19.3, volume: '$9,200,000' },
    { label: 'No change', probability: 5.0, volume: '$9,200,000' },
  ] },
  { id: '5', title: 'Global temperature record in 2026', description: 'Will 2026 set a new global average temperature record?', provider: 'limitless', liquidity: '$420k', createdDate: '14 Aug, 2025', imageUrl: '/placeholder_img.png', yesPercentage: 67, noPercentage: 33, category: 'Climate', position: { status: 'history', side: 'buy', size: '1,000¢', sold: '1,000¢', remaining: '0¢', pnl: '-8.10%' }, outcomes: [
    { label: '50+ bps decreased', probability: 67, volume: '$2,420,000' },
    { label: '25 bps decrease', probability: 14.2, volume: '$2,420,000' },
    { label: 'No change', probability: 3.7, volume: '$2,420,000' },
  ] },
  { id: '6', title: 'ETH surpasses BTC market cap by 2030', description: 'Will Ethereum flip Bitcoin by total market capitalization by 2030?', provider: 'polymarket', liquidity: '$980k', createdDate: '03 Nov, 2024', imageUrl: '/placeholder_img.png', yesPercentage: 18, noPercentage: 82, category: 'Crypto', position: { status: 'active', side: 'sell', size: '3,100¢', sold: '1,400¢', remaining: '1,700¢', pnl: '-4.10%' }, outcomes: [
    { label: '50+ bps decreased', probability: 18, volume: '$980,000' },
    { label: '25 bps decrease', probability: 9.8, volume: '$980,000' },
    { label: 'No change', probability: 2.4, volume: '$980,000' },
  ] },
  { id: '7', title: 'AI passes Turing-style benchmark by 2027', description: 'Will a leading AI system pass a rigorous Turing-style test?', provider: 'predictit', liquidity: '$1.9M', createdDate: '30 May, 2025', imageUrl: '/placeholder_img.png', yesPercentage: 36, noPercentage: 64, category: 'Science', position: { status: 'history', side: 'buy', size: '760¢', sold: '760¢', remaining: '0¢', pnl: '+3.22%' }, outcomes: [
    { label: '50+ bps decreased', probability: 36, volume: '$1,900,000' },
    { label: '25 bps decrease', probability: 12.2, volume: '$1,900,000' },
    { label: 'No change', probability: 5.9, volume: '$1,900,000' },
  ] },
  { id: '8', title: 'Man City win Premier League 2026/27', description: 'Will Manchester City lift the 2026/27 Premier League title?', provider: 'zeitgeist', liquidity: '$760k', createdDate: '09 Jan, 2026', imageUrl: '/placeholder_img.png', yesPercentage: 58, noPercentage: 42, category: 'Sports', position: { status: 'active', side: 'buy', size: '1,420¢', sold: '600¢', remaining: '820¢', pnl: '+8.90%' }, outcomes: [
    { label: '50+ bps decreased', probability: 58, volume: '$760,000' },
    { label: '25 bps decrease', probability: 16.4, volume: '$760,000' },
    { label: 'No change', probability: 6.8, volume: '$760,000' },
  ] },
];


