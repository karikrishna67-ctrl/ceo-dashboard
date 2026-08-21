import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Flame,
  Rocket,
  Shield,
  Zap,
  Gem,
  Target,
  Compass,
  Award,
  Star,
  TrendingUp,
  Lock,
  Unlock,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Plus,
  Play,
  Layers,
  ChevronRight,
  PartyPopper,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';
import {
  COMPANY_MILESTONES,
  PROGRESS_BADGES,
  MilestoneTier,
  ProgressBadge,
} from '../../data/gamificationData';
import {
  TargetMilestoneProgressBar,
  RevenueTargetProgressItem,
} from '../gamification/TargetMilestoneProgressBar';

const ICON_MAP = {
  Trophy,
  Crown,
  Flame,
  Rocket,
  Shield,
  Zap,
  Gem,
  Target,
  Compass,
  Award,
  Star,
  TrendingUp,
};

export const GamificationDashboardView: React.FC = () => {
  const { currentOrg, currency, kpiSnapshot, addToast } = useApp();

  // Growth Simulator Sliders State
  const [simulatedGrowthPct, setSimulatedGrowthPct] = useState<number>(0);
  const [simulatedMarginShiftPct, setSimulatedMarginShiftPct] = useState<number>(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<ProgressBadge | null>(null);

  // Baseline metrics derived from kpiSnapshot
  const baselineARR = kpiSnapshot.arr || kpiSnapshot.revenueMTD * 12 || 12000000;
  const baselineMRR = kpiSnapshot.mrr || kpiSnapshot.revenueMTD || 1000000;
  const baselineMargin = kpiSnapshot.grossMarginPct || 82;
  const baselineLTVCAC = 3.8;
  const baselineRunway = kpiSnapshot.cashRunwayMonths || 16.5;
  const baselineNRR = 108.5;
  const baselineWinRate = kpiSnapshot.winRatePct || 24;

  // Live or Simulated Values
  const effectiveARR = useMemo(() => {
    return baselineARR * (1 + simulatedGrowthPct / 100);
  }, [baselineARR, simulatedGrowthPct]);

  const effectiveMRR = useMemo(() => {
    return baselineMRR * (1 + simulatedGrowthPct / 100);
  }, [baselineMRR, simulatedGrowthPct]);

  const effectiveGrossMargin = useMemo(() => {
    return Math.min(95, Math.max(10, baselineMargin + simulatedMarginShiftPct));
  }, [baselineMargin, simulatedMarginShiftPct]);

  const effectiveLTVCAC = useMemo(() => {
    return baselineLTVCAC * (1 + simulatedGrowthPct / 200);
  }, [baselineLTVCAC, simulatedGrowthPct]);

  const effectiveRunway = useMemo(() => {
    return baselineRunway;
  }, [baselineRunway]);

  const effectiveNRR = useMemo(() => {
    return baselineNRR;
  }, [baselineNRR]);

  const effectiveWinRate = useMemo(() => {
    return baselineWinRate;
  }, [baselineWinRate]);

  // Current Milestone Tier calculation
  const currentMilestoneIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < COMPANY_MILESTONES.length; i++) {
      if (effectiveARR >= COMPANY_MILESTONES[i].targetARR) {
        index = i;
      }
    }
    return index;
  }, [effectiveARR]);

  const currentMilestone = COMPANY_MILESTONES[currentMilestoneIndex];
  const nextMilestone = COMPANY_MILESTONES[Math.min(COMPANY_MILESTONES.length - 1, currentMilestoneIndex + 1)];
  const isMaxTier = currentMilestoneIndex === COMPANY_MILESTONES.length - 1 && effectiveARR >= nextMilestone.targetARR;

  const milestoneProgressPct = useMemo(() => {
    if (isMaxTier) return 100;
    const prevTarget = currentMilestoneIndex > 0 ? COMPANY_MILESTONES[currentMilestoneIndex].targetARR : 0;
    const nextTarget = nextMilestone.targetARR;
    const progress = ((effectiveARR - prevTarget) / (nextTarget - prevTarget)) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }, [effectiveARR, currentMilestoneIndex, nextMilestone, isMaxTier]);

  // Evaluate Badges Unlock Status
  const evaluatedBadges = useMemo(() => {
    return PROGRESS_BADGES.map((badge) => {
      let isUnlocked = false;
      let currentValue = 0;
      let progressPct = 0;

      switch (badge.metricKey) {
        case 'arr':
          currentValue = effectiveARR;
          isUnlocked = effectiveARR >= badge.targetValue;
          progressPct = Math.min(100, (effectiveARR / badge.targetValue) * 100);
          break;
        case 'mrr':
          currentValue = effectiveMRR;
          isUnlocked = effectiveMRR >= badge.targetValue;
          progressPct = Math.min(100, (effectiveMRR / badge.targetValue) * 100);
          break;
        case 'grossMargin':
          currentValue = effectiveGrossMargin;
          isUnlocked = effectiveGrossMargin >= badge.targetValue;
          progressPct = Math.min(100, (effectiveGrossMargin / badge.targetValue) * 100);
          break;
        case 'ltvCac':
          currentValue = effectiveLTVCAC;
          isUnlocked = effectiveLTVCAC >= badge.targetValue;
          progressPct = Math.min(100, (effectiveLTVCAC / badge.targetValue) * 100);
          break;
        case 'runway':
          currentValue = effectiveRunway;
          isUnlocked = effectiveRunway >= badge.targetValue;
          progressPct = Math.min(100, (effectiveRunway / badge.targetValue) * 100);
          break;
        case 'nrr':
          currentValue = effectiveNRR;
          isUnlocked = effectiveNRR >= badge.targetValue;
          progressPct = Math.min(100, (effectiveNRR / badge.targetValue) * 100);
          break;
        case 'winRate':
          currentValue = effectiveWinRate;
          isUnlocked = effectiveWinRate >= badge.targetValue;
          progressPct = Math.min(100, (effectiveWinRate / badge.targetValue) * 100);
          break;
        default:
          isUnlocked = false;
      }

      return {
        ...badge,
        isUnlocked,
        currentValue,
        progressPct: Math.round(progressPct),
      };
    });
  }, [effectiveARR, effectiveMRR, effectiveGrossMargin, effectiveLTVCAC, effectiveRunway, effectiveNRR, effectiveWinRate]);

  const unlockedCount = evaluatedBadges.filter((b) => b.isUnlocked).length;
  const totalXP = evaluatedBadges.filter((b) => b.isUnlocked).reduce((acc, b) => acc + b.xpReward, 0);

  const filteredBadges = useMemo(() => {
    if (activeCategoryFilter === 'ALL') return evaluatedBadges;
    if (activeCategoryFilter === 'UNLOCKED') return evaluatedBadges.filter((b) => b.isUnlocked);
    if (activeCategoryFilter === 'LOCKED') return evaluatedBadges.filter((b) => !b.isUnlocked);
    return evaluatedBadges.filter((b) => b.category === activeCategoryFilter);
  }, [evaluatedBadges, activeCategoryFilter]);

  const handleApplyPresetSimulation = (growth: number, margin: number, label: string) => {
    setSimulatedGrowthPct(growth);
    setSimulatedMarginShiftPct(margin);
    addToast({
      title: 'Milestone Simulator Active',
      message: `Simulating ${label}: +${growth}% ARR growth, +${margin}% margin shift`,
      type: 'info',
    });
  };

  const handleResetSimulation = () => {
    setSimulatedGrowthPct(0);
    setSimulatedMarginShiftPct(0);
    addToast({
      title: 'Simulator Reset',
      message: 'Reset milestone growth simulator to active baseline',
      type: 'info',
    });
  };

  // Active Financial Targets for Progress Bars with Financial Impact Tooltip metadata
  const activeRevenueTargets: RevenueTargetProgressItem[] = useMemo(() => {
    return [
      {
        id: 'target-arr-milestone',
        title: 'Annualized Recurring Revenue (ARR)',
        category: 'ARR',
        currentValue: effectiveARR,
        targetValue: nextMilestone.targetARR,
        unit: 'currency',
        nextMilestoneTitle: nextMilestone.name,
        timeframe: 'FY26 Run Rate Goal',
        colorTheme: 'amber',
        financialImpactTitle: `Surpassing ${nextMilestone.name}`,
        financialImpactTrajectory: nextMilestone.financialImpactTrajectory,
        yearlyRevenueDelta: `+${formatCurrency(nextMilestone.targetARR - effectiveARR, currency)}/yr`,
        valuationImpact: '6.5x - 8.2x ARR Multiple',
      },
      {
        id: 'target-mrr-runrate',
        title: 'Monthly Recurring Revenue (MRR)',
        category: 'MRR',
        currentValue: effectiveMRR,
        targetValue: nextMilestone.targetMRR,
        unit: 'currency',
        nextMilestoneTitle: `Tier ${nextMilestone.level} Monthly Velocity`,
        timeframe: 'Monthly Target Pace',
        colorTheme: 'indigo',
        financialImpactTitle: 'Predictable Monthly Run-Rate Expansion',
        financialImpactTrajectory: 'Hitting this MRR milestone guarantees recurring cash inflows to fund 4 additional engineering hires without dilution.',
        yearlyRevenueDelta: `+${formatCurrency((nextMilestone.targetMRR - effectiveMRR) * 12, currency)}/yr`,
        valuationImpact: 'Lifts Monthly Cash Flow Stability',
      },
      {
        id: 'target-gross-margin',
        title: 'Gross Margin Optimization Benchmark',
        category: 'NET_MARGIN',
        currentValue: effectiveGrossMargin,
        targetValue: 85.0,
        unit: 'percent',
        nextMilestoneTitle: 'Tier 4 Institutional Baseline (85.0%)',
        timeframe: 'Q3 Margin Audit',
        colorTheme: 'emerald',
        financialImpactTitle: 'Operating Leverage & Free Cash Generation',
        financialImpactTrajectory: 'Each +1% gross margin improvement translates directly into +₹1.2L additional annual EBITDA profit for reinvestment.',
        yearlyRevenueDelta: '+₹14.4L Annual EBITDA Gain',
        valuationImpact: '+1.5x Premium on Profit Multiple',
      },
      {
        id: 'target-pipeline-coverage',
        title: 'Sales Pipeline Velocity & Quota Value',
        category: 'PIPELINE',
        currentValue: (kpiSnapshot.pipelineValue || 2400000) * (1 + simulatedGrowthPct / 100),
        targetValue: effectiveARR * 0.45,
        unit: 'currency',
        nextMilestoneTitle: '3x Quota Pipeline Coverage',
        timeframe: 'Deal Velocity',
        colorTheme: 'blue',
        financialImpactTitle: 'De-risked Forward Revenue Pipeline',
        financialImpactTrajectory: 'Maintaining 3x pipeline coverage ensures 94%+ quarterly target predictability against customer churn and extended sales cycles.',
        yearlyRevenueDelta: '+₹42.0L Closed Bookings/yr',
        valuationImpact: 'Predictable Revenue Forecast Score',
      },
    ];
  }, [
    effectiveARR,
    effectiveMRR,
    effectiveGrossMargin,
    nextMilestone,
    kpiSnapshot.pipelineValue,
    simulatedGrowthPct,
    currency,
  ]);

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200"
      role="region"
      aria-label="Executive Gamification & Milestone Dashboard"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Gamification & Growth Engine</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
              Level {currentMilestone.level} Enterprise
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>{currentOrg.name} Milestone Quest</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Track real-time and simulated revenue growth across 5 institutional company stages. Unlock exclusive operational capabilities, executive badges, and financial impact trajectories.
          </p>
        </div>

        {/* Level and XP Badge */}
        <div className="flex items-center gap-4 z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[130px] shadow-lg">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Total XP Earned</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono-numeric mt-0.5">
              {totalXP.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {unlockedCount} / {evaluatedBadges.length} Badges
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black rounded-2xl p-4 text-center min-w-[130px] shadow-lg border border-amber-300/40">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-950/80">Active Stage</div>
            <div className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
              Tier {currentMilestone.level}
            </div>
            <div className="text-[10px] font-extrabold text-amber-950/90 truncate max-w-[120px]">
              {currentMilestone.name}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Simulation Sandbox Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Milestone Growth Simulator</h2>
              <p className="text-xs text-slate-500">
                Simulate revenue expansion and profit margin shifts to test upcoming milestone unlocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyPresetSimulation(25, 5, 'Series A Stretch')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
            >
              +25% Stretch
            </button>
            <button
              type="button"
              onClick={() => handleApplyPresetSimulation(60, 10, 'Hyper-Scale Double')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer border border-amber-200"
            >
              +60% Hyper-Scale
            </button>
            {(simulatedGrowthPct !== 0 || simulatedMarginShiftPct !== 0) && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ARR Growth Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated ARR Growth (%):</span>
              <span className="font-mono-numeric font-black text-indigo-600">
                {simulatedGrowthPct > 0 ? `+${simulatedGrowthPct}%` : `${simulatedGrowthPct}%`} (
                {formatCurrency(effectiveARR, currency)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={simulatedGrowthPct}
              onChange={(e) => setSimulatedGrowthPct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Baseline ({formatCurrency(baselineARR, currency)})</span>
              <span>+100% (2x)</span>
              <span>+200% (3x)</span>
            </div>
          </div>

          {/* Gross Margin Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Simulated Gross Margin Shift:</span>
              <span className="font-mono-numeric font-black text-emerald-600">
                {effectiveGrossMargin.toFixed(1)}% ({simulatedMarginShiftPct > 0 ? `+${simulatedMarginShiftPct}%` : `${simulatedMarginShiftPct}%`})
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="25"
              step="1"
              value={simulatedMarginShiftPct}
              onChange={(e) => setSimulatedMarginShiftPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-15% Stress</span>
              <span>Baseline ({baselineMargin}%)</span>
              <span>+25% Optimization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Financial Milestone Progress Bars Component with Financial Impact Tooltips */}
      <TargetMilestoneProgressBar
        targets={activeRevenueTargets}
        currency={currency}
      />

      {/* Main Milestone Progress Journey */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              <span>Company Milestone Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Next Goal: Reach <strong>{nextMilestone.name}</strong> ({formatCurrency(nextMilestone.targetARR, currency)} ARR).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Next Milestone Progress:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgressPct}%` }}
                />
              </div>
              <span className="font-mono-numeric font-black text-xs text-slate-900">
                {milestoneProgressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* 5 Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COMPANY_MILESTONES.map((m, idx) => {
            const isCompleted = effectiveARR >= m.targetARR;
            const isCurrent = m.level === currentMilestone.level && !isCompleted;
            const isUpcoming = m.level > currentMilestone.level;

            return (
              <div
                key={m.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                    : isCurrent
                    ? 'bg-amber-50/50 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                {/* Completed Stamp */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Unlocked</span>
                  </div>
                )}

                {!isCompleted && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Tier {m.level}</span>
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Tier {m.level}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug">{m.name}</h3>
                  <div className="text-base font-black font-mono-numeric text-indigo-700">
                    {formatCurrency(m.targetARR, currency)}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{m.stageName}</p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 mt-4 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Unlocked Perks ({m.perks.length})
                  </div>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    {m.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span className="truncate">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-800">+{m.rewardPoints} XP</span>
                    {isCompleted ? (
                      <span className="text-emerald-700 font-bold">100% Achieved</span>
                    ) : (
                      <span className="text-slate-500 font-mono-numeric">
                        {Math.min(100, Math.round((effectiveARR / m.targetARR) * 100))}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges and Trophies Showcase */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Unlockable Achievement Badges</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                {unlockedCount} / {evaluatedBadges.length} Unlocked
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Earn institutional badges by surpassing key revenue, margin, and unit economics thresholds.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'UNLOCKED', 'LOCKED', 'REVENUE', 'EFFICIENCY', 'RETENTION', 'SCALE', 'MASTERY'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const IconComponent = ICON_MAP[badge.iconName] || Trophy;

            const tierColor =
              badge.tierLevel === 'DIAMOND'
                ? 'from-blue-600 to-indigo-700 text-white'
                : badge.tierLevel === 'PLATINUM'
                ? 'from-purple-600 to-indigo-600 text-white'
                : badge.tierLevel === 'GOLD'
                ? 'from-amber-400 to-amber-600 text-slate-950'
                : badge.tierLevel === 'SILVER'
                ? 'from-slate-300 to-slate-400 text-slate-900'
                : 'from-amber-700 to-amber-900 text-white';

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`rounded-2xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  badge.isUnlocked
                    ? 'bg-white border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 opacity-75'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      badge.isUnlocked
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1'
                        : 'bg-slate-200 text-slate-600 flex items-center gap-1'
                    }`}
                  >
                    {badge.isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-700" />
                        <span>Unlocked</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked</span>
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-mono-numeric font-bold text-amber-700">
                    +{badge.xpReward} XP
                  </span>
                </div>

                {/* Badge Icon and Title */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tierColor} flex items-center justify-center shrink-0 shadow-md ${
                      !badge.isUnlocked ? 'grayscale opacity-70' : ''
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{badge.title}</h3>
                    <div className="text-[11px] font-bold text-indigo-700">{badge.thresholdText}</div>
                    <p className="text-xs text-slate-500 line-clamp-2">{badge.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="font-mono-numeric font-bold text-slate-800">
                      {badge.progressPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        badge.isUnlocked ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${badge.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Badge Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 mx-auto flex items-center justify-center shadow-lg">
              {React.createElement(ICON_MAP[selectedBadge.iconName] || Trophy, { className: 'w-8 h-8' })}
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                {selectedBadge.tierLevel} TIER BADGE
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">{selectedBadge.title}</h3>
              <p className="text-xs text-slate-500">{selectedBadge.description}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Requirement:</span>
                <span className="font-bold text-slate-900">{selectedBadge.thresholdText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Financial Impact:</span>
                <span className="font-bold text-emerald-700">{selectedBadge.financialImpact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">XP Reward:</span>
                <span className="font-mono-numeric font-bold text-amber-700">+{selectedBadge.xpReward} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className={`font-bold ${selectedBadge.isUnlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedBadge.isUnlocked ? 'Unlocked & Active' : `${selectedBadge.progressPct}% towards completion`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Close Badge Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
