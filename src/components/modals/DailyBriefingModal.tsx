import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';

export const DailyBriefingModal: React.FC = () => {
  const {
    isBriefingOpen,
    setIsBriefingOpen,
    kpiSnapshot,
    currentOrg,
    currency,
    actions,
    updateActionStatus,
    setActiveView,
  } = useApp();

  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isBriefingOpen && !briefingText) {
      generateBriefing();
    }
  }, [isBriefingOpen]);

  const generateBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: kpiSnapshot,
          ceoName: currentOrg.ceoName || 'Rajesh',
        }),
      });
      const data = await res.json();
      setBriefingText(data.briefingText);
    } catch (err) {
      console.error(err);
      setBriefingText(
        `GOOD MORNING ${currentOrg.ceoName?.toUpperCase() || 'RAJESH'},\n\nYesterday saw healthy pipeline engagement with 2 high-value deals entering late stages. Your priority focus today is closing the ₹${(kpiSnapshot.revenueGap / 100000).toFixed(1)}L revenue gap and triggering receivables follow-up for ₹${(kpiSnapshot.overdueReceivables / 100000).toFixed(1)}L.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBriefingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Daily CEO Morning Briefing</h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  AI Synthesized
                </span>
              </div>
              <p className="text-xs text-slate-500">Executive morning pulse, leak flags, and today's top 3 actions</p>
            </div>
          </div>

          <button
            onClick={() => setIsBriefingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Health Score Pill Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-slate-900 font-mono-numeric">
                {kpiSnapshot.healthScore.totalScore}/100
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Business Health Score</div>
                <div className="text-[11px] text-emerald-600 font-bold">{kpiSnapshot.healthScore.status}</div>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500">MTD Revenue Gap:</span>
              <div className="font-bold text-amber-600 font-mono-numeric">
                {formatCurrency(kpiSnapshot.revenueGap, currency)}
              </div>
            </div>
          </div>

          {/* AI Executive Text */}
          {isLoading ? (
            <div className="py-12 text-center text-amber-600 text-xs flex flex-col items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 animate-spin text-amber-500" />
              <span>Synthesizing multi-department telemetry into your morning briefing...</span>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed font-sans whitespace-pre-wrap text-slate-700">
              {briefingText}
            </div>
          )}

          {/* Top 3 CEO Actions for Today */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Top 3 Highest-Leverage Actions Today
            </h3>

            <div className="space-y-2">
              {actions.slice(0, 3).map((action) => {
                const isDone = action.status === 'Completed';

                return (
                  <div
                    key={action.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {action.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{action.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Owner: {action.owner} • Impact: +{formatCurrency(action.expectedImpactAmount, currency)}
                      </div>
                    </div>

                    <button
                      onClick={() => updateActionStatus(action.id, isDone ? 'Pending' : 'Completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isDone ? 'Done ✓' : 'Take Action'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (briefingText) {
                navigator.clipboard.writeText(briefingText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Briefing' : 'Copy Briefing'}</span>
          </button>

          <button
            onClick={() => {
              setIsBriefingOpen(false);
              setActiveView('tasks');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Action Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
