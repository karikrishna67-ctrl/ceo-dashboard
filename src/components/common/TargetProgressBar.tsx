import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { CurrencyCode } from '../../types';

interface TargetProgressBarProps {
  current: number;
  target: number;
  label?: string;
  subLabel?: string;
  quarterLabel?: string;
  currency?: CurrencyCode;
  unit?: string;
  size?: 'compact' | 'standard' | 'detailed';
  showMilestones?: boolean;
  showPacing?: boolean;
  timeElapsedPct?: number; // e.g. 66.7% for day 61 of 90 in quarter
  gradientVariant?: 'auto' | 'emerald' | 'indigo' | 'amber' | 'purple' | 'teal';
  className?: string;
}

export const TargetProgressBar: React.FC<TargetProgressBarProps> = ({
  current,
  target,
  label = 'Quarterly Target',
  subLabel,
  quarterLabel = 'Q3 Target',
  currency = 'INR',
  unit,
  size = 'standard',
  showMilestones = true,
  showPacing = true,
  timeElapsedPct = 66.7, // e.g. 2 months elapsed in 3-month quarter
  gradientVariant = 'auto',
  className = '',
}) => {
  const percent = target > 0 ? Math.round((current / target) * 1000) / 10 : 0;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const isAheadOfPace = percent >= timeElapsedPct;
  const gap = Math.max(0, target - current);

  // Mount animation state
  const [animatedWidth, setAnimatedWidth] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(clampedPercent);
    }, 50);
    return () => clearTimeout(timer);
  }, [clampedPercent]);

  // Gradient fill and status badge selection
  const getGradientFill = () => {
    if (gradientVariant === 'indigo') {
      return {
        gradient: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400',
        text: 'text-indigo-700',
        badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        glow: 'shadow-indigo-500/20',
      };
    }
    if (gradientVariant === 'purple') {
      return {
        gradient: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-400',
        text: 'text-purple-700',
        badge: 'bg-purple-50 text-purple-800 border-purple-200',
        glow: 'shadow-purple-500/20',
      };
    }
    if (gradientVariant === 'teal') {
      return {
        gradient: 'bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-400',
        text: 'text-teal-700',
        badge: 'bg-teal-50 text-teal-800 border-teal-200',
        glow: 'shadow-teal-500/20',
      };
    }
    if (gradientVariant === 'amber') {
      return {
        gradient: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400',
        text: 'text-amber-800',
        badge: 'bg-amber-50 text-amber-900 border-amber-200',
        glow: 'shadow-amber-500/20',
      };
    }

    // Auto based on performance tier
    if (percent >= 90) {
      return {
        gradient: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        glow: 'shadow-emerald-500/20',
      };
    }
    if (percent >= 75) {
      return {
        gradient: 'bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400',
        text: 'text-emerald-800',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        glow: 'shadow-emerald-500/20',
      };
    }
    if (percent >= 60) {
      return {
        gradient: 'bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-400',
        text: 'text-amber-800',
        badge: 'bg-amber-50 text-amber-900 border-amber-200',
        glow: 'shadow-amber-500/20',
      };
    }
    return {
      gradient: 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400',
      text: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      glow: 'shadow-rose-500/20',
    };
  };

  const status = getGradientFill();

  const currCode: CurrencyCode = (currency as CurrencyCode) || 'INR';
  const formattedCurrent = unit ? `${current} ${unit}` : formatCurrency(current, currCode);
  const formattedTarget = unit ? `${target} ${unit}` : formatCurrency(target, currCode);
  const formattedGap = unit ? `${gap} ${unit}` : formatCurrency(gap, currCode);

  // Compact Size (For KPI Cards)
  if (size === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Target className="w-3 h-3 text-amber-700 shrink-0" />
            <span className="truncate">{quarterLabel}: {formattedTarget}</span>
          </span>
          <span className={`font-bold font-mono-numeric ${status.text}`}>
            {percent}%
          </span>
        </div>

        {/* Progress Bar Track with Gradient Fill */}
        <div className="relative w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/70 p-[1px]">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-out shadow-xs ${status.gradient}`}
            style={{ width: `${animatedWidth}%` }}
          />
          {/* Pacing Marker */}
          {showPacing && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400/90 z-10"
              style={{ left: `${Math.min(100, timeElapsedPct)}%` }}
              title={`Quarter Pacing Marker (${timeElapsedPct}%)`}
            />
          )}
        </div>
      </div>
    );
  }

  // Detailed Size (For Hero Banners and Goal Tracking Modules)
  if (size === 'detailed') {
    return (
      <div className={`p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-3 ${className}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {label} ({quarterLabel})
              </span>
            </div>
            {subLabel && <p className="text-[11px] text-slate-500 mt-0.5">{subLabel}</p>}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${status.badge}`}>
              {percent}% Achieved
            </span>
            {isAheadOfPace ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hidden sm:inline-flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Ahead of Pace
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold hidden sm:inline-flex items-center gap-0.5">
                <AlertCircle className="w-2.5 h-2.5" /> Pace Lag
              </span>
            )}
          </div>
        </div>

        {/* Numbers Row */}
        <div className="flex items-baseline justify-between text-xs">
          <div>
            <span className="text-slate-500">Current QTD: </span>
            <span className="font-bold text-slate-900 font-mono-numeric text-sm">
              {formattedCurrent}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Quarterly Target: </span>
            <span className="font-bold text-slate-800 font-mono-numeric text-sm">
              {formattedTarget}
            </span>
          </div>
        </div>

        {/* Visual Multi-Layered Progress Bar with Gradient Fill */}
        <div className="relative">
          <div className="w-full bg-slate-200/90 h-3 rounded-full overflow-hidden border border-slate-300/70 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-out shadow-sm ${status.gradient}`}
              style={{ width: `${animatedWidth}%` }}
            />
          </div>

          {/* Time Elapsed Quarter Pacing Marker */}
          {showPacing && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-700 shadow-xs z-10"
              style={{ left: `${Math.min(100, timeElapsedPct)}%` }}
            >
              <div className="absolute -top-4 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-600 bg-white px-1 rounded shadow-2xs border border-slate-200">
                Pace {timeElapsedPct}%
              </div>
            </div>
          )}
        </div>

        {/* Milestone Ticks & Gap Callout */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="font-bold text-slate-700">100% Target</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-slate-500">
            {gap > 0 ? 'Remaining to hit Quarterly Target:' : 'Quarterly Target Exceeded!'}
          </span>
          <span className="font-bold font-mono-numeric text-slate-900">
            {gap > 0 ? formattedGap : `+${formatCurrency(current - target, currCode)} Ahead`}
          </span>
        </div>
      </div>
    );
  }

  // Standard Size (For Card Footers)
  return (
    <div className={`pt-2.5 mt-2 border-t border-slate-100 space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-600 flex items-center gap-1">
          <Target className="w-3 h-3 text-amber-700 shrink-0" />
          <span className="truncate">{quarterLabel}: {formattedTarget}</span>
        </span>
        <span className={`font-bold font-mono-numeric text-xs ${status.text}`}>
          {percent}%
        </span>
      </div>

      {/* Progress Bar Track with Gradient Fill */}
      <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/70 p-[1px]">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out shadow-xs ${status.gradient}`}
          style={{ width: `${animatedWidth}%` }}
        />
        {showPacing && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-500/70 z-10"
            style={{ left: `${Math.min(100, timeElapsedPct)}%` }}
            title={`Quarter Pacing (${timeElapsedPct}%)`}
          />
        )}
      </div>

      {/* Footer Subtext */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>QTD: <strong className="text-slate-800 font-mono-numeric">{formattedCurrent}</strong></span>
        <span>Gap: <strong className="text-amber-800 font-mono-numeric">{formattedGap}</strong></span>
      </div>
    </div>
  );
};
