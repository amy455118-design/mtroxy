import React from 'react';
import { LogEntry } from '../types';
import { Terminal, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch(type) {
      case 'success': return <CheckCircle size={14} className="text-green-500" />;
      case 'error': return <AlertCircle size={14} className="text-red-500" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-500" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };

  const getTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 flex flex-col h-64 shadow-inner">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
        <Terminal size={14} className="text-slate-500" />
        <span className="text-xs font-mono text-slate-500 uppercase">System Logs</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-3">
        {logs.length === 0 && (
          <div className="text-slate-600 text-center italic mt-10">No activity recorded</div>
        )}
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
             <span className="text-slate-600 text-xs mt-0.5 shrink-0 select-none">{getTime(log.timestamp)}</span>
             <div className="mt-0.5 shrink-0">{getIcon(log.type)}</div>
             <div className="break-all">
               <p className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                 {log.message}
               </p>
               {log.details && (
                 <pre className="mt-1 text-xs text-slate-500 bg-slate-900 p-2 rounded border border-slate-800/50 overflow-x-auto">
                   {log.details}
                 </pre>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
