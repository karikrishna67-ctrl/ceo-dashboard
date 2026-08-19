import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { CurrencyCode } from '../../types';

export interface WhyDiagnostic {
  kpiId: string;
  kpiLabel: string;
  currentValue: string;
  prevValue?: string;
  change: string;
  isPositive: boolean;
  question: string;
  primaryCause: {
    factor: string;
    variance: string;
    impactAmount?: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
  };
  contributors: {
    id: string;
    factor: string;
    variance: string;
    weightPct: number; // e.g. 45% of variance
    trend: 'down' | 'up' | 'flat';
    detail: string;
  }[];
  fixRecommendation: {
    title: string;
    actionType: 'task' | 'route' | 'whatsapp' | 'call';
    route?: string;
    actionOwner: string;
    expectedRecovery: string;
    step1: string;
    step2: string;
    step3: string;
    ctaLabel: string;
  };
}

interface AIWhyAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic: WhyDiagnostic | null;
  currency?: CurrencyCode;
  onExecuteFix?: (diagnostic: WhyDiagnostic) => void;
}

export const AIWhyAnalysisModal: React.FC<AIWhyAnalysisModalProps> = ({
  isOpen,
  onClose,
  diagnostic,
  currency = 'INR',
  onExecuteFix,
}) => {
  const [fixedState, setFixedState] = useState(false);

  if (!isOpen || !diagnostic) return null;

  const handleFix = () => {
    setFixedState(true);
    if (onExecuteFix) {
      onExecuteFix(diagnostic);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/90 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 pb-5 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Root-Cause Diagnosis
            </span>
            <span className="text-[10px] font-mono-numeric px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Confidence 96%
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
              [CALCULATED]
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{diagnostic.question}</span>
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
              <span className="text-slate-400 font-medium">{diagnostic.kpiLabel}:</span>
              <span className="font-bold text-white font-mono-numeric">{diagnostic.currentValue}</span>
            </div>
            <div
              className={`flex items-center gap-1 font-bold font-mono-numeric px-2.5 py-1 rounded-lg ${
                diagnostic.isPositive
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              {diagnostic.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{diagnostic.change} vs baseline</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Primary Cause Highlight */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Primary Root Contributor Detected</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                {diagnostic.primaryCause.severity} Impact
              </span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {diagnostic.primaryCause.factor} ({diagnostic.primaryCause.variance})
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {diagnostic.primaryCause.description}
            </p>
            {diagnostic.primaryCause.impactAmount && (
              <div className="pt-1 flex items-center gap-2 text-xs font-mono-numeric">
                <span className="text-slate-500 font-medium">Estimated Financial Drag:</span>
                <span className="font-bold text-rose-600">{diagnostic.primaryCause.impactAmount}</span>
              </div>
            )}
          </div>

          {/* Variance Breakdown Contributors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Multi-Factor Contribution Decomposition</span>
              </h3>
              <span className="text-[11px] text-slate-400">Weighted Influence</span>
            </div>

            <div className="space-y-2">
              {diagnostic.contributors.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{c.factor}</span>
                      <span
                        className={`text-[10px] font-mono-numeric font-bold px-1.5 py-0.2 rounded ${
                          c.trend === 'down'
                            ? 'text-rose-700 bg-rose-100'
                            : c.trend === 'up'
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-slate-700 bg-slate-200'
                        }`}
                      >
                        {c.variance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{c.detail}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 font-mono-numeric">{c.weightPct}%</div>
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${c.weightPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recovery Plan */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Recommended CEO Intervention
                </span>
              </div>
              <span className="text-[10px] font-mono-numeric text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                +{diagnostic.fixRecommendation.expectedRecovery} upside
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-white">
                {diagnostic.fixRecommendation.title}
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>{diagnostic.fixRecommendation.step1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>{diagnostic.fixRecommendation.step2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>{diagnostic.fixRecommendation.step3}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800 gap-3">
              <div className="text-[11px] text-slate-400">
                <span>Assigned Owner: </span>
                <span className="text-slate-200 font-semibold">{diagnostic.fixRecommendation.actionOwner}</span>
              </div>

              {fixedState ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Action Triggered & Queued</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleFix}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{diagnostic.fixRecommendation.ctaLabel || 'Fix This Problem'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span className="italic text-[11px]">
            AI root-cause model uses regression decomposition across all CRM, P&L and pipeline timestamps.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
