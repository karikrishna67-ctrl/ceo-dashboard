import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Check,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  ExternalLink,
  Sparkles,
  Sliders,
  RotateCcw,
  Zap,
  Gauge,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import {
  calculatePredictivePacing,
  simulateScenarioImpact,
  ScenarioLevers,
} from '../../lib/predictiveEngine';

export const AlertsView: React.FC = () => {
  const { alerts, kpiSnapshot, currentOrg, currency, markAlertRead, markAllAlertsRead, setActiveView, openCommandPalette } = useApp();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'PREDICTIVE' | 'CRITICAL' | 'HIGH' | 'INFO'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(true);

  // Predictive Pacing Calculations
  const pacingModel = useMemo(() => {
    return calculatePredictivePacing(kpiSnapshot, currentOrg);
  }, [kpiSnapshot, currentOrg]);

  // Scenario Simulator Interactive Levers
  const [levers, setLevers] = useState<ScenarioLevers>({
    priceAdjustmentPct: 10,
    winRateBoostPct: 20,
    leadVolumeBoostPct: 25,
    churnReductionPct: 40,
  });

  const simulatedResult = useMemo(() => {
    return simulateScenarioImpact(pacingModel, levers);
  }, [pacingModel, levers]);

  const handleResetLevers = () => {
    setLevers({
      priceAdjustmentPct: 0,
      winRateBoostPct: 0,
      leadVolumeBoostPct: 0,
      churnReductionPct: 0,
    });
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'PREDICTIVE') {
      return a.isPredictive === true || a.category === 'PREDICTIVE';
    }
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterCategory !== 'ALL' && a.category !== filterCategory) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const predictiveCount = alerts.filter((a) => a.isPredictive || a.category === 'PREDICTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Executive Alerts & Predictive Warning Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Predictive AI Active</span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Algorithmic revenue velocity forecasting, proactive quarterly target risk warnings, and operational leak detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            onClick={() => openCommandPalette('ai', 'What actions should I take to prevent missing Q3 target?')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI Advisor</span>
          </button>
        </div>
      </div>

      {/* PREDICTIVE VELOCITY & QUARTERLY TARGET PACING FORECAST CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Quarterly Revenue Velocity Risk</span>
              </span>
              <span className="text-xs text-slate-400">
                Confidence: <strong className="text-emerald-400 font-mono-numeric">{pacingModel.confidenceScore}%</strong>
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white mt-1.5">
              Q3 FY26 Target Pacing: Projected Shortfall of {formatCurrency(pacingModel.projectedShortfall, currency)}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Based on historical 60-day conversion velocity, your current run-rate of <strong className="text-white font-mono-numeric">{formatCurrency(pacingModel.currentDailyVelocity, currency)}/day</strong> will land at <strong className="text-amber-300 font-mono-numeric">{formatCurrency(pacingModel.projectedQuarterLanding, currency)}</strong> ({pacingModel.projectedAchievementPct}% of target).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl text-xs shrink-0">
            <div>
              <span className="text-slate-400">Quarter Status:</span>
              <div className="font-bold text-white font-mono-numeric">
                Day {pacingModel.daysElapsedInQuarter} / {pacingModel.totalQuarterDays} ({pacingModel.daysRemainingInQuarter}d left)
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400">Required Pace:</span>
              <div className="font-bold text-amber-400 font-mono-numeric">
                +{pacingModel.velocityLagPct}% ({formatCurrency(pacingModel.requiredDailyVelocity, currency)}/day)
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Configured Q3 Goal</span>
            <div className="text-lg font-black text-white font-mono-numeric mt-0.5">
              {formatCurrency(pacingModel.quarterlyTarget, currency)}
            </div>
            <span className="text-[10px] text-slate-400">Board Approved Milestone</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Current QTD Achieved</span>
            <div className="text-lg font-black text-emerald-400 font-mono-numeric mt-0.5">
              {formatCurrency(pacingModel.currentQTDRevenue, currency)}
            </div>
            <span className="text-[10px] text-emerald-400/80 font-medium">84.2% of Total Goal</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Projected Quarter Landing</span>
            <div className="text-lg font-black text-amber-300 font-mono-numeric mt-0.5">
              {formatCurrency(pacingModel.projectedQuarterLanding, currency)}
            </div>
            <span className="text-[10px] text-rose-400 font-bold">
              -{formatCurrency(pacingModel.projectedShortfall, currency)} Shortfall
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Pipeline Coverage</span>
            <div className="text-lg font-black text-indigo-300 font-mono-numeric mt-0.5">
              {pacingModel.pipelineCoverageRatio}x Coverage
            </div>
            <span className="text-[10px] text-slate-400">Weighted: {formatCurrency(pacingModel.pipelineWeightedValue, currency)}</span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Progress: <strong className="text-emerald-400 font-mono-numeric">{formatCurrency(pacingModel.currentQTDRevenue, currency)}</strong> QTD Closed
            </span>
            <span className="text-amber-300 font-bold">
              Deficit to Close: {formatCurrency(pacingModel.projectedShortfall, currency)}
            </span>
          </div>

          <div className="relative w-full bg-slate-950/70 h-3.5 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500"
              style={{ width: `${Math.min(100, (pacingModel.currentQTDRevenue / pacingModel.quarterlyTarget) * 100)}%` }}
            />
            {/* Projected Pace Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-300 shadow-sm"
              style={{ left: `${Math.min(99, pacingModel.projectedAchievementPct)}%` }}
              title="Projected Landing at Current Pace"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>₹0</span>
            <span>Current Closed: 84.2%</span>
            <span className="text-amber-300 font-semibold">Projected Landing: {pacingModel.projectedAchievementPct}%</span>
            <span>Target: 100% ({formatCurrency(pacingModel.quarterlyTarget, currency)})</span>
          </div>
        </div>
      </div>

      {/* CORRECTIVE LEVER SIMULATOR TO BRIDGE QUARTERLY TARGET GAP */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900">
                Corrective Strategy Simulator: Bridge the {formatCurrency(pacingModel.projectedShortfall, currency)} Gap
              </h2>
              <p className="text-xs text-slate-500">
                Adjust revenue levers in real time to see how strategic actions alter your projected Q3 landing.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetLevers}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Levers</span>
          </button>
        </div>

        {/* 4 Interactive Lever Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 mb-5">
          {/* Lever 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">1. Price Realignment:</span>
              <strong className="text-indigo-700 font-mono-numeric">+{levers.priceAdjustmentPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={levers.priceAdjustmentPct}
              onChange={(e) => setLevers((prev) => ({ ...prev, priceAdjustmentPct: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-500">
              Lift ARR on high-tier renewals.
            </p>
          </div>

          {/* Lever 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">2. Proposal Win-Rate:</span>
              <strong className="text-emerald-700 font-mono-numeric">+{levers.winRateBoostPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={levers.winRateBoostPct}
              onChange={(e) => setLevers((prev) => ({ ...prev, winRateBoostPct: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[10px] text-slate-500">
              Fast-track 6 stuck mid-market proposals.
            </p>
          </div>

          {/* Lever 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">3. Lead Flow Reallocation:</span>
              <strong className="text-amber-800 font-mono-numeric">+{levers.leadVolumeBoostPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={levers.leadVolumeBoostPct}
              onChange={(e) => setLevers((prev) => ({ ...prev, leadVolumeBoostPct: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <p className="text-[10px] text-slate-500">
              Shift Meta budget into WhatsApp & Search.
            </p>
          </div>

          {/* Lever 4 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">4. Churn Risk Mitigation:</span>
              <strong className="text-rose-700 font-mono-numeric">{levers.churnReductionPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="10"
              value={levers.churnReductionPct}
              onChange={(e) => setLevers((prev) => ({ ...prev, churnReductionPct: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <p className="text-[10px] text-slate-500">
              Executive reviews for 2 at-risk VIPs.
            </p>
          </div>
        </div>

        {/* Simulator Outcome Banner */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-900">
                Simulated Outcome: <strong className="text-emerald-700 font-bold">+{formatCurrency(simulatedResult.revenueGained, currency)} Gained</strong>
              </div>
              <div className="text-xs text-indigo-700 mt-0.5">
                New Projected Landing: <strong className="font-bold text-slate-900 font-mono-numeric">{formatCurrency(simulatedResult.simulatedQuarterLanding, currency)}</strong> ({simulatedResult.simulatedAchievementPct}% Target Achievement)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('opportunities')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Execute Growth Levers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Predictive Velocity Warnings</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900 font-mono-numeric mt-2">
            {predictiveCount}
          </div>
          <div className="text-xs text-purple-700 mt-1 font-medium">Forward-looking target risk indicators</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Priority Alerts</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {criticalCount}
          </div>
          <div className="text-xs text-rose-600 mt-1 font-medium">Requires immediate CEO or CFO action</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">High Priority Warnings</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {alerts.filter((a) => a.severity === 'HIGH').length}
          </div>
          <div className="text-xs text-amber-700 mt-1 font-medium">Pipeline velocity & receivable friction</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Informational & Wins</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {alerts.filter((a) => a.severity === 'INFO').length}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">Lead acquisitions & milestone events</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter:</span>
          {(['ALL', 'PREDICTIVE', 'CRITICAL', 'HIGH', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev === 'PREDICTIVE' && <Sparkles className="w-3 h-3 text-amber-400" />}
              <span>{sev}</span>
              {sev === 'PREDICTIVE' && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-900 font-bold">
                  {predictiveCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Category:</span>
          {(['ALL', 'PREDICTIVE', 'REVENUE', 'CASH', 'SALES', 'CUSTOMER', 'EXPENSE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching alerts found</p>
            <p className="text-xs text-slate-400 mt-1">All business systems and predictive velocity models are nominal.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isPredictive = alert.isPredictive || alert.category === 'PREDICTIVE';
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPredictive
                    ? !alert.isRead
                      ? 'border-purple-300 bg-purple-50/20 ring-1 ring-purple-200/50'
                      : 'border-purple-200/80 bg-white'
                    : !alert.isRead
                    ? isCritical
                      ? 'border-rose-300 bg-rose-50/20'
                      : isHigh
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-blue-200'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isPredictive
                        ? 'bg-purple-100 text-purple-800'
                        : isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isHigh
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isPredictive ? (
                      <Sparkles className="w-5 h-5" />
                    ) : isCritical ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : isHigh ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {isPredictive && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Predictive AI</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {alert.category}
                      </span>

                      {alert.confidencePct && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {alert.confidencePct}% Model Confidence
                        </span>
                      )}

                      {alert.metricImpact && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {alert.metricImpact}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400">• {alert.timestamp}</span>

                      {!alert.isRead && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-black uppercase">
                          New
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>

                    {/* Recommendation Velocity Pill */}
                    {alert.recommendedVelocity && (
                      <div className="mt-2 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
                        <span className="text-slate-500">Corrective Pace Required:</span>
                        <strong className="text-amber-800 font-mono-numeric">{alert.recommendedVelocity}</strong>
                        {alert.pacingLagPct && (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                            (+{alert.pacingLagPct}% over current pace)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.actionRoute && (
                    <button
                      onClick={() => {
                        markAlertRead(alert.id);
                        if (alert.actionRoute === 'alerts') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          setActiveView(alert.actionRoute!);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>{alert.actionLabel || 'Investigate'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
