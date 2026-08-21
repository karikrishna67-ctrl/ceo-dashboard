import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';

interface PollingStatusBarProps {
  onManualRefresh: () => void;
  isRefreshing?: boolean;
}

export const PollingStatusBar: React.FC<PollingStatusBarProps> = ({
  onManualRefresh,
  isRefreshing = false,
}) => {
  const POLLING_INTERVAL_SECONDS = 300; // 5 minutes
  const [secondsRemaining, setSecondsRemaining] = useState<number>(POLLING_INTERVAL_SECONDS);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleTriggerSync = useCallback(() => {
    setSecondsRemaining(POLLING_INTERVAL_SECONDS);
    setLastUpdated(new Date());
    onManualRefresh();
  }, [onManualRefresh]);

  useEffect(() => {
    if (!isPollingActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleTriggerSync();
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPollingActive, handleTriggerSync]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      id="reports-polling-status-bar"
      className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-slate-800"
      role="status"
      aria-label="Real-time Financial Data Polling Telemetry"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <span className={`w-3 h-3 rounded-full ${isPollingActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {isPollingActive && (
            <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Leadership Telemetry</span>
            </span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              isPollingActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isPollingActive ? '5m Auto-Polling Active' : 'Polling Paused'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-0.5">
            Last verified against active ledger at <strong>{formatLastUpdated(lastUpdated)}</strong>. Next automatic refresh in{' '}
            <strong className="text-white font-mono">{formatCountdown(secondsRemaining)}</strong>.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          id="btn-toggle-polling"
          onClick={() => setIsPollingActive((prev) => !prev)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          aria-label={isPollingActive ? 'Pause 5-minute auto polling' : 'Resume 5-minute auto polling'}
          title={isPollingActive ? 'Pause automatic 5m background polling' : 'Resume automatic background polling'}
        >
          {isPollingActive ? (
            <>
              <Pause className="w-3 h-3 text-amber-400" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Resume</span>
            </>
          )}
        </button>

        <button
          type="button"
          id="btn-manual-sync-now"
          onClick={handleTriggerSync}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Force immediate data ledger refresh"
          title="Force immediate data sync from live business ledger"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
};
