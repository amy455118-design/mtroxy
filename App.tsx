
import React, { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from './constants';
import { AppConfig, LogEntry, ProxyItem } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { LogViewer } from './components/LogViewer';
import { Login } from './components/Login';
import { buyProxies, checkBalance, getProxies, getPrice, setProxyDescription } from './services/proxy6Service';
import { Play, ShieldCheck, Wallet, Loader2, AlertCircle, Copy, Check, LogOut, RefreshCw } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

// Helper to delay execution to avoid rate limits (max 3 req/sec -> safe 400ms delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for robust clipboard copying (handles HTTP/non-secure contexts)
const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (!navigator.clipboard) {
    return copyToClipboardFallback(text);
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('Clipboard API failed, attempting fallback', err);
    return copyToClipboardFallback(text);
  }
};

const copyToClipboardFallback = (text: string): boolean => {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure it's not visible but part of DOM to work
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};

export default function App() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  
  // State for the big output field
  const [lastPurchased, setLastPurchased] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Check authentication session
  useEffect(() => {
    const authSession = sessionStorage.getItem('mtroxy_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load Config & Auto-fetch Balance
  useEffect(() => {
    const saved = localStorage.getItem('proxy6_automator_config');
    let activeConfig = DEFAULT_CONFIG;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        activeConfig = { ...DEFAULT_CONFIG, ...parsed };
        setConfig(activeConfig);
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    } else {
      if (isAuthenticated) {
        setIsSettingsOpen(true);
      }
    }

    // Automatically check balance if authenticated and key exists
    if (isAuthenticated && activeConfig.apiKey) {
      // Use a small timeout to let the UI settle/mount before firing the request
      setTimeout(() => {
        fetchBalance(activeConfig);
      }, 100);
    }
  }, [isAuthenticated]);

  // Auto-refresh balance every 5 minutes (300000ms)
  useEffect(() => {
    if (!isAuthenticated || !config.apiKey) return;

    const intervalId = setInterval(() => {
      fetchBalance(config);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, config]);

  const handleLogin = () => {
    sessionStorage.setItem('mtroxy_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mtroxy_auth');
    setIsAuthenticated(false);
  };

  // Save Config
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('proxy6_automator_config', JSON.stringify(newConfig));
    addLog('info', t('configSaved'));
    if (newConfig.apiKey) {
      fetchBalance(newConfig);
    }
  };

  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type,
      message,
      details
    }]);
  };

  const fetchBalance = async (cfg: AppConfig) => {
    try {
      const res = await checkBalance(cfg);
      if (res.status === 'yes' && res.balance) {
        setBalance(`${res.balance} ${res.currency}`);
        addLog('info', t('balanceUpdated', { balance: `${res.balance} ${res.currency}` }));
        return parseFloat(res.balance);
      } else {
        setBalance(null);
        if (res.error) addLog('error', t('balanceFailed', { error: res.error }));
        return 0;
      }
    } catch (e: any) {
      if ((e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) && !cfg.useCorsProxy) {
        addLog('warning', t('networkError'));
        const newConfig = { ...cfg, useCorsProxy: true };
        setConfig(newConfig);
        localStorage.setItem('proxy6_automator_config', JSON.stringify(newConfig));
        fetchBalance(newConfig);
        return 0;
      }
      console.error(e);
      return 0;
    }
  };

  const handleCopyProxy = async () => {
    if (!lastPurchased) return;
    
    const success = await copyTextToClipboard(lastPurchased);
    
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      addLog('info', t('proxyCopied'));
    } else {
      addLog('error', t('copyFailed'));
    }
  };

  // Smart Acquisition Logic
  const handleSmartAcquisition = async () => {
    if (!config.apiKey) {
      addLog('error', t('missingKey'));
      setIsSettingsOpen(true);
      return;
    }

    setIsProcessing(true);
    setLastPurchased('');
    addLog('info', t('smartSeqStart'));

    let currentConfig = config;
    const acquiredProxies: ProxyItem[] = [];

    try {
      // 1. Check Price & Balance
      const currentBalance = await fetchBalance(currentConfig);
      
      // We estimate price for 1 unit to check basic affordability
      let singlePrice = 0;
      try {
        const priceData = await getPrice(currentConfig, 1);
        if (priceData.status === 'yes' && priceData.price) {
          singlePrice = priceData.price;
        }
      } catch (e) {
        addLog('warning', t('cautionPrice'));
      }

      // 2. Fetch Active Proxies to Reuse
      addLog('info', t('checkInventory'));
      const inventoryRes = await getProxies(currentConfig, 'active');
      const inventory = inventoryRes.list ? Object.values(inventoryRes.list) : [];
      
      const nowUnix = Math.floor(Date.now() / 1000);

      // Filter candidates: Must match Version, Country, Type AND be valid (not expired)
      const candidates = inventory.filter(p => {
        // Infer version from IP structure.
        const isV6 = p.ip.includes(':');
        const configIsV6 = config.version === '6';
        
        const matchesConfig = (
          isV6 === configIsV6 && 
          p.country === config.country && 
          p.type === config.type
        );
        
        // Strict expiration check
        const isActive = p.active === '1';
        const isNotExpired = p.unixtime_end ? p.unixtime_end > nowUnix : true;
        
        return matchesConfig && isActive && isNotExpired;
      });
      
      // Sort candidates: Newest purchase date first
      candidates.sort((a, b) => b.date.localeCompare(a.date));

      // 3. Process Reuse vs Buy
      let needed = config.count;
      
      for (const proxy of candidates) {
        if (needed <= 0) break;

        // Parse usage: "x/3"
        // Regex looks for "number/3"
        const match = proxy.descr ? proxy.descr.match(/\b(\d+)\/3\b/) : null;
        const currentUsage = match ? parseInt(match[1], 10) : 0; // Assume 0 if not tagged yet

        if (currentUsage < 3) {
            // Reuse this proxy
            const newUsage = currentUsage + 1;
            // Update regex to replace only the found pattern, or append if missing
            let newDescr = '';
            if (proxy.descr && proxy.descr.match(/\b\d+\/3\b/)) {
                newDescr = proxy.descr.replace(/\b\d+\/3\b/, `${newUsage}/3`);
            } else {
                // Append to existing or create new
                newDescr = proxy.descr ? `${proxy.descr} ${newUsage}/3` : `${config.description || ''} ${newUsage}/3`.trim();
            }

            addLog('info', t('reuseProxy', { host: proxy.host, port: proxy.port, usage: newUsage }));
            
            // Call API to update description
            const updateRes = await setProxyDescription(currentConfig, proxy.id, newDescr);
            if (updateRes.status !== 'yes') {
                 addLog('error', t('tagUpdateFailed', { error: updateRes.error || 'Unknown' }));
            }
            
            await delay(400); // Rate limit protection

            // Update local object to reflect change for display
            acquiredProxies.push({ ...proxy, descr: newDescr });
            needed--;
        }
      }

      // 4. Buy Remaining
      if (needed > 0) {
        const estimatedCost = singlePrice * needed;
        if (currentBalance < estimatedCost && currentBalance > 0) {
           addLog('warning', t('lowBalance', { cost: estimatedCost, balance: currentBalance }));
        }

        addLog('info', t('buyingProxies', { count: needed, suffix: needed > 1 ? (t('days') === 'days' ? 'ies' : 's') : (t('days') === 'days' ? 'y' : '') }));

        // Prepare description: "1/3" for new proxies
        const initDescr = `${config.description || ''} 1/3`.trim();
        
        const buyRes = await buyProxies(currentConfig, needed, initDescr);

        if (buyRes.status === 'yes' && buyRes.list) {
            const newIds = Object.keys(buyRes.list);
            addLog('success', t('boughtSuccess', { count: newIds.length, id: buyRes.order_id || '?' }));
            
            Object.values(buyRes.list).forEach(p => {
                acquiredProxies.push({ ...p, descr: initDescr });
            });
            
            // Update balance
            if (buyRes.balance) setBalance(`${buyRes.balance} ${buyRes.currency}`);
        } else {
            addLog('error', t('purchaseFailed', { error: buyRes.error || 'Unknown error' }));
        }
      }

      // 5. Finalize Output
      if (acquiredProxies.length > 0) {
        // Format: Host:Port:User:Pass
        const formattedList = acquiredProxies.map((p: ProxyItem) => `${p.host}:${p.port}:${p.user}:${p.pass}`).join('\n');
        setLastPurchased(formattedList);
        
        // Copy first one to clipboard automatically if only 1 requested
        if (acquiredProxies.length === 1) {
            const success = await copyTextToClipboard(formattedList);
            if (success) {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
                addLog('success', t('autoCopied'));
            }
        } else {
             addLog('success', t('acquiredCount', { count: acquiredProxies.length }));
        }
      } else {
        addLog('warning', t('noProxies'));
      }

    } catch (error: any) {
       addLog('error', t('processFailed'), error.message);
       if (error.message?.includes('Failed to fetch') && !currentConfig.useCorsProxy) {
           addLog('warning', t('checkInternet'));
       }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      
      <SettingsPanel 
        config={config} 
        isOpen={isSettingsOpen} 
        onToggle={() => setIsSettingsOpen(!isSettingsOpen)} 
        onSave={handleSaveConfig}
      />

      <div className="w-full max-w-2xl space-y-8 relative">
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="absolute top-0 right-0 p-2 text-slate-600 hover:text-red-400 transition-colors"
          title={t('logout')}
        >
          <LogOut size={16} />
        </button>

        {/* Header Area */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <ShieldCheck className="text-blue-500" size={40} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MTROXY
            </span>
          </h1>
          <p className="text-slate-400">{t('subtitle')}</p>
        </div>

        {/* Main Control Card */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Configuration Summary */}
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('targetPattern')}</span>
              <div className="flex items-baseline gap-2 text-white text-lg">
                <span className="font-mono text-blue-400 font-bold">{config.count}</span> 
                <span className="text-slate-300">x</span>
                <span className="font-bold">{config.version}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700 uppercase">{config.type}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700 uppercase flex items-center gap-1">
                   <img src={`https://flagcdn.com/16x12/${config.country}.png`} alt={config.country} className="w-4 h-3 rounded-sm opacity-80" onError={(e) => e.currentTarget.style.display='none'} />
                   {config.country}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {t('duration')}: {config.period} {t('days')} • {t('tag')}: {config.description || t('none')}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">{t('walletBalance')}</span>
              <div className="flex items-center justify-end gap-2">
                <div className={`text-xl font-mono flex items-center gap-2 ${balance ? 'text-green-400' : 'text-slate-600'}`}>
                  <Wallet size={18} />
                  {balance || '---'}
                </div>
                <button 
                  onClick={() => fetchBalance(config)}
                  className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800/50"
                  title={t('refreshBalance')}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* The Big Button */}
          <button
            onClick={handleSmartAcquisition}
            disabled={isProcessing}
            className={`
              w-full h-24 rounded-xl text-2xl font-black tracking-widest uppercase transition-all duration-300 transform
              flex items-center justify-center gap-4 shadow-lg
              ${isProcessing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed scale-[0.98]' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/50 hover:scale-[1.02] hover:shadow-blue-500/30 active:scale-[0.98]'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={32} />
                {t('processing')}
              </>
            ) : (
              <>
                <Play fill="currentColor" size={32} />
                {t('executePurchase')}
              </>
            )}
          </button>

          {/* The Result Area */}
          {lastPurchased && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="bg-slate-950/80 rounded-xl border border-slate-700/80 p-1">
                 <div className="flex flex-col md:flex-row gap-1">
                    <div className="relative flex-grow group">
                      <div className="absolute top-0 left-0 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                        {t('purchasedProxy')}
                      </div>
                      <textarea
                        readOnly
                        value={lastPurchased}
                        className="w-full bg-transparent text-emerald-400 font-mono text-xl p-4 pt-7 outline-none resize-none min-h-[5rem]"
                        onClick={(e) => e.currentTarget.select()}
                        rows={lastPurchased.split('\n').length > 1 ? 3 : 1}
                      />
                    </div>
                    <button
                      onClick={handleCopyProxy}
                      className={`
                        md:w-24 shrink-0 rounded-lg flex flex-col items-center justify-center gap-1 transition-all
                        ${isCopied 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }
                      `}
                    >
                      {isCopied ? <Check size={24} /> : <Copy size={24} />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isCopied ? t('copied') : t('copy')}
                      </span>
                    </button>
                 </div>
               </div>
               <p className="text-center text-xs text-slate-500 mt-2 font-mono">{t('formatInfo')}</p>
            </div>
          )}
          
          {!config.apiKey && (
             <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 text-sm bg-amber-950/30 p-2 rounded border border-amber-900/50">
               <AlertCircle size={16} />
               <span>{t('setupRequired')}</span>
             </div>
          )}

        </div>

        {/* Logs */}
        <LogViewer logs={logs} />

      </div>
    </div>
  );
}