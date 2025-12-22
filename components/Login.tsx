import React, { useState } from 'react';
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@mtroxy.com' && password === 'Mtroxy@2026!') {
      onLogin();
    } else {
      setError(t('invalidCredentials'));
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 blur-sm"></div>

          {/* Language Switcher */}
          <div className="absolute top-4 right-4 flex gap-1">
             <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('pt')}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'pt' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                PT
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${language === 'es' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ES
              </button>
          </div>

          <div className="text-center mb-8 space-y-2 mt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4 border border-slate-700">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t('loginTitle')}</h1>
            <p className="text-slate-400 text-sm">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold ml-1">{t('email')}</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="username@example"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold ml-1">{t('password')}</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 p-3 rounded-lg border border-red-900/30 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              <span>{t('loginButton')}</span>
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 font-mono">{t('loginFooter')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};