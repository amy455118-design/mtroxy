import React from 'react';
import { AppConfig, ProxyType, ProxyVersion } from '../types';
import { COUNTRY_LIST } from '../constants';
import { Settings, Save, AlertTriangle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../translations';

interface SettingsPanelProps {
  config: AppConfig;
  isOpen: boolean;
  onToggle: () => void;
  onSave: (newConfig: AppConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, isOpen, onToggle, onSave }) => {
  const { t, language, setLanguage } = useLanguage();
  const [localConfig, setLocalConfig] = React.useState<AppConfig>(config);
  
  // Sync local state when props change
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (field: keyof AppConfig, value: string | number | boolean) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onToggle();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        className="fixed top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-50 bg-slate-800 rounded-full shadow-lg border border-slate-700"
        title={t('configuration')}
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-end transition-all">
      <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-700 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-blue-500" />
            {t('configuration')}
          </h2>
          <button onClick={onToggle} className="text-slate-400 hover:text-white">{t('close')}</button>
        </div>

        <div className="space-y-6">

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
              <Globe size={14} /> {t('language')}
            </label>
            <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${language === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('pt')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${language === 'pt' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                Português
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${language === 'es' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                Español
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800 my-2" />

          {/* API Key Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">{t('apiKey')}</label>
            <input 
              type="password" 
              value={localConfig.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter Proxy6 API Key"
            />
            <p className="text-xs text-slate-500">{t('apiKeyNote')}</p>
          </div>

          <div className="h-px bg-slate-800 my-4" />

          {/* The Pattern Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">{t('purchasePattern')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">{t('proxyVersion')}</label>
                <select 
                  value={localConfig.version}
                  onChange={(e) => handleChange('version', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value={ProxyVersion.IPv6}>IPv6</option>
                  <option value={ProxyVersion.IPv4}>IPv4</option>
                  <option value={ProxyVersion.IPv4Shared}>IPv4 Shared</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">{t('protocol')}</label>
                <select 
                  value={localConfig.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                >
                  <option value={ProxyType.HTTP}>HTTPs</option>
                  <option value={ProxyType.SOCKS}>SOCKS5</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{t('country')}</label>
              <select 
                value={localConfig.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
              >
                {COUNTRY_LIST.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">{t('quantity')}</label>
                <input 
                  type="number" 
                  min="1"
                  max="1000"
                  value={localConfig.count}
                  onChange={(e) => handleChange('count', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">{t('period')}</label>
                <input 
                  type="number" 
                  min="1"
                  value={localConfig.period}
                  onChange={(e) => handleChange('period', parseInt(e.target.value) || 30)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{t('descriptionTag')}</label>
              <input 
                type="text" 
                value={localConfig.description}
                onChange={(e) => handleChange('description', e.target.value)}
                maxLength={50}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                placeholder="e.g. pattern-1"
              />
            </div>

             <div className="flex items-center gap-3 pt-2">
              <input 
                id="autoprolong"
                type="checkbox" 
                checked={localConfig.autoProlong}
                onChange={(e) => handleChange('autoProlong', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500"
              />
              <label htmlFor="autoprolong" className="text-sm text-slate-300">{t('autoProlong')}</label>
            </div>
          </div>

           <div className="h-px bg-slate-800 my-4" />
           
           <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
             <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-500 shrink-0" size={16} />
                <div className="space-y-2">
                   <p className="text-xs text-yellow-200">
                    {t('corsNote')}
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      id="corsproxy"
                      type="checkbox" 
                      checked={localConfig.useCorsProxy}
                      onChange={(e) => handleChange('useCorsProxy', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500"
                    />
                    <label htmlFor="corsproxy" className="text-sm text-yellow-100 font-medium">{t('useCors')}</label>
                  </div>
                </div>
             </div>
           </div>

          <div className="pt-6">
            <button 
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              <Save size={18} />
              {t('saveConfig')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};