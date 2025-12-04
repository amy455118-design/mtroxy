import React, { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from './constants';
import { AppConfig, LogEntry, ProxyItem } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { LogViewer } from './components/LogViewer';
import { buyProxies, checkBalance, getProxies, getPrice, setProxyDescription } from './services/proxy6Service';
import { Play, ShieldCheck, Wallet, Loader2, AlertCircle, Copy, Check } from 'lucide-react';

// Helper to delay execution to avoid rate limits (max 3 req/sec -> safe 400ms delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  
  // State for the big output field
  const [lastPurchased, setLastPurchased] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Load Config
  useEffect(() => {
    const saved = localStorage.getItem('proxy6_automator_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  // Save Config
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('proxy6_automator_config', JSON.stringify(newConfig));
    addLog('info', 'Configuration saved.');
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
        addLog('info', `Balance updated: ${res.balance} ${res.currency}`);
        return parseFloat(res.balance);
      } else {
        setBalance(null);
        if (res.error) addLog('error', `Balance Check Failed: ${res.error}`);
        return 0;
      }
    } catch (e: any) {
      if ((e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) && !cfg.useCorsProxy) {
        addLog('warning', 'Network error detected. Auto-enabling CORS proxy...');
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
    try {
      await navigator.clipboard.writeText(lastPurchased);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      addLog('info', 'Proxy copied to clipboard');
    } catch (err) {
      addLog('error', 'Failed to copy to clipboard');
    }
  };

  // Smart Acquisition Logic
  const handleSmartAcquisition = async () => {
    if (!config.apiKey) {
      addLog('error', 'API Key is missing. Please check settings.');
      setIsSettingsOpen(true);
      return;
    }

    setIsProcessing(true);
    setLastPurchased('');
    addLog('info', 'Starting smart acquisition sequence...');

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
        addLog('warning', 'Could not fetch current pricing. Proceeding with caution.');
      }

      // 2. Fetch Active Proxies to Reuse
      addLog('info', 'Checking inventory for reusable proxies...');
      const inventoryRes = await getProxies(currentConfig, 'active');
      const inventory = inventoryRes.list ? Object.values(inventoryRes.list) : [];
      
      const nowUnix = Math.floor(Date.now() / 1000);

      // Filter candidates: Must match Version, Country, Type AND be valid (not expired)
      const candidates = inventory.filter(p => {
        // Note: API might return "ipv6" or "6", handled loosely if needed, but usually strictly matches API constants
        // API returns type as "http" or "socks", config has "http" or "socks"
        
        // Infer version from IP structure.
        const isV6 = p.ip.includes(':');
        const configIsV6 = config.version === '6';
        
        const matchesConfig = (
          isV6 === configIsV6 && 
          p.country === config.country && 
          p.type === config.type
        );
        
        // Strict expiration check
        // p.unixtime_end is in seconds.
        const isActive = p.active === '1';
        const isNotExpired = p.unixtime_end ? p.unixtime_end > nowUnix : true;
        
        return matchesConfig && isActive && isNotExpired;
      });
      
      // Sort candidates: Newest purchase date first
      // Date format is "YYYY-MM-DD HH:mm:ss", so string comparison is valid for chronological sort.
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

            addLog('info', `Reusing proxy ${proxy.host}:${proxy.port} (${newUsage}/3)`);
            
            // Call API to update description
            await setProxyDescription(currentConfig, proxy.id, newDescr);
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
           addLog('warning', `Low balance! Need ~${estimatedCost}, have ${currentBalance}. Attempting purchase anyway...`);
        }

        addLog('info', `Buying ${needed} new prox${needed > 1 ? 'ies' : 'y'}...`);

        // Prepare description: "1/3" for new proxies
        const initDescr = `${config.description || ''} 1/3`.trim();
        
        const buyRes = await buyProxies(currentConfig, needed, initDescr);

        if (buyRes.status === 'yes' && buyRes.list) {
            const newIds = Object.keys(buyRes.list);
            addLog('success', `Bought ${newIds.length} new proxies. Order #${buyRes.order_id}`);
            
            Object.values(buyRes.list).forEach(p => {
                acquiredProxies.push({ ...p, descr: initDescr });
            });
            
            // Update balance
            if (buyRes.balance) setBalance(`${buyRes.balance} ${buyRes.currency}`);
        } else {
            addLog('error', `Purchase failed: ${buyRes.error || 'Unknown error'}`);
        }
      }

      // 5. Finalize Output
      if (acquiredProxies.length > 0) {
        // Format: Host:Port:User:Pass
        const formattedList = acquiredProxies.map((p: ProxyItem) => `${p.host}:${p.port}:${p.user}:${p.pass}`).join('\n');
        setLastPurchased(formattedList);
        
        // Copy first one to clipboard automatically if only 1 requested (as implied by singular button usage)
        if (acquiredProxies.length === 1) {
            navigator.clipboard.writeText(formattedList).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
                addLog('success', 'Proxy copied to clipboard automatically');
            }).catch(() => {});
        } else {
             addLog('success', `Acquired ${acquiredProxies.length} proxies.`);
        }
      } else {
        addLog('warning', 'No proxies acquired.');
      }

    } catch (error: any) {
       addLog('error', 'Process failed', error.message);
       if (error.message?.includes('Failed to fetch') && !currentConfig.useCorsProxy) {
           addLog('warning', 'Check internet or enable CORS proxy in settings.');
       }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      
      <SettingsPanel 
        config={config} 
        isOpen={isSettingsOpen} 
        onToggle={() => setIsSettingsOpen(!isSettingsOpen)} 
        onSave={handleSaveConfig}
      />

      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header Area */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <ShieldCheck className="text-blue-500" size={40} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PROXY AUTOMATOR
            </span>
          </h1>
          <p className="text-slate-400">Smart Purchasing Tool (Reuse Logic Active)</p>
        </div>

        {/* Main Control Card */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Configuration Summary */}
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Pattern</span>
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
                Duration: {config.period} days • Tag: {config.description || 'None'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Wallet Balance</span>
              <div className={`text-xl font-mono flex items-center justify-end gap-2 ${balance ? 'text-green-400' : 'text-slate-600'}`}>
                <Wallet size={18} />
                {balance || '---'}
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
                Processing...
              </>
            ) : (
              <>
                <Play fill="currentColor" size={32} />
                EXECUTE PURCHASE
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
                        Purchased Proxy
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
                        {isCopied ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                 </div>
               </div>
               <p className="text-center text-xs text-slate-500 mt-2 font-mono">Format: IP:PORT:LOGIN:PASSWORD</p>
            </div>
          )}
          
          {!config.apiKey && (
             <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 text-sm bg-amber-950/30 p-2 rounded border border-amber-900/50">
               <AlertCircle size={16} />
               <span>Setup required: Please configure your API Key in settings.</span>
             </div>
          )}

        </div>

        {/* Logs */}
        <LogViewer logs={logs} />

      </div>
    </div>
  );
}