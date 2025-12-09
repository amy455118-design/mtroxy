import { AppConfig, BuyResponse, CountryResponse, ApiBaseResponse, GetPriceResponse, GetProxyResponse } from '../types';
import { PROXY6_API_BASE, CORS_PROXY_PREFIX } from '../constants';

const buildUrl = (config: AppConfig, method: string, params: Record<string, string | number | boolean>) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  // Add a unique timestamp to force a fresh request (cache busting)
  // This prevents the browser or CORS proxy from serving stale data (e.g., old descriptions)
  queryParams.append('_t', String(Date.now()));

  const targetUrl = `${PROXY6_API_BASE}/${config.apiKey}/${method}?${queryParams.toString()}`;
  return config.useCorsProxy ? `${CORS_PROXY_PREFIX}${encodeURIComponent(targetUrl)}` : targetUrl;
};

const fetchApi = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }
    const data: T = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const checkBalance = async (config: AppConfig): Promise<ApiBaseResponse> => {
  // Calling endpoint without method returns balance
  const targetUrl = `${PROXY6_API_BASE}/${config.apiKey}`;
  const urlWithCacheBuster = config.useCorsProxy 
    ? `${CORS_PROXY_PREFIX}${encodeURIComponent(targetUrl + `?_t=${Date.now()}`)}` 
    : targetUrl + `?_t=${Date.now()}`;
    
  return fetchApi<ApiBaseResponse>(urlWithCacheBuster);
};

export const getPrice = async (config: AppConfig, countOverride?: number): Promise<GetPriceResponse> => {
  const url = buildUrl(config, 'getprice', {
    count: countOverride || config.count,
    period: config.period,
    version: config.version,
  });
  return fetchApi<GetPriceResponse>(url);
};

export const getProxies = async (config: AppConfig, state: string = 'active'): Promise<GetProxyResponse> => {
  const url = buildUrl(config, 'getproxy', {
    state: state,
    limit: 1000 // Get max allowed to ensure we see all inventory
  });
  return fetchApi<GetProxyResponse>(url);
};

export const setProxyDescription = async (config: AppConfig, ids: string, description: string): Promise<ApiBaseResponse> => {
  const url = buildUrl(config, 'setdescr', {
    ids: ids,
    new: description
  });
  return fetchApi<ApiBaseResponse>(url);
};

export const buyProxies = async (config: AppConfig, countOverride?: number, descriptionOverride?: string): Promise<BuyResponse> => {
  // Construct params dynamically
  const params: Record<string, string | number | boolean> = {
    count: countOverride || config.count,
    period: config.period,
    country: config.country,
    version: config.version,
    type: config.type,
    descr: descriptionOverride || config.description,
  };

  // Only send auto_prolong if explicitly true. 
  if (config.autoProlong) {
    params.auto_prolong = 1;
  }

  const url = buildUrl(config, 'buy', params);
  return fetchApi<BuyResponse>(url);
};

export const getAvailableCountries = async (config: AppConfig): Promise<CountryResponse> => {
  const url = buildUrl(config, 'getcountry', {
    version: config.version,
  });

  try {
    return await fetchApi<CountryResponse>(url);
  } catch (error) {
    return { status: 'no', error: 'Failed to fetch countries' };
  }
};