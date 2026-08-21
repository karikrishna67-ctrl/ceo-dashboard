import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Target,
  DollarSign,
  HelpCircle,
  TrendingDown,
  Info,
  Shield,
  Zap,
  Flame,
} from 'lucide-react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export interface RevenueTargetProgressItem {
  id: string;
  title: string;
  category: 'ARR' | 'MRR' | 'EXPANSION' | 'PIPELINE' | 'NET_MARGIN';
  currentValue: number;
  targetValue: number;
  unit: 'currency' | 'percent';
  nextMilestoneTitle: string;
  timeframe: string;
  colorTheme: 'amber' | 'emerald' | 'indigo' | 'blue' | 'purple';
  financialImpactTitle: string;
  financialImpactTrajectory: string;
  yearlyRevenueDelta: string;
  valuationImpact: string;
}

interface TargetMilestoneProgressBarProps {
  targets: RevenueTargetProgressItem[];
  currency: CurrencyCode;
}

export const TargetMilestoneProgressBar: React.FC<TargetMilestoneProgressBarProps> = ({
  targets,
  currency,
}) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  return (
    <div
      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5"
      role="region"
      aria-label="Active Financial Milestone Progress Tracker"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Active Revenue Target Progress & Trajectory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              {targets.length} Key Vectors Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time percentage progress toward next milestones with interactive <strong>Financial Impact</strong> insights on annual growth trajectories.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Calibrated Telemetry</span>
        </div>
      </div>

      {/* Target Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((item) => {
          const rawPct = (item.currentValue / (item.targetValue || 1)) * 100;
          const progressPct = Math.min(100, Math.round(rawPct));
          const isAchieved = item.currentValue >= item.targetValue;
          const remainingValue = Math.max(0, item.targetValue - item.currentValue);
          const isTooltipOpen = activeTooltipId === item.id;

          // Dynamic colors
          const themeGradient =
            item.colorTheme === 'emerald'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              : item.colorTheme === 'indigo'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              : item.colorTheme === 'blue'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : item.colorTheme === 'purple'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600'
              : 'bg-gradient-to-r from-amber-500 to-amber-600';

          const badgeStyle =
            item.colorTheme === 'emerald'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : item.colorTheme === 'indigo'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : item.colorTheme === 'blue'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : item.colorTheme === 'purple'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : 'bg-amber-50 text-amber-900 border-amber-200';

          return (
            <div
              key={item.id}
              tabIndex={0}
              aria-label={`${item.title}: ${progressPct}% to ${item.nextMilestoneTitle}. Current ${
                item.unit === 'currency'
                  ? formatCurrency(item.currentValue, currency)
                  : `${item.currentValue.toFixed(1)}%`
              }, Target ${
                item.unit === 'currency'
                  ? formatCurrency(item.targetValue, currency)
                  : `${item.targetValue.toFixed(1)}%`
              }`}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3 shadow-2xs relative"
            >
              {/* Header of Item */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.timeframe}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-black font-mono-numeric text-slate-900">
                      {progressPct}%
                    </div>
                    <div className="text-[10px] text-slate-500">of Milestone</div>
                  </div>

                  {/* Financial Impact Tooltip Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveTooltipId(isTooltipOpen ? null : item.id)}
                      onMouseEnter={() => setActiveTooltipId(item.id)}
                      className="p-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 hover:border-amber-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      aria-label={`View Financial Impact for ${item.title}`}
                      title="View Financial Impact on Company Trajectory"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline text-[10px]">Impact</span>
                    </button>

                    {/* Popover / Tooltip */}
                    {isTooltipOpen && (
                      <div
                        onMouseLeave={() => setActiveTooltipId(null)}
                        className="absolute right-0 top-8 z-30 w-72 sm:w-80 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Financial Impact on Trajectory</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTooltipId(null);
                            }}
                            className="text-slate-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-100">{item.financialImpactTitle}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                            {item.financialImpactTrajectory}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                            <div className="text-slate-400">Yearly Revenue Delta</div>
                            <div className="font-mono-numeric font-black text-emerald-400 mt-0.5">
                              {item.yearlyRevenueDelta}
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                            <div className="text-slate-400">Valuation Multiple</div>
                            <div className="font-mono-numeric font-black text-indigo-300 mt-0.5">
                              {item.valuationImpact}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar with milestone ticks */}
              <div className="space-y-1.5">
                <div className="relative w-full bg-slate-200/80 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full ${themeGradient} transition-all duration-700`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Milestone tick indicator labels */}
                <div className="flex items-center justify-between text-[11px] font-mono-numeric">
                  <span className="font-bold text-slate-700">
                    Current:{' '}
                    {item.unit === 'currency'
                      ? formatCurrency(item.currentValue, currency)
                      : `${item.currentValue.toFixed(1)}%`}
                  </span>

                  <span className="text-slate-500 font-medium">
                    Target:{' '}
                    <strong className="text-slate-800">
                      {item.unit === 'currency'
                        ? formatCurrency(item.targetValue, currency)
                        : `${item.targetValue.toFixed(1)}%`}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Next Milestone Summary Footer */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 flex items-center gap-1 truncate max-w-[220px] sm:max-w-[260px]">
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">Next: <strong>{item.nextMilestoneTitle}</strong></span>
                </span>

                {isAchieved ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Target Hit</span>
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold font-mono-numeric shrink-0">
                    {item.unit === 'currency'
                      ? `${formatCurrency(remainingValue, currency)} to unlock`
                      : `${remainingValue.toFixed(1)}% gap`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
