import { AppConfig, ProxyVersion, ProxyType } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  count: 1,
  period: 30,
  country: 'br',
  version: ProxyVersion.IPv4,
  type: ProxyType.SOCKS,
  description: '',
  autoProlong: false,
  useCorsProxy: true,
};

export const PROXY6_API_BASE = 'https://px6.link/api';
export const CORS_PROXY_PREFIX = 'https://corsproxy.io/?';

export const COUNTRY_LIST = [
  'au', 'bg', 'br', 'ca', 'cn', 'cz', 'de', 'dk', 'ee', 'es', 
  'fi', 'fr', 'gb', 'ge', 'gr', 'hk', 'id', 'il', 'in', 'it', 
  'jp', 'kg', 'kr', 'kz', 'lt', 'lv', 'md', 'mx', 'my', 'nl', 
  'no', 'ph', 'pl', 'pt', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 
  'th', 'tr', 'ua', 'us', 'vn', 'za'
]; // Common list, dynamic fetching is better but this serves as fallback