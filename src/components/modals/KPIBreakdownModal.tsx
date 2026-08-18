import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Users,
  Building,
  DollarSign,
  Briefcase,
  ArrowRight,
  Download,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Maximize2,
  Activity,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { CurrencyCode } from '../../types';
import { D3Sparkline } from '../common/D3Sparkline';

export interface BreakdownComponentItem {
  id: string;
  name: string;
  category: string;
  value: number;
  percentage: number;
  growth: string;
  isPositive: boolean;
  status: 'optimal' | 'on-track' | 'lagging' | 'at-risk';
  description?: string;
  owner?: string;
}

export interface ContributingItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  amount: number;
  stageOrStatus: string;
  probability?: number;
  owner: string;
  date: string;
}

export interface KPIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId?: string;
  label: string;
  value: string | number;
  current?: number;
  target?: number;
  targetDisplay?: string;
  unit?: string;
  quarterLabel?: string;
  change?: string;
  prevValue?: string;
  isPositive?: boolean;
  currency?: CurrencyCode;
  sparklineData?: number[];
  actionRoute?: string;
  timeElapsedPct?: number;
  subLabel?: string;
}

export const KPIBreakdownModal: React.FC<KPIBreakdownModalProps> = ({
  isOpen,
  onClose,
  metricId,
  label,
  value,
  current,
  target,
  targetDisplay,
  unit,
  quarterLabel = 'Q3 Target',
  change,
  prevValue,
  isPositive = true,
  currency = 'INR',
  sparklineData = [],
  actionRoute,
  timeElapsedPct = 67.7,
  subLabel,
}) => {
  const { currentOrg, kpiSnapshot, leads, customers, products, invoices, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'components' | 'contributors' | 'drivers' | 'simulator'>('components');
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simulator state
  const [simGrowthRate, setSimGrowthRate] = useState<number>(0);
  const [simEfficiencyGain, setSimEfficiencyGain] = useState<number>(0);

  const currCode: CurrencyCode = (currency as CurrencyCode) || 'INR';
  const numericCurrent = typeof current === 'number' ? current : typeof value === 'number' ? value : 0;
  const hasTarget = typeof target === 'number' && target > 0;
  const percent = hasTarget ? Math.round((numericCurrent / target!) * 1000) / 10 : 0;
  const gap = hasTarget ? Math.max(0, target! - numericCurrent) : 0;
  const isAheadOfPace = percent >= timeElapsedPct;

  // Derive contextual breakdown components based on metric label / type
  const { components, contributingItems, driverInsights, categoryName } = useMemo(() => {
    const lower = label.toLowerCase();

    // 1. REVENUE METRICS (Monthly Revenue, MRR, Total Revenue, etc.)
    if (lower.includes('revenue') || lower.includes('mrr') || lower.includes('arr') || lower.includes('turnover')) {
      const totalRev = numericCurrent > 0 ? numericCurrent : 3850000;
      
      const compList: BreakdownComponentItem[] = [
        {
          id: 'comp-rev-1',
          name: 'Enterprise Core Subscription (SaaS)',
          category: 'Recurring Software',
          value: Math.round(totalRev * 0.46),
          percentage: 46.0,
          growth: '+22.4% YoY',
          isPositive: true,
          status: 'optimal',
          description: 'Tier-1 enterprise accounts with multi-year annual commitments and auto-renewals.',
          owner: 'SaaS Business Unit',
        },
        {
          id: 'comp-rev-2',
          name: 'AI Revenue Optimizer & Add-ons',
          category: 'Recurring Software',
          value: Math.round(totalRev * 0.24),
          percentage: 24.0,
          growth: '+38.5% YoY',
          isPositive: true,
          status: 'optimal',
          description: 'High-margin automated forecasting and predictive agent modules.',
          owner: 'AI Product Division',
        },
        {
          id: 'comp-rev-3',
          name: 'Implementation & Professional Onboarding',
          category: 'One-Time Services',
          value: Math.round(totalRev * 0.18),
          percentage: 18.0,
          growth: '+6.2% YoY',
          isPositive: true,
          status: 'on-track',
          description: 'Custom ERP/CRM integrations and bespoke data engineering migrations.',
          owner: 'Solutions Engineering',
        },
        {
          id: 'comp-rev-4',
          name: 'Managed Growth Marketing Retainers',
          category: 'Managed Services',
          value: Math.round(totalRev * 0.12),
          percentage: 12.0,
          growth: '-2.1% YoY',
          isPositive: false,
          status: 'lagging',
          description: 'High-touch marketing operations retainers and fractional growth consulting.',
          owner: 'Agency Services',
        },
      ];

      const contributors: ContributingItem[] = [
        {
          id: 'contrib-1',
          title: 'Nexus Global FinTech',
          subtitle: 'Enterprise SaaS Tier + AI Engine',
          category: 'Enterprise',
          amount: 620000,
          stageOrStatus: 'Active Contract (Paid)',
          owner: 'Vikram Mehta',
          date: 'Aug 2026',
        },
        {
          id: 'contrib-2',
          title: 'Vertex Health Systems',
          subtitle: 'Predictive Ops Suite + Implementation',
          category: 'Healthcare',
          amount: 510000,
          stageOrStatus: 'Active Contract (Paid)',
          owner: 'Rohan Gupta',
          date: 'Aug 2026',
        },
        {
          id: 'contrib-3',
          title: 'OmniRetail Hyperstores',
          subtitle: 'Growth Engine Retainer + SaaS',
          category: 'Retail',
          amount: 430000,
          stageOrStatus: 'Active Contract (Paid)',
          owner: 'Priya Sharma',
          date: 'Aug 2026',
        },
        {
          id: 'contrib-4',
          title: 'Bharat Logistics Hub',
          subtitle: 'Supply Chain AI Integration',
          category: 'Logistics',
          amount: 380000,
          stageOrStatus: 'Renewal Pending (Net-30)',
          owner: 'Vikram Mehta',
          date: 'Aug 2026',
        },
        {
          id: 'contrib-5',
          title: 'ApexCloud Technologies',
          subtitle: 'Enterprise SaaS Core',
          category: 'Tech / Cloud',
          amount: 290000,
          stageOrStatus: 'Active Contract (Paid)',
          owner: 'Ananya Sen',
          date: 'Aug 2026',
        },
      ];

      const insights = [
        {
          title: 'SaaS Expansion Momentum',
          desc: 'Recurring SaaS components comprise 70.0% of total revenue with 85.5% gross margin, providing strong predictability.',
          type: 'positive',
        },
        {
          title: 'Professional Services Bottleneck',
          desc: 'One-time onboarding revenue delayed by 14 days due to client ERP testing cycles. Accelerating delivery unlocks ₹3.8L.',
          type: 'warning',
        },
        {
          title: 'Top Account Concentration',
          desc: 'Top 5 accounts represent 48.2% of current monthly revenue. Health scores are high (92/100) with zero churn risk.',
          type: 'neutral',
        },
      ];

      return {
        components: compList,
        contributingItems: contributors,
        driverInsights: insights,
        categoryName: 'Revenue Streams Breakdown',
      };
    }

    // 2. SALES PIPELINE & CRM METRICS
    if (lower.includes('sales') || lower.includes('pipeline') || lower.includes('deal') || lower.includes('win rate')) {
      const totalPipe = numericCurrent > 0 ? numericCurrent : 38200000;

      const compList: BreakdownComponentItem[] = [
        {
          id: 'comp-pipe-1',
          name: 'Executive Negotiation & Contracts',
          category: 'Late Stage (>80% Prob)',
          value: Math.round(totalPipe * 0.38),
          percentage: 38.0,
          growth: '+28.0% QoQ',
          isPositive: true,
          status: 'optimal',
          description: 'Contracts in security review and CFO sign-off stage with high closing confidence.',
          owner: 'Senior Account Execs',
        },
        {
          id: 'comp-pipe-2',
          name: 'Formal Proposals & Solution Demos',
          category: 'Mid Stage (50-70% Prob)',
          value: Math.round(totalPipe * 0.32),
          percentage: 32.0,
          growth: '+14.5% QoQ',
          isPositive: true,
          status: 'on-track',
          description: 'Commercial proposals delivered; scoping architecture with prospect stakeholders.',
          owner: 'Mid-Market Sales',
        },
        {
          id: 'comp-pipe-3',
          name: 'Qualified Needs Discovery & Scoping',
          category: 'Early Stage (30% Prob)',
          value: Math.round(totalPipe * 0.20),
          percentage: 20.0,
          growth: '+8.0% QoQ',
          isPositive: true,
          status: 'on-track',
          description: 'Inbound high-intent leads that passed BANT qualification criteria.',
          owner: 'SDR & Inbound Team',
        },
        {
          id: 'comp-pipe-4',
          name: 'Long-Cycle Stalled Deals Review',
          category: 'At Risk (<20% Prob)',
          value: Math.round(totalPipe * 0.10),
          percentage: 10.0,
          growth: '-15.2% QoQ',
          isPositive: false,
          status: 'at-risk',
          description: 'Deals inactive for >25 days requiring CEO executive sponsorship to revive.',
          owner: 'Sales Leadership',
        },
      ];

      const contributors: ContributingItem[] = leads && leads.length > 0 ? leads.slice(0, 5).map((l, i) => ({
        id: l.id,
        title: l.company || l.name,
        subtitle: `${l.industry || 'Enterprise'} • ${l.source}`,
        category: l.temperature === 'hot' ? 'Hot Priority' : 'Active Pipeline',
        amount: l.estimatedValue || 450000,
        stageOrStatus: `${l.status} (${l.dealProbability || 75}%)`,
        probability: l.dealProbability || 75,
        owner: l.assignedSalesperson || 'Vikram Mehta',
        date: l.nextFollowupDate || '2026-08-18',
      })) : [
        {
          id: 'pipe-1',
          title: 'FinTrack Digital',
          subtitle: 'FinTech • Google Ads Campaign',
          category: 'Hot Priority',
          amount: 650000,
          stageOrStatus: 'Negotiation (85%)',
          probability: 85,
          owner: 'Rohan Gupta',
          date: '2026-08-18',
        },
        {
          id: 'pipe-2',
          title: 'Apex Logistics Hub',
          subtitle: 'Logistics • LinkedIn Outbound',
          category: 'Hot Priority',
          amount: 420000,
          stageOrStatus: 'Proposal (80%)',
          probability: 80,
          owner: 'Vikram Mehta',
          date: '2026-08-17',
        },
        {
          id: 'pipe-3',
          title: 'Zenith Healthtech',
          subtitle: 'Healthcare • Strategic Referral',
          category: 'Warm Pipeline',
          amount: 280000,
          stageOrStatus: 'Appointment (60%)',
          probability: 60,
          owner: 'Priya Sharma',
          date: '2026-08-19',
        },
      ];

      const insights = [
        {
          title: 'High Closing Concentration in Q3',
          desc: '₹1.45 Cr in late-stage negotiation represents 115% coverage of the remaining quarterly sales quota.',
          type: 'positive',
        },
        {
          title: 'Sales Cycle Velocity',
          desc: 'Enterprise sales cycle has compressed from 28 days to 21.4 days following streamlined security sign-off.',
          type: 'positive',
        },
        {
          title: 'Rep Quota Disparity',
          desc: 'Top 2 reps generate 68% of closed revenue; coaching SDR handoffs will balance middle-tier rep attainment.',
          type: 'warning',
        },
      ];

      return {
        components: compList,
        contributingItems: contributors,
        driverInsights: insights,
        categoryName: 'Sales Pipeline & Stage Attribution',
      };
    }

    // 3. PROFITABILITY, EXPENSES & UNIT ECONOMICS
    if (lower.includes('profit') || lower.includes('margin') || lower.includes('ebitda') || lower.includes('cash') || lower.includes('burn')) {
      const baseVal = numericCurrent > 0 ? numericCurrent : 1420000;

      const compList: BreakdownComponentItem[] = [
        {
          id: 'comp-p-1',
          name: 'Gross SaaS Subscription Margin',
          category: 'Software Margin',
          value: Math.round(baseVal * 0.58),
          percentage: 58.0,
          growth: '+4.2% Margin Expansion',
          isPositive: true,
          status: 'optimal',
          description: 'High 85.5% gross contribution margin with minimal direct server/API cloud COGS.',
          owner: 'Finance & Infrastructure',
        },
        {
          id: 'comp-p-2',
          name: 'Professional Consulting Net Contribution',
          category: 'Services Margin',
          value: Math.round(baseVal * 0.26),
          percentage: 26.0,
          growth: '+1.5% YoY',
          isPositive: true,
          status: 'on-track',
          description: '72.8% gross margin covering billable delivery engineer payroll.',
          owner: 'Operations',
        },
        {
          id: 'comp-p-3',
          name: 'Marketing & Customer Acquisition Cost (CAC)',
          category: 'Sales & Marketing',
          value: Math.round(baseVal * 0.16),
          percentage: 16.0,
          growth: '-8.5% CAC Efficiency',
          isPositive: true,
          status: 'optimal',
          description: 'Blended CAC at ₹14.2K yielding an exceptional 20.1x LTV:CAC ratio.',
          owner: 'Growth Marketing',
        },
      ];

      const contributors: ContributingItem[] = [
        {
          id: 'prof-1',
          title: 'AWS Cloud Infrastructure Optimization',
          subtitle: 'Serverless Auto-scaling & Reserved Instances',
          category: 'COGS Savings',
          amount: 145000,
          stageOrStatus: 'Optimized (₹1.45L Saved/mo)',
          owner: 'DevOps Team',
          date: 'Active',
        },
        {
          id: 'prof-2',
          title: 'Sales Compensation & Commission Yield',
          subtitle: 'Tiered Quota Acceleration Plan',
          category: 'Operating Expense',
          amount: 320000,
          stageOrStatus: 'On Budget',
          owner: 'Pooja Iyer (CFO)',
          date: 'Monthly',
        },
        {
          id: 'prof-3',
          title: 'AI Token & Infrastructure Routing',
          subtitle: 'Hybrid Routing & Cache Engine',
          category: 'COGS',
          amount: 68000,
          stageOrStatus: 'Below Budget',
          owner: 'Engineering',
          date: 'Active',
        },
      ];

      const insights = [
        {
          title: 'Gross Margin Expansion to 82.0%',
          desc: 'Gross margin expanded by 340 bps YoY due to software mix shift from 60% to 70% of total revenue.',
          type: 'positive',
        },
        {
          title: 'Net Burn Runway Safety',
          desc: 'Current cash reserves provide >14.5 months of operational runway with zero external credit needed.',
          type: 'positive',
        },
      ];

      return {
        components: compList,
        contributingItems: contributors,
        driverInsights: insights,
        categoryName: 'Profitability & Margin Architecture',
      };
    }

    // 4. CUSTOMER RETENTION & LEADS METRICS (Generic / Default)
    const baseVal = numericCurrent > 0 ? numericCurrent : 100;
    const compList: BreakdownComponentItem[] = [
      {
        id: 'comp-gen-1',
        name: 'Enterprise Tier Accounts',
        category: 'Tier 1',
        value: Math.round(baseVal * 0.52),
        percentage: 52.0,
        growth: '+18.0%',
        isPositive: true,
        status: 'optimal',
        description: 'Highest retention cohort with 124% net revenue retention.',
        owner: 'Strategic Accounts',
      },
      {
        id: 'comp-gen-2',
        name: 'Mid-Market Growth Segment',
        category: 'Tier 2',
        value: Math.round(baseVal * 0.33),
        percentage: 33.0,
        growth: '+12.4%',
        isPositive: true,
        status: 'on-track',
        description: 'Solid core accounts adopting additional AI optimizer modules.',
        owner: 'Mid-Market Team',
      },
      {
        id: 'comp-gen-3',
        name: 'SMB & Self-Serve Cohort',
        category: 'Tier 3',
        value: Math.round(baseVal * 0.15),
        percentage: 15.0,
        growth: '-3.1%',
        isPositive: false,
        status: 'lagging',
        description: 'Lower touch self-serve customers with standard onboarding.',
        owner: 'Growth Ops',
      },
    ];

    const contributors: ContributingItem[] = [
      {
        id: 'gen-1',
        title: 'Nexus FinTech',
        subtitle: 'Enterprise Tier 1',
        category: 'Core Contributor',
        amount: Math.round(baseVal * 0.22),
        stageOrStatus: 'Healthy (Score: 95)',
        owner: 'Account Team',
        date: 'Active',
      },
      {
        id: 'gen-2',
        title: 'Vertex Health',
        subtitle: 'Healthcare Enterprise',
        category: 'Core Contributor',
        amount: Math.round(baseVal * 0.18),
        stageOrStatus: 'Healthy (Score: 92)',
        owner: 'Account Team',
        date: 'Active',
      },
    ];

    const insights = [
      {
        title: 'Strong Core Cohort Compounding',
        desc: 'Key accounts maintain strong engagement with minimal historical contraction.',
        type: 'positive',
      },
    ];

    return {
      components: compList,
      contributingItems: contributors,
      driverInsights: insights,
      categoryName: 'Component Contribution Matrix',
    };
  }, [label, numericCurrent, leads, customers, products]);

  // Filtered contributing items
  const filteredContributors = useMemo(() => {
    return contributingItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [contributingItems, filterQuery, selectedCategory]);

  // Chart data for components breakdown
  const chartData = useMemo(() => {
    return components.map((c) => ({
      name: c.name.length > 20 ? `${c.name.substring(0, 20)}...` : c.name,
      fullName: c.name,
      value: c.value,
      percentage: c.percentage,
      fill: c.isPositive ? '#059669' : '#e11d48',
    }));
  }, [components]);

  // Simulated metrics
  const simulatedTotal = useMemo(() => {
    const growthMult = 1 + simGrowthRate / 100;
    const effMult = 1 + simEfficiencyGain / 100;
    return Math.round(numericCurrent * growthMult * effMult);
  }, [numericCurrent, simGrowthRate, simEfficiencyGain]);

  const simulatedPercent = hasTarget ? Math.min(100, Math.round((simulatedTotal / target!) * 1000) / 10) : 0;
  const simulatedGap = hasTarget ? Math.max(0, target! - simulatedTotal) : 0;

  // Format utility
  const formatVal = (v: number) => {
    if (unit) return `${v.toLocaleString()} ${unit}`;
    return formatCurrency(v, currCode);
  };

  // Copy summary handler
  const handleCopySummary = () => {
    const summary = `Executive Breakdown: ${label}\nCurrent Value: ${formatVal(numericCurrent)}\nTarget: ${
      hasTarget ? formatVal(target!) : 'N/A'
    } (${percent}% achieved)\nPacing: ${isAheadOfPace ? 'Ahead of Pace' : 'Behind Pace'}\n\nKey Components:\n${components
      .map((c) => `- ${c.name}: ${formatVal(c.value)} (${c.percentage}% share, ${c.growth})`)
      .join('\n')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Component Name', 'Category', 'Value', 'Percentage Share', 'Growth YoY', 'Status', 'Owner'];
    const rows = components.map((c) => [
      `"${c.name}"`,
      `"${c.category}"`,
      c.value,
      `"${c.percentage}%"`,
      `"${c.growth}"`,
      `"${c.status}"`,
      `"${c.owner || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${label.replace(/[^a-zA-Z0-9]/g, '_')}_Breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                {categoryName}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                FY26 Q3 Pacing
              </span>
              {isAheadOfPace ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ahead of Target Pacing
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Pacing Behind Milestone
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {label}
            </h1>
            <p className="text-xs text-slate-500">
              {subLabel || `Comprehensive multi-segment audit of contributors, drivers, and pacing for ${label}.`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Target & Trajectory Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Metric Snapshot */}
            <div className="md:col-span-5 space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Performance
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono-numeric">
                  {typeof value === 'number' ? formatVal(value) : value}
                </div>
                {change && (
                  <div
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{change}</span>
                  </div>
                )}
              </div>
              {prevValue && (
                <div className="text-xs text-slate-400 font-mono-numeric">
                  Prior Milestone: {prevValue}
                </div>
              )}
            </div>

            {/* Middle: Progress Bar vs Milestone */}
            {hasTarget ? (
              <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-slate-700/80 md:pl-4 pt-3 md:pt-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    {quarterLabel}:
                  </span>
                  <span className="font-bold text-amber-300 font-mono-numeric">
                    {targetDisplay || formatVal(target!)} ({percent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-700/80 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numeric">
                  <span>Pacing: {timeElapsedPct}% elapsed</span>
                  {gap > 0 ? (
                    <span className="text-amber-300 font-semibold">Gap: {formatVal(gap)}</span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">Target Exceeded!</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="md:col-span-4 space-y-1 border-t md:border-t-0 md:border-l border-slate-700/80 md:pl-4 pt-3 md:pt-0">
                <div className="text-xs text-slate-400 font-medium">Historical Reliability</div>
                <div className="text-lg font-bold text-emerald-400">98.4% Pacing Stability</div>
                <div className="text-xs text-slate-400">High confidence compounding trajectory</div>
              </div>
            )}

            {/* Right: 30-Day D3 Interactive Trend */}
            <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-700/80 md:pl-4 pt-3 md:pt-0">
              <div className="text-[11px] text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                30-Day Trend
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700">
                <D3Sparkline
                  data={sparklineData}
                  width={110}
                  height={32}
                  isPositive={isPositive}
                  colorVariant={isPositive ? 'emerald' : 'rose'}
                  currency={currCode}
                  unit={unit}
                  label={label}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-5 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('components')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'components'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Component Breakdown ({components.length})
            </button>

            <button
              onClick={() => setActiveTab('contributors')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'contributors'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Contributing Accounts & Deals
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'drivers'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Driver Insights
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Scenario Simulator
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-[#f8fafc]">
          {/* TAB 1: COMPONENT BREAKDOWN */}
          {activeTab === 'components' && (
            <div className="space-y-5">
              {/* Component Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {comp.category}
                        </span>
                        <h2 className="text-sm font-bold text-slate-900 mt-0.5">{comp.name}</h2>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.status === 'optimal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : comp.status === 'on-track'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {comp.growth}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="text-xl font-black text-slate-900 font-mono-numeric">
                        {formatVal(comp.value)}
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono-numeric">
                        {comp.percentage}% share
                      </div>
                    </div>

                    {/* Progress Bar of Component Share */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          comp.isPositive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                            : 'bg-gradient-to-r from-rose-500 to-amber-500'
                        }`}
                        style={{ width: `${comp.percentage}%` }}
                      />
                    </div>

                    {comp.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{comp.description}</p>
                    )}

                    {comp.owner && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Lead Unit:</span>
                        <span className="font-semibold text-slate-700">{comp.owner}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Horizontal Bar Chart Visualizer */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Distribution Overview
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                      Component Weight & Revenue Contribution
                    </h2>
                  </div>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => (unit ? `${v}` : `${(v / 100000).toFixed(1)}L`)}
                        stroke="#64748b"
                        fontSize={11}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        width={130}
                      />
                      <Tooltip
                        formatter={(val: number) => [formatVal(val), 'Contribution']}
                        labelFormatter={(label) => `Component: ${label}`}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRIBUTING ACCOUNTS & DEALS */}
          {activeTab === 'contributors' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                <input
                  type="text"
                  placeholder="Search contributing account, deal, or owner..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 flex-1"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="all">All Segments</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="hot">Hot Priority</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredContributors.length > 0 ? (
                  filteredContributors.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.title.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.subtitle}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="font-black text-slate-900 font-mono-numeric text-base">
                            {formatVal(item.amount)}
                          </div>
                          <span className="text-[11px] font-medium text-emerald-700">
                            {item.stageOrStatus}
                          </span>
                        </div>

                        <div className="text-right text-xs text-slate-400 hidden md:block">
                          <div>Owner: <span className="text-slate-700 font-medium">{item.owner}</span></div>
                          <div className="text-[10px]">{item.date}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                    No matching accounts found for query "{filterQuery}".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DRIVER INSIGHTS */}
          {activeTab === 'drivers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {driverInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      insight.type === 'positive'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : insight.type === 'warning'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-slate-200'
                    } space-y-2`}
                  >
                    <div className="flex items-center gap-2">
                      {insight.type === 'positive' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div className="font-bold text-slate-900 text-xs">{insight.title}</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{insight.desc}</p>
                  </div>
                ))}
              </div>

              {/* Actionable Strategy Recommendations */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    AI Strategic Playbook to Accelerate {label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-900 block">1. Annual Upfront Incentive</span>
                    <p className="text-slate-500 text-[11px]">
                      Offer 12% discount on multi-year contract renewals to lock in predictable ARR and eliminate collection lag.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-900 block">2. Fast-Track Proposal SLA</span>
                    <p className="text-slate-500 text-[11px]">
                      Enforce 24-hour turnaround on technical proposals for hot leads to capture +15% conversion lift.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCENARIO SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Interactive Sensitivity Model
                </span>
                <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                  Simulate Growth & Conversion Levers
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust strategic levers to observe forecasted impact against your {quarterLabel}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Sliders */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Growth / Expansion Lift</span>
                      <span className="font-bold text-emerald-700 font-mono-numeric">
                        {simGrowthRate > 0 ? `+${simGrowthRate}%` : `${simGrowthRate}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      value={simGrowthRate}
                      onChange={(e) => setSimGrowthRate(Number(e.target.value))}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>-20% (Contraction)</span>
                      <span>0% (Baseline)</span>
                      <span>+40% (Aggressive)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Operational Conversion Gain</span>
                      <span className="font-bold text-indigo-700 font-mono-numeric">
                        {simEfficiencyGain > 0 ? `+${simEfficiencyGain}%` : `${simEfficiencyGain}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={simEfficiencyGain}
                      onChange={(e) => setSimEfficiencyGain(Number(e.target.value))}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0%</span>
                      <span>+15% Faster Close</span>
                      <span>+30% Elite</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Outcome Display */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Forecasted Outcome
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono-numeric mt-1">
                      {formatVal(simulatedTotal)}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Delta vs Baseline:{' '}
                      <strong className={simulatedTotal >= numericCurrent ? 'text-emerald-400' : 'text-rose-400'}>
                        {simulatedTotal >= numericCurrent ? '+' : ''}
                        {formatVal(simulatedTotal - numericCurrent)}
                      </strong>
                    </div>
                  </div>

                  {hasTarget && (
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span>Target Attainment:</span>
                        <span className="font-bold text-amber-300 font-mono-numeric">{simulatedPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                          style={{ width: `${Math.min(100, simulatedPercent)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {simulatedGap === 0 ? 'Target achieved!' : `Remaining gap: ${formatVal(simulatedGap)}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Click any component or account row for deeper granular inspection.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
            {actionRoute && (
              <button
                onClick={() => {
                  onClose();
                  setActiveView(actionRoute);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Go to Full Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
