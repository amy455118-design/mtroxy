export enum ProxyVersion {
  IPv6 = '6',
  IPv4 = '4',
  IPv4Shared = '3',
}

export enum ProxyType {
  HTTP = 'http',
  SOCKS = 'socks',
}

export interface AppConfig {
  apiKey: string;
  count: number;
  period: number;
  country: string;
  version: ProxyVersion;
  type: ProxyType;
  description: string;
  autoProlong: boolean;
  useCorsProxy: boolean;
}

export interface ApiBaseResponse {
  status: 'yes' | 'no';
  user_id?: string;
  balance?: string;
  currency?: string;
  error?: string;
  error_id?: number;
  count?: number;
}

export interface BuyResponse extends ApiBaseResponse {
  order_id?: number;
  count?: number;
  price?: number;
  period?: number;
  country?: string;
  list?: Record<string, ProxyItem>;
}

export interface ProxyItem {
  id: string;
  ip: string;
  host: string;
  port: string;
  user: string;
  pass: string;
  type: string;
  date: string;
  date_end: string;
  active: string;
  descr?: string;
  country?: string;
  version?: string;
  unixtime?: number;
  unixtime_end?: number;
}

export interface CountryResponse extends ApiBaseResponse {
  list?: string[];
}

export interface GetPriceResponse extends ApiBaseResponse {
  price?: number;
  price_single?: number;
  period?: number;
  count?: number;
}

export interface GetProxyResponse extends ApiBaseResponse {
  list_count?: number;
  list?: Record<string, ProxyItem>;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}