import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  DollarSign,
  Users,
  Briefcase,
  Wallet,
  Clock,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Play,
  Layers,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import { KPIProgressCard } from '../common/KPIProgressCard';

export const CEOCommandCenterView: React.FC = () => {
  const {
    currentOrg,
    kpiSnapshot,
    currency,
    actions,
    updateActionStatus,
    setActiveView,
    setIsBriefingOpen,
  } = useApp();

  const [trendGranularity, setTrendGranularity] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  // Revenue vs Target Chart Data
  const revenueTrendData = [
    { period: 'W1 (Aug 1-7)', actual: 850000, target: 1250000, forecast: 900000 },
    { period: 'W2 (Aug 8-14)', actual: 1950000, target: 2500000, forecast: 2100000 },
    { period: 'W3 (Current)', actual: 3850000, target: 3750000, forecast: 4100000 },
    { period: 'W4 (Forecast)', actual: null, target: 5000000, forecast: 4920000 },
  ];

  // 8 Top KPI Cards
  const quarterlyRevenueTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;
  const quarterlyPipelineTarget = 45000000;
  const quarterlyLeadsTarget = 150;
  const quarterlyProfitTarget = 3600000;

  const kpiCards = [
    {
      id: 'kpi-rev',
      label: 'Monthly Revenue',
      value: formatCurrency(kpiSnapshot.revenueMTD, currency),
      prevValue: formatCurrency(3370000, currency),
      change: '+14.2%',
      isPositive: true,
      sparkline: [30, 32, 34, 38.5],
      icon: DollarSign,
      actionRoute: 'revenue',
      quarterlyProgress: {
        current: 12630000,
        target: quarterlyRevenueTarget,
        label: 'Q3 Revenue Target',
        quarterLabel: 'Q3 Goal',
      },
    },
    {
      id: 'kpi-profit',
      label: 'Net Profit',
      value: formatCurrency(kpiSnapshot.netProfit, currency),
      prevValue: formatCurrency(760000, currency),
      change: '+13.4%',
      isPositive: true,
      sparkline: [7.2, 7.8, 8.6, 8.62],
      icon: TrendingUp,
      actionRoute: 'finance',
      quarterlyProgress: {
        current: 2840000,
        target: quarterlyProfitTarget,
        label: 'Q3 Profit Goal',
        quarterLabel: 'Q3 Goal',
      },
    },
    {
      id: 'kpi-margin',
      label: 'Net Profit Margin',
      value: `${kpiSnapshot.netMarginPct.toFixed(1)}%`,
      prevValue: '21.5%',
      change: '+0.9%',
      isPositive: true,
      sparkline: [20, 21, 21.5, 22.4],
      icon: TrendingUp,
      actionRoute: 'finance',
    },
    {
      id: 'kpi-cash',
      label: 'Cash Runway Balance',
      value: formatCurrency(kpiSnapshot.cashBalance, currency),
      prevValue: formatCurrency(4450000, currency),
      change: '-6.0%',
      isPositive: false,
      sparkline: [46, 45, 44.5, 41.8],
      icon: Wallet,
      actionRoute: 'cash-flow',
    },
    {
      id: 'kpi-cust',
      label: 'Active Customers',
      value: `${kpiSnapshot.activeCustomers}`,
      prevValue: '122',
      change: '+4.9%',
      isPositive: true,
      sparkline: [115, 119, 122, 128],
      icon: Users,
      actionRoute: 'customers',
    },
    {
      id: 'kpi-leads',
      label: 'Qualified Leads',
      value: `${kpiSnapshot.qualifiedLeads}`,
      prevValue: '41',
      change: '+17.0%',
      isPositive: true,
      sparkline: [32, 36, 41, 48],
      icon: Briefcase,
      actionRoute: 'leads',
      quarterlyProgress: {
        current: 132,
        target: quarterlyLeadsTarget,
        unit: 'leads',
        label: 'Q3 Leads Pipeline',
        quarterLabel: 'Q3 Goal',
      },
    },
    {
      id: 'kpi-pipe',
      label: 'Active Sales Pipeline',
      value: formatCurrency(kpiSnapshot.pipelineValue, currency),
      prevValue: formatCurrency(1280000, currency),
      change: '+19.5%',
      isPositive: true,
      sparkline: [10, 11.5, 12.8, 15.3],
      icon: Layers,
      actionRoute: 'sales-crm',
      quarterlyProgress: {
        current: 38200000,
        target: quarterlyPipelineTarget,
        label: 'Q3 Sales Pipeline',
        quarterLabel: 'Q3 Goal',
      },
    },
    {
      id: 'kpi-rec',
      label: 'Overdue Receivables',
      value: formatCurrency(kpiSnapshot.overdueReceivables, currency),
      prevValue: formatCurrency(320000, currency),
      change: '+35.3%',
      isPositive: false,
      sparkline: [2.5, 2.9, 3.2, 4.33],
      icon: AlertTriangle,
      actionRoute: 'finance',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Executive Greeting Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Good Morning, {currentOrg.ceoName || 'Rajesh'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              LIVE COMMAND
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Here is your strategic executive summary, leak diagnosis, and priority actions today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBriefingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Morning Briefing</span>
          </button>

          <button
            onClick={() => setActiveView('ai-advisor')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            Consult AI Advisor
          </button>
        </div>
      </div>

      {/* CEO HEALTH SCORE GAUGE & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Overall Score Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                CEO Business Health Score
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {kpiSnapshot.healthScore.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl md:text-6xl font-black text-slate-900 font-mono-numeric tracking-tight">
                {kpiSnapshot.healthScore.totalScore}
              </span>
              <span className="text-xl text-slate-400 font-bold font-mono-numeric">/ 100</span>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4 border border-slate-200/60 p-0.5">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${kpiSnapshot.healthScore.totalScore}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              Business fundamentals are strong with <strong className="text-slate-900">82% gross margins</strong>. Primary risks: proposal bottleneck in sales and overdue receivables.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Gap:</span>
            <span className="text-amber-700 font-bold font-mono-numeric">
              {formatCurrency(kpiSnapshot.revenueGap, currency)}
            </span>
          </div>
        </div>

        {/* Right: 7 Score Pillars */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Diagnostic Health Pillars (7 Key Dimensions)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Object.entries(kpiSnapshot.healthScore.categories).map(([key, cat]: [string, any]) => {
              const statusColor =
                cat.status === 'green'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : cat.status === 'yellow'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700';

              const barColor =
                cat.status === 'green'
                  ? 'bg-emerald-500'
                  : cat.status === 'yellow'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              return (
                <div
                  key={key}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${statusColor}`}>
                      {cat.score}/{cat.max}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${(cat.score / cat.max) * 100}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 leading-tight truncate" title={cat.insight}>
                    {cat.insight}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOP 8 KPI CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Executive Key Performance Indicators
          </h2>
          <span className="text-xs text-slate-400">MTD vs Previous Period</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPIProgressCard
              key={kpi.id}
              id={kpi.id}
              label={kpi.label}
              value={kpi.value}
              current={kpi.quarterlyProgress?.current}
              target={kpi.quarterlyProgress?.target}
              unit={kpi.quarterlyProgress?.unit}
              quarterLabel={kpi.quarterlyProgress?.quarterLabel}
              prevValue={kpi.prevValue}
              change={kpi.change}
              deltaPct={(kpi as any).deltaPct}
              isPositive={kpi.isPositive}
              currency={currency}
              icon={kpi.icon}
              actionRoute={kpi.actionRoute}
              onClick={() => setActiveView(kpi.actionRoute)}
            />
          ))}
        </div>
      </div>

      {/* TARGET VS ACTUAL & RUN-RATE CALCULATOR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Goal Tracking & Run-Rate
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Monthly Target vs Actual Revenue Gap
            </h3>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Days Remaining: </span>
              <strong className="text-slate-900 font-mono-numeric">
                {kpiSnapshot.daysRemainingInMonth} Days
              </strong>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">Pace: </span>
              <strong className="text-emerald-700 font-mono-numeric">
                {kpiSnapshot.revenueAchievementPct.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Dual Visual Progress Bars (Monthly & Quarterly) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <TargetProgressBar
            current={kpiSnapshot.revenueMTD}
            target={kpiSnapshot.revenueTarget}
            label="Current Month Revenue Pacing"
            subLabel={`${kpiSnapshot.daysRemainingInMonth} days remaining in August`}
            quarterLabel="Monthly Target"
            currency={currency}
            size="detailed"
            timeElapsedPct={67.7}
          />

          <TargetProgressBar
            current={12630000}
            target={quarterlyRevenueTarget}
            label="Q3 FY26 Configured Quarterly Target"
            subLabel="Aggregate Q3 performance (Jul + Aug + Sep Forecast)"
            quarterLabel="Q3 Revenue"
            currency={currency}
            size="detailed"
            timeElapsedPct={66.7}
          />
        </div>

        {/* AI Required Run-Rate Engine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] text-slate-500">Required Daily Revenue</div>
            <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
              {formatCurrency(kpiSnapshot.requiredDailyRevenue, currency)}
              <span className="text-[10px] text-slate-400 font-normal"> / day</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] text-slate-500">Required Weekly Run Rate</div>
            <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
              {formatCurrency(kpiSnapshot.requiredDailyRevenue * 7, currency)}
              <span className="text-[10px] text-slate-400 font-normal"> / week</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] text-slate-500">Required Deals to Close</div>
            <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
              {kpiSnapshot.requiredDealsCount} Deals
              <span className="text-[10px] text-slate-400 font-normal"> (avg ₹1.25L)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] text-slate-500">Required Qualified Leads</div>
            <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
              {kpiSnapshot.requiredLeadsCount} Leads
              <span className="text-[10px] text-slate-400 font-normal"> (at 22% win rate)</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE TREND & PROFITABILITY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Revenue Trend */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Revenue Trajectory
              </span>
              <h3 className="text-sm font-bold text-slate-900">Actual vs Target vs Forecast</h3>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl text-[11px]">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((gran) => (
                <button
                  key={gran}
                  onClick={() => setTrendGranularity(gran)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    trendGranularity === gran
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {gran}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any) => [formatCurrency(val, currency), '']}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="AI Forecast"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Actual (₹38.5L)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Target (₹50.0L)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Forecast (₹49.2L)
            </span>
          </div>
        </div>

        {/* Right: Profitability Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profitability Engine
                </span>
                <h3 className="text-sm font-bold text-slate-900">Revenue to Net Profit Flow</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                22.4% Net Margin
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-600">Gross Revenue (MTD)</span>
                <span className="font-bold text-slate-900 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.revenueMTD, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-600">Cost of Goods Sold (COGS)</span>
                <span className="font-bold text-rose-600 font-mono-numeric">
                  - {formatCurrency(kpiSnapshot.cogsMTD, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">Gross Profit (82.0% Margin)</span>
                <span className="font-bold text-emerald-700 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.grossProfit, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-600">Operating Expenses (OPEX)</span>
                <span className="font-bold text-rose-600 font-mono-numeric">
                  - {formatCurrency(kpiSnapshot.operatingExpenses, currency)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-bold">Net Profit (EBITDA)</span>
                <span className="text-base font-black text-amber-900 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.netProfit, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Monthly Burn Rate:</span>
            <span className="text-slate-800 font-semibold font-mono-numeric">
              {formatCurrency(kpiSnapshot.monthlyBurnRate, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* SALES FUNNEL & BOTTLENECK CALLOUT */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sales Conversion Architecture
            </span>
            <h3 className="text-base font-bold text-slate-900">End-to-End Pipeline Funnel</h3>
          </div>
          <button
            onClick={() => setActiveView('sales-crm')}
            className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
          >
            Open Sales CRM & Leaderboard →
          </button>
        </div>

        {/* Funnel Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiSnapshot.salesFunnel.map((stage, idx) => (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border relative flex flex-col justify-between ${
                stage.isBottleneck
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Stage {idx + 1}
                </div>
                <div className="text-xs font-bold text-slate-800">{stage.name}</div>
                <div className="text-xl font-black text-slate-900 font-mono-numeric mt-2">
                  {stage.count}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Conv:</span>
                <span
                  className={`font-bold font-mono-numeric ${
                    stage.isBottleneck ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {stage.conversionToNext}%
                </span>
              </div>

              {stage.isBottleneck && (
                <div className="absolute -top-2 right-2 px-1.5 py-0.2 bg-rose-600 text-white font-black text-[9px] rounded uppercase tracking-wider shadow-2xs">
                  Bottleneck
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Bottleneck Diagnosis Box */}
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-rose-800 font-bold">
              AI Bottleneck Identified: {kpiSnapshot.biggestBottleneck.stage}
            </strong>
            <p className="text-slate-700 mt-1 leading-relaxed">
              {kpiSnapshot.biggestBottleneck.message}
            </p>
          </div>
        </div>
      </div>

      {/* TOP 5 CEO ACTIONS TODAY & REVENUE LEAKAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Top 5 Actions */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Top 5 High-Leverage CEO Actions
              </h3>
            </div>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              View all tasks ({actions.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {actions.slice(0, 5).map((action) => {
              const isDone = action.status === 'Completed';

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/50 border-slate-200 opacity-60'
                      : action.priority === 'CRITICAL'
                      ? 'bg-rose-50/20 border-rose-300'
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            action.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {action.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-500">Owner: {action.owner}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {action.problem}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        updateActionStatus(action.id, isDone ? 'Pending' : 'Completed')
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      {isDone ? 'Completed ✓' : 'Take Action'}
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Expected Financial Impact:</span>
                    <span className="font-bold text-emerald-700 font-mono-numeric">
                      +{formatCurrency(action.expectedImpactAmount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Revenue Leakage Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Leakage Diagnostics
                </span>
                <h3 className="text-sm font-bold text-slate-900">AI Revenue & Expense Leaks</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Leaks:</span>
                <div className="text-lg font-black text-rose-600 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.totalLeakage, currency)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Overdue Receivables</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kpiSnapshot.leakage.receivables.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.receivables.amount, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Lost / Neglected Leads</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kpiSnapshot.leakage.lostLeads.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.lostLeads.amount, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Unused Software & Capacity</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kpiSnapshot.leakage.unusedCapacity.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.unusedCapacity.amount, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Underpriced Enterprise Tier</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kpiSnapshot.leakage.pricingLeakage.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.pricingLeakage.amount, currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Expense Anomalies</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {kpiSnapshot.leakage.expenseLeakage.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 font-mono-numeric">
                  {formatCurrency(kpiSnapshot.leakage.expenseLeakage.amount, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveView('opportunities')}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Explore Leakage Recovery Playbooks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* STRATEGIC DECISION MATRIX: WHAT IS GOING WELL VS WHAT IS GOING WRONG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              What Is Going Well
            </h3>
          </div>
          <ul className="space-y-2">
            {kpiSnapshot.whatIsGoingWell.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              What Is Going Wrong / Critical Risks
            </h3>
          </div>
          <ul className="space-y-2">
            {kpiSnapshot.whatIsGoingWrong.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
