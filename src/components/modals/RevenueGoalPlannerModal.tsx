import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Target,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
  Sliders,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { CurrencyCode } from '../../types/index';

interface RevenueGoalPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: CurrencyCode;
  onSelectStrategyPlan?: (planTitle: string, targetAmount: number) => void;
}

export const RevenueGoalPlannerModal: React.FC<RevenueGoalPlannerModalProps> = ({
  isOpen,
  onClose,
  currency = 'INR' as CurrencyCode,
  onSelectStrategyPlan,
}) => {
  const [targetGoal, setTargetGoal] = useState<number>(1000000); // ₹10,00,000 default
  const [selectedPlanId, setSelectedPlanId] = useState<'plan_a' | 'plan_b' | 'plan_hybrid'>('plan_hybrid');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '14d' | '30d'>('30d');
  const [planActivated, setPlanActivated] = useState(false);

  if (!isOpen) return null;

  // Preset buttons
  const presets = [500000, 1000000, 2500000, 5000000];

  // Mathematical decompositions
  const avgDealSize = 75000;
  const avgUpsellSize = 25000;
  const avgConversionPct = 0.22; // 22%

  const daysCount = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '14d' ? 14 : 30;
  const requiredDailyRevenue = Math.round(targetGoal / daysCount);

  // Strategies:
  // Hybrid: 60% existing customers + 40% new clients
  const hybridExistingAmount = Math.round(targetGoal * 0.6);
  const hybridNewAmount = Math.round(targetGoal * 0.4);
  const hybridUpsellsNeeded = Math.ceil(hybridExistingAmount / avgUpsellSize);
  const hybridNewDealsNeeded = Math.ceil(hybridNewAmount / avgDealSize);
  const hybridLeadsNeeded = Math.ceil(hybridNewDealsNeeded / avgConversionPct);

  // Plan A: 100% Existing Customer Expansion
  const planAUpsellsNeeded = Math.ceil(targetGoal / avgUpsellSize);
  const planAAccountsToTarget = Math.ceil(planAUpsellsNeeded * 2.2);

  // Plan B: 100% New Customer Acquisition
  const planBDealsNeeded = Math.ceil(targetGoal / avgDealSize);
  const planBLeadsNeeded = Math.ceil(planBDealsNeeded / avgConversionPct);
  const planBMeetingsNeeded = Math.ceil(planBDealsNeeded * 2.8);

  const handleActivatePlan = (planName: string) => {
    setPlanActivated(true);
    if (onSelectStrategyPlan) {
      onSelectStrategyPlan(planName, targetGoal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Revenue Growth Planner
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
              [ESTIMATE]
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Make Additional Revenue Target</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Input your revenue milestone. AI mathematically constructs multi-path execution roadmaps across existing accounts and new client acquisition.
          </p>

          {/* Target Amount Input & Preset Chips */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-amber-400">
                  {currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  step="50000"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Math.max(50000, Number(e.target.value)))}
                  className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xl font-black text-white font-mono-numeric focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                />
              </div>

              {/* Timeframe Selector */}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {(['7d', '14d', '30d'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf === '7d' ? '7 Days' : tf === '14d' ? '14 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTargetGoal(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono-numeric font-bold transition-all ${
                    targetGoal === amt
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {formatCurrency(amt, currency)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Plans Section */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key Milestones Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Target Revenue</span>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-0.5">
                {formatCurrency(targetGoal, currency)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Daily Revenue Run-Rate</span>
              <div className="text-lg font-black text-amber-700 font-mono-numeric mt-0.5">
                {formatCurrency(requiredDailyRevenue, currency)}/day
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Time Horizon</span>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-0.5">
                {daysCount} Days
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Target Win Rate</span>
              <div className="text-lg font-black text-emerald-700 font-mono-numeric mt-0.5">
                22.0% Conversion
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pt-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Select AI Growth Strategy</span>
          </h3>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strategy 1: Hybrid (Recommended) */}
            <div
              onClick={() => setSelectedPlanId('plan_hybrid')}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative ${
                selectedPlanId === 'plan_hybrid'
                  ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-400/30 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                ⭐ Recommended
              </span>

              <div>
                <div className="text-sm font-black text-slate-900">Plan A: Balanced Hybrid</div>
                <div className="text-xs text-slate-500">60% Upsells + 40% New Deals</div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Existing Client Upsells:</span>
                  <strong className="font-mono-numeric text-slate-900">{hybridUpsellsNeeded} deals ({formatCurrency(hybridExistingAmount, currency)})</strong>
                </div>
                <div className="flex justify-between">
                  <span>New Client Wins:</span>
                  <strong className="font-mono-numeric text-slate-900">{hybridNewDealsNeeded} deals ({formatCurrency(hybridNewAmount, currency)})</strong>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>New Leads Required:</span>
                  <strong className="font-mono-numeric text-amber-700">{hybridLeadsNeeded} leads</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                Fastest path to quota with minimal ad spend drag.
              </div>
            </div>

            {/* Strategy 2: Existing Accounts */}
            <div
              onClick={() => setSelectedPlanId('plan_a')}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                selectedPlanId === 'plan_a'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-sm font-black text-slate-900">Plan B: VIP Expansion</div>
                <div className="text-xs text-slate-500">100% Existing Customer Base</div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Package Upsells:</span>
                  <strong className="font-mono-numeric text-slate-900">{planAUpsellsNeeded} accounts</strong>
                </div>
                <div className="flex justify-between">
                  <span>Avg Expansion Size:</span>
                  <strong className="font-mono-numeric text-slate-900">{formatCurrency(avgUpsellSize, currency)}</strong>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Accounts to Pitch:</span>
                  <strong className="font-mono-numeric text-emerald-700">{planAAccountsToTarget} VIPs</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                Highest margin approach. Zero lead acquisition costs.
              </div>
            </div>

            {/* Strategy 3: Pure Inbound / Outbound */}
            <div
              onClick={() => setSelectedPlanId('plan_b')}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                selectedPlanId === 'plan_b'
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-400/30 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-sm font-black text-slate-900">Plan C: New Customer Push</div>
                <div className="text-xs text-slate-500">100% Acquisition Campaign</div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Closed Wins Needed:</span>
                  <strong className="font-mono-numeric text-slate-900">{planBDealsNeeded} wins</strong>
                </div>
                <div className="flex justify-between">
                  <span>Qualified Leads:</span>
                  <strong className="font-mono-numeric text-slate-900">{planBLeadsNeeded} leads</strong>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>Demos / Pitch Calls:</span>
                  <strong className="font-mono-numeric text-blue-700">{planBMeetingsNeeded} meetings</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                Expands market share. Requires sales bandwidth.
              </div>
            </div>
          </div>

          {/* Action Execution Roadmap */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{daysCount}-Day Execution Checklist</span>
              </span>
              <span className="text-[10px] font-mono-numeric text-emerald-400">
                Goal: {formatCurrency(targetGoal, currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-amber-400">Day 1 - {Math.ceil(daysCount / 3)}: Lead & Pitch Wave</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Trigger automated WhatsApp & email outreach to {selectedPlanId === 'plan_a' ? planAAccountsToTarget : hybridUpsellsNeeded * 2} dormant and VIP accounts.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-amber-400">Day {Math.ceil(daysCount / 3) + 1} - {Math.ceil((daysCount * 2) / 3)}: Proposal Closing</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Offer a limited 8% upfront incentive for contracts approved within 48 hours. Enforce daily follow-ups.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-amber-400">Day {Math.ceil((daysCount * 2) / 3) + 1} - {daysCount}: Cash Settlement</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Secure invoice payments and initiate rapid onboarding sequence to lock in realization.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-500 italic">
            *Estimates based on historical 22% conversion and past transaction sizes. Actual results depend on market conditions.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
            >
              Cancel
            </button>

            {planActivated ? (
              <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strategy Activated!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleActivatePlan(selectedPlanId)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Activate Selected Strategy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
