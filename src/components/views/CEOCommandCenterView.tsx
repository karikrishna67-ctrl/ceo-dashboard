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
  Zap,
  RotateCcw,
  UserCheck,
  Send,
  Bell,
  Check,
  Building2,
  ExternalLink,
  X,
  Search,
  Filter,
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
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import { KPIProgressCard } from '../common/KPIProgressCard';
import { AIWhyAnalysisModal, WhyDiagnostic } from '../modals/AIWhyAnalysisModal';
import { RevenueGoalPlannerModal } from '../modals/RevenueGoalPlannerModal';

export const CEOCommandCenterView: React.FC = () => {
  const {
    currentOrg,
    currency,
    actions,
    updateActionStatus,
    setActiveView,
    setIsBriefingOpen,
    syncedTaxonomy,
    clearSyncedTaxonomy,
  } = useApp();

  const { kpiSnapshot, verifyIntegrity } = useDashboardData();

  const [trendGranularity, setTrendGranularity] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [selectedWhyDiagnostic, setSelectedWhyDiagnostic] = useState<WhyDiagnostic | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isGoalPlannerOpen, setIsGoalPlannerOpen] = useState(false);
  const [activeActionFeedback, setActiveActionFeedback] = useState<{ [key: string]: string }>({});

  // Revenue vs Target Chart Data
  const revenueTrendData = [
    {
      period: 'W1 (Aug 1-7)',
      actual: Math.round(kpiSnapshot.revenueMTD * 0.22),
      target: Math.round(kpiSnapshot.revenueTarget * 0.25),
      forecast: Math.round(kpiSnapshot.revenueMTD * 0.24),
    },
    {
      period: 'W2 (Aug 8-14)',
      actual: Math.round(kpiSnapshot.revenueMTD * 0.51),
      target: Math.round(kpiSnapshot.revenueTarget * 0.5),
      forecast: Math.round(kpiSnapshot.revenueMTD * 0.55),
    },
    {
      period: 'W3 (Current)',
      actual: kpiSnapshot.revenueMTD,
      target: Math.round(kpiSnapshot.revenueTarget * 0.75),
      forecast: Math.round(kpiSnapshot.revenueMTD * 1.05),
    },
    {
      period: 'W4 (Forecast)',
      actual: null,
      target: kpiSnapshot.revenueTarget,
      forecast: Math.min(kpiSnapshot.revenueTarget, Math.round(kpiSnapshot.revenueMTD * 1.28)),
    },
  ];

  // 8 Top KPI Cards
  const quarterlyRevenueTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;
  const quarterlyPipelineTarget = 45000000;
  const quarterlyLeadsTarget = 150;
  const quarterlyProfitTarget = 3600000;

  const handleOpenWhy = (kpiId: string) => {
    const diagnosticMap: { [key: string]: WhyDiagnostic } = {
      'kpi-rev': {
        kpiId: 'kpi-rev',
        kpiLabel: 'Monthly Revenue MTD',
        currentValue: formatCurrency(kpiSnapshot.revenueMTD, currency),
        prevValue: formatCurrency(3370000, currency),
        change: '+14.2%',
        isPositive: true,
        question: 'Why did Monthly Revenue accelerate by +14.2% this month?',
        primaryCause: {
          factor: 'Surge in Mid-Market Deal Size (+18% ARPA)',
          variance: '+18% ARPA',
          impactAmount: '+₹8.5L',
          severity: 'medium',
          description: '3 major enterprise renewals closed with 2-year upfront commitments, lifting Average Revenue Per Account from ₹85k to ₹1.15L.',
        },
        contributors: [
          {
            id: 'c1',
            factor: 'Upsell Campaign to Existing Cohort',
            variance: '+45% of variance',
            weightPct: 45,
            trend: 'up',
            detail: '28 accounts upgraded to the Premium Analytics add-on after automated email outreach.',
          },
          {
            id: 'c2',
            factor: 'Inbound Lead Velocity',
            variance: '+35% of variance',
            weightPct: 35,
            trend: 'up',
            detail: 'Qualified inbound pipeline grew from 32 to 48 leads.',
          },
          {
            id: 'c3',
            factor: 'Discounting Pressure in SMB Segment',
            variance: '-20% drag',
            weightPct: 20,
            trend: 'down',
            detail: 'Sales reps offered average 12% discounts to close 6 SMB deals before month-end.',
          },
        ],
        fixRecommendation: {
          title: 'Lock In 14 Pending Enterprise Proposals',
          actionType: 'route',
          route: 'sales-crm',
          actionOwner: 'Sales Lead',
          expectedRecovery: '+₹8.5L',
          step1: 'Review 14 enterprise proposals in Negotiation stage with contract value > ₹1.5L.',
          step2: 'Offer standard 5% discount cap on all contracts under ₹2L to protect gross margin.',
          step3: 'Schedule CEO closing calls for top 3 strategic accounts before Friday.',
          ctaLabel: 'Open Sales Pipeline',
        },
      },
      'kpi-profit': {
        kpiId: 'kpi-profit',
        kpiLabel: 'Net Profit (EBITDA)',
        currentValue: formatCurrency(kpiSnapshot.netProfit, currency),
        prevValue: formatCurrency(760000, currency),
        change: '+13.4%',
        isPositive: true,
        question: 'Why did Net Profit grow by +13.4% to ₹8.62L?',
        primaryCause: {
          factor: 'High Operating Leverage on Digital Services',
          variance: '+13.4%',
          impactAmount: '+₹1.02L',
          severity: 'medium',
          description: 'Fixed infrastructure and hosting costs remained flat while revenue expanded 14.2%, lifting net margins to 22.4%.',
        },
        contributors: [
          {
            id: 'p1',
            factor: 'High Gross Margin on Services (82%)',
            variance: '+55% contribution',
            weightPct: 55,
            trend: 'up',
            detail: 'COGS decreased to 18% of revenue due to automated client onboarding sequences.',
          },
          {
            id: 'p2',
            factor: 'Marketing CAC Efficiency',
            variance: '+30% contribution',
            weightPct: 30,
            trend: 'up',
            detail: 'Meta and Google Ads CAC dropped from ₹4,200 to ₹3,450 per closed deal.',
          },
        ],
        fixRecommendation: {
          title: 'Audit Software Subscriptions for Further Margin Gain',
          actionType: 'task',
          actionOwner: 'Operations Lead',
          expectedRecovery: '+₹65,000/mo',
          step1: 'Identify 4 unused SaaS seat licenses across marketing and analytics tools.',
          step2: 'Cancel 2 redundant testing staging servers.',
          step3: 'Lock in annual vendor discounts on core cloud hosting.',
          ctaLabel: 'Review Expense Leaks',
        },
      },
      'kpi-cash': {
        kpiId: 'kpi-cash',
        kpiLabel: 'Cash Runway Balance',
        currentValue: formatCurrency(kpiSnapshot.cashBalance, currency),
        prevValue: formatCurrency(4450000, currency),
        change: '-6.0%',
        isPositive: false,
        question: 'Why did Cash Runway Balance drop by -6.0% this month?',
        primaryCause: {
          factor: 'Delayed Client Collections (>30 Days Overdue)',
          variance: '-₹2.7L reserve drop',
          impactAmount: '-₹4.33L overdue',
          severity: 'critical',
          description: 'Overdue receivables spiked from ₹3.2L to ₹4.33L, delaying anticipated cash inflows from 4 enterprise accounts.',
        },
        contributors: [
          {
            id: 'k1',
            factor: 'Uncollected Invoices >30 Days',
            variance: '-65% of cash drag',
            weightPct: 65,
            trend: 'down',
            detail: 'Apex Retail (₹1.85L) and Horizon Labs (₹1.20L) payments are 14+ days overdue.',
          },
          {
            id: 'k2',
            factor: 'Annual Vendor License Prepayments',
            variance: '-35% of cash drag',
            weightPct: 35,
            trend: 'down',
            detail: 'One-time ₹1.8L annual server hosting renewal was debited on Aug 5.',
          },
        ],
        fixRecommendation: {
          title: 'Trigger 1-Click Executive WhatsApp Collections',
          actionType: 'whatsapp',
          actionOwner: 'CEO / Finance',
          expectedRecovery: '+₹4.33L Cash',
          step1: 'Open Follow-up Recovery Center to send calibrated WhatsApp reminders to Apex Retail.',
          step2: 'Contact finance lead at Horizon Labs with updated statement of account.',
          step3: 'Implement 2% prompt-payment discount on net-15 terms for new enterprise deals.',
          ctaLabel: 'Open Follow-up Recovery',
        },
      },
      'kpi-rec': {
        kpiId: 'kpi-rec',
        kpiLabel: 'Overdue Receivables',
        currentValue: formatCurrency(kpiSnapshot.overdueReceivables, currency),
        prevValue: formatCurrency(320000, currency),
        change: '+35.3%',
        isPositive: false,
        question: 'Why did Overdue Receivables spike +35.3% to ₹4.33L?',
        primaryCause: {
          factor: 'Lack of Automated Day-7 & Day-14 Payment Reminders',
          variance: '+₹1.13L jump',
          impactAmount: '₹4.33L Total',
          severity: 'critical',
          description: 'Invoices were issued without automated milestone notifications or integrated UPI/bank payment links.',
        },
        contributors: [
          {
            id: 'r1',
            factor: 'No Multi-Channel Collection Cadence',
            variance: '+60% contribution',
            weightPct: 60,
            trend: 'down',
            detail: 'Accounts team relied exclusively on manual emails rather than automated WhatsApp sequences.',
          },
          {
            id: 'r2',
            factor: 'Extended Enterprise Payment Cycles',
            variance: '+40% contribution',
            weightPct: 40,
            trend: 'down',
            detail: 'Average days sales outstanding (DSO) lengthened from 38 to 47 days.',
          },
        ],
        fixRecommendation: {
          title: 'Activate Automated Invoice Recovery Playbook',
          actionType: 'route',
          route: 'follow-ups',
          actionOwner: 'Finance Team',
          expectedRecovery: '+₹4.33L',
          step1: 'Send payment reminder to Apex Retail (₹1.85L) with instant bank transfer link.',
          step2: 'Follow up with Horizon Labs (₹1.20L) accounts department via executive WhatsApp.',
          step3: 'Enable automatic payment reminder triggers on Day 7, 14, and 21.',
          ctaLabel: 'Recover Overdue Invoices',
        },
      },
    };

    const diagnostic = diagnosticMap[kpiId] || {
      kpiId: kpiId,
      kpiLabel: 'Selected KPI Metric',
      currentValue: 'Active Metric',
      prevValue: 'Previous Period',
      change: '+5.2%',
      isPositive: true,
      question: 'What is the root cause behind this performance velocity?',
      primaryCause: {
        factor: 'Consistent Pipeline Velocity',
        variance: '+5.2%',
        severity: 'medium',
        description: 'Steady conversion across mid-funnel stages with positive velocity.',
      },
      contributors: [
        {
          id: 'gen1',
          factor: 'Sales Team Quota Attainment',
          variance: '+60% contribution',
          weightPct: 60,
          trend: 'up',
          detail: 'Sales reps achieved 110% of monthly milestone targets.',
        },
      ],
      fixRecommendation: {
        title: 'Maintain Current Execution Velocity',
        actionType: 'task',
        actionOwner: 'CEO / Operations',
        expectedRecovery: '+₹2.5L',
        step1: 'Review daily follow-up queue across all deals over ₹1 Lakh.',
        step2: 'Maintain weekly pipeline review cadence with sales leads.',
        step3: 'Monitor gross margins to ensure pricing integrity is maintained.',
        ctaLabel: 'View Growth Plan',
      },
    };

    setSelectedWhyDiagnostic(diagnostic);
    setIsWhyModalOpen(true);
  };

  const handleActionClick = (actionId: string, feedbackType: string) => {
    setActiveActionFeedback((prev) => ({
      ...prev,
      [actionId]: feedbackType,
    }));
    setTimeout(() => {
      setActiveActionFeedback((prev) => {
        const next = { ...prev };
        delete next[actionId];
        return next;
      });
    }, 2500);
  };

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
      dataTrustTag: 'ACTUAL' as const,
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
      dataTrustTag: 'CALCULATED' as const,
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
      value: `${(kpiSnapshot?.netMarginPct ?? 0).toFixed(1)}%`,
      prevValue: '21.5%',
      change: '+0.9%',
      isPositive: true,
      sparkline: [20, 21, 21.5, 22.4],
      icon: TrendingUp,
      actionRoute: 'finance',
      dataTrustTag: 'CALCULATED' as const,
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
      dataTrustTag: 'ACTUAL' as const,
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
      dataTrustTag: 'ACTUAL' as const,
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
      dataTrustTag: 'ACTUAL' as const,
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
      dataTrustTag: 'CALCULATED' as const,
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
      dataTrustTag: 'ACTUAL' as const,
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              REVENUE COMMAND CENTER
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            See your business → Find your leaks → Discover opportunities → Take high-leverage action.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsGoalPlannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Make ₹10L Goal Planner</span>
          </button>

          <button
            onClick={() => setIsBriefingOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Morning Briefing</span>
          </button>
        </div>
      </div>

      {/* Synced Sector Taxonomy & Aggregate Benchmark Intelligence */}
      {syncedTaxonomy ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 border border-amber-300/80 rounded-2xl p-4 md:p-5 shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight">
                    Synced Sector Benchmark Intelligence
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Live Sector Sync Active
                  </span>
                  {syncedTaxonomy.searchQuery && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Filtered: &ldquo;{syncedTaxonomy.searchQuery}&rdquo;
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calibrated to <strong className="text-slate-900">{syncedTaxonomy.selectedSectorName}</strong> across{' '}
                  <strong className="text-slate-900">{syncedTaxonomy.totalFilteredSectors} master domains</strong> and{' '}
                  <strong className="text-slate-900">{syncedTaxonomy.totalSubIndustriesCount} extracted sub-industries</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('industry-taxonomy')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Adjust in Taxonomy</span>
              </button>

              <button
                type="button"
                onClick={clearSyncedTaxonomy}
                className="px-2.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Clear synced taxonomy override"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Aggregated Benchmark Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-slate-500">Benchmark Gross Margin</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-0.5 flex items-baseline gap-1.5">
                <span>{syncedTaxonomy.aggregateMetrics.avgGrossMargin}%</span>
                <span className="text-[10px] font-bold text-emerald-700">
                  (Org: {((kpiSnapshot.grossProfit / (kpiSnapshot.revenueMTD || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sector industry target</div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-slate-500">Target LTV : CAC</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-0.5">
                {syncedTaxonomy.aggregateMetrics.avgCACtoLTV}x
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Efficiency benchmark</div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-slate-500">Average Sales Cycle</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-0.5">
                {syncedTaxonomy.aggregateMetrics.avgSalesCycleDays} Days
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Industry conversion velocity</div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 shadow-2xs">
              <div className="text-[10px] font-bold uppercase text-slate-500">Highest Margin Domain</div>
              <div className="text-sm font-black text-slate-900 truncate mt-1" title={syncedTaxonomy.aggregateMetrics.highestMarginSector.name}>
                {syncedTaxonomy.aggregateMetrics.highestMarginSector.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                {syncedTaxonomy.aggregateMetrics.highestMarginSector.margin}% benchmark margin
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div>
              <span className="font-bold text-slate-800">Active Industry Calibration: </span>
              <span className="text-slate-600 font-medium">{currentOrg.industry || 'Technology & Software'}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-emerald-700 font-bold">82% Gross Margin Baseline</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('industry-taxonomy')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold border border-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore 23 Master Sectors & Sync</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* 6-BOX HERO COMMAND GRID: Key Revenue Diagnostics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Revenue MTD</div>
          <div className="text-xl font-black text-amber-400 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.revenueMTD, currency)}
          </div>
          <div className="text-[9px] text-emerald-400 mt-1 font-bold">+14.2% vs target [ACTUAL]</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase text-slate-500">Pipeline Value</div>
          <div className="text-xl font-black text-slate-900 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.pipelineValue, currency)}
          </div>
          <div className="text-[9px] text-slate-500 mt-1 font-medium">18 active deals [CALCULATED]</div>
        </div>

        <div
          onClick={() => setActiveView('follow-ups')}
          className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="text-[10px] font-bold uppercase text-rose-700 flex items-center justify-between">
            <span>Missed Follow-ups</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-xl font-black text-rose-700 font-mono-numeric mt-1">
            47 Leads
          </div>
          <div className="text-[9px] text-rose-600 mt-1 font-bold">₹8.4L at risk [ACTUAL]</div>
        </div>

        <div
          onClick={() => setActiveView('revenue-leakage')}
          className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="text-[10px] font-bold uppercase text-amber-800 flex items-center justify-between">
            <span>Revenue Leaking</span>
            <Flame className="w-3 h-3 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-900 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.leakage.totalLeakage, currency)}
          </div>
          <div className="text-[9px] text-amber-800 mt-1 font-bold">5 critical leaks [CALCULATED]</div>
        </div>

        <div
          onClick={() => setActiveView('opportunities')}
          className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center justify-between">
            <span>Upsell Potential</span>
            <Sparkles className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 font-mono-numeric mt-1">
            {formatCurrency(1850000, currency)}
          </div>
          <div className="text-[9px] text-emerald-700 mt-1 font-bold">40 VIP accounts [ESTIMATE]</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase text-slate-500">Net Margin</div>
          <div className="text-xl font-black text-slate-900 font-mono-numeric mt-1">
            {(kpiSnapshot?.netMarginPct ?? 0).toFixed(1)}%
          </div>
          <div className="text-[9px] text-emerald-700 mt-1 font-bold">+0.9% MoM [CALCULATED]</div>
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

      {/* TOP 8 KPI CARDS WITH [WHY?] TRIGGER & DYNAMIC BORDERS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Executive Key Performance Indicators
            </h2>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Click [WHY?] for AI Root-Cause
            </span>
          </div>
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
              isPositive={kpi.isPositive}
              currency={currency}
              icon={kpi.icon}
              dataTrustTag={kpi.dataTrustTag}
              onWhyClick={() => handleOpenWhy(kpi.id)}
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
                {(kpiSnapshot?.revenueAchievementPct ?? 0).toFixed(1)}%
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
                  tickFormatter={(val) => `₹${(((val ?? 0) / 100000) || 0).toFixed(0)}L`}
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
                  dashArray="4 4"
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

      {/* TOP 5 CEO ACTIONS TODAY WITH ACTIONABLE BUTTONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Top 5 Actions */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Top 5 CEO Action Items Today
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
              const feedback = activeActionFeedback[action.id];

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

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700 font-mono-numeric block">
                        +{formatCurrency(action.expectedImpactAmount, currency)}
                      </span>
                      <span className="text-[9px] text-slate-400">Impact</span>
                    </div>
                  </div>

                  {/* 4 Action Triggers: [DO THIS NOW], [AUTO-EXECUTE], [ASSIGN TEAM], [REMIND ME] */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2 flex-wrap">
                    {feedback ? (
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{feedback}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            updateActionStatus(action.id, isDone ? 'Pending' : 'Completed');
                            handleActionClick(action.id, 'Executed successfully!');
                          }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-2xs"
                        >
                          {isDone ? 'Mark Pending' : '⚡ DO THIS NOW'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActionClick(action.id, 'AI Auto-Execution Triggered!')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>Auto-Execute</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActionClick(action.id, `Assigned to ${action.owner} with notification`)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1"
                        >
                          <Users className="w-2.5 h-2.5 text-slate-500" />
                          <span>Assign Team</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActionClick(action.id, 'Reminder scheduled for 2:00 PM')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1"
                        >
                          <Bell className="w-2.5 h-2.5 text-slate-500" />
                          <span>Remind Me</span>
                        </button>
                      </div>
                    )}
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
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveView('follow-ups')}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-xs transition-colors uppercase tracking-wider"
            >
              <span>Follow-up Recovery Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Root-Cause 'Why?' Modal */}
      <AIWhyAnalysisModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        diagnostic={selectedWhyDiagnostic}
        currency={currency}
      />

      {/* Revenue Goal Planner Modal */}
      <RevenueGoalPlannerModal
        isOpen={isGoalPlannerOpen}
        onClose={() => setIsGoalPlannerOpen(false)}
        currency={currency}
      />
    </div>
  );
};
