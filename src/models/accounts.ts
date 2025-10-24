import type { ProviderKey } from '../config/providers';

export type ProviderBalance = {
  id: ProviderKey;
  name: string;
  url: string;
  logo: string; // public asset path
  bgHex: string; // square icon background
  balanceUsd: string;
};

export const providerBalances: ProviderBalance[] = [
  { id: 'manifold',   name: 'Manifold',   url: 'https://manifold.xyz',       logo: '/Manifold.svg',  bgHex: '#4337C4', balanceUsd: '$568.33' },
  { id: 'limitless',  name: 'Limitless',  url: 'https://limitless.exchange', logo: '/Limitless.svg', bgHex: '#DCF58D', balanceUsd: '$568.33' },
  { id: 'zeitgeist',  name: 'Zeitgeist',  url: 'https://zeitgeist.pm',       logo: '/Zeitgeist.svg', bgHex: '#FFFFFF', balanceUsd: '$568.33' },
  { id: 'polymarket', name: 'Polymarket', url: 'https://polymarket.com',     logo: '/Polymarket.svg',bgHex: '#1751F0', balanceUsd: '$568.33' },
  { id: 'kalshi',     name: 'Kalshi',     url: 'https://kalshi.com',         logo: '/K-Kalshi.svg',  bgHex: '#179F61', balanceUsd: '$568.33' },
  { id: 'predictit',  name: 'PredictIt',  url: 'https://www.predictit.org',  logo: '/Predictit.svg', bgHex: '#07A0BA', balanceUsd: '$568.33' },
];


