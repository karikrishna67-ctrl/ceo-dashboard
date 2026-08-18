import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  PieChart as PieIcon,
  DollarSign,
  Users,
  Target,
  ShieldCheck,
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
import { TargetProgressBar } from '../common/TargetProgressBar';

export const BusinessOverviewView: React.FC = () => {
  const { kpiSnapshot, currency, currentOrg, setActiveView } = useApp();

  const quarterlyTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;

  const yoyComparison = [
    { metric: 'Gross Revenue', fy25: 2950000, fy26: 3850000, growth: '+30.5%' },
    { metric: 'Gross Profit', fy25: 2360000, fy26: 3157000, growth: '+33.8%' },
    { metric: 'Net Profit (EBITDA)', fy25: 590000, fy26: 862400, growth: '+46.2%' },
    { metric: 'Active Customer Base', fy25: 98, fy26: 128, growth: '+30.6%' },
    { metric: 'Average Deal Size', fy25: 110000, fy26: 145000, growth: '+31.8%' },
    { metric: 'CAC Payback Period', fy25: '3.8 mos', fy26: '2.4 mos', growth: '-36.8% (Faster)' },
  ];

  const businessModelStats = [
    { label: 'Business Model', value: currentOrg.businessModel, desc: 'Enterprise SaaS & Implementation' },
    { label: 'Revenue Model', value: 'Hybrid (Recurring + Fixed)', desc: '68% MRR / 32% One-time' },
    { label: 'Primary Market', value: 'India (Tier 1 & 2)', desc: 'Expanding to GCC / Southeast Asia' },
    { label: 'Target Audience', value: 'B2B Mid-Market & SME', desc: '₹10Cr - ₹100Cr Turnover' },
  ];

  const unitEconomics = [
    { label: 'Customer Lifetime Value (LTV)', value: formatCurrency(285000, currency), benchmark: '₹2.5L sector' },
    { label: 'Customer Acquisition Cost (CAC)', value: formatCurrency(14200, currency), benchmark: '₹22K sector' },
    { label: 'LTV : CAC Ratio', value: '20.1x', benchmark: '> 3.0x Healthy', highlight: true },
    { label: 'Monthly Churn Rate', value: '1.4%', benchmark: '< 2.0% World Class' },
    { label: 'Net Revenue Retention (NRR)', value: '118.5%', benchmark: '> 110% Strong' },
    { label: 'Gross Margin', value: '82.0%', benchmark: '> 75% Target' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Executive Business Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              FY26 MTD
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Macro business architecture, YoY financial compounding, unit economics, and customer retention dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('ai-advisor')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Audit Unit Economics with AI
          </button>
        </div>
      </div>

      {/* Quarterly Performance Pacing Progress Bar */}
      <TargetProgressBar
        current={12630000}
        target={quarterlyTarget}
        label="Q3 FY26 Enterprise Revenue Performance"
        subLabel="Aggregated quarter-to-date trajectory against configured quarterly milestone target"
        quarterLabel="Q3 Revenue"
        currency={currency}
        size="detailed"
        timeElapsedPct={66.7}
      />

      {/* Business Model Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessModelStats.map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500">{stat.label}</span>
            <div className="text-base font-bold text-slate-900 mt-1">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Unit Economics Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Foundational Metrics
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Unit Economics & Capital Efficiency Matrix
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Top Decile Efficiency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unitEconomics.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                item.highlight
                  ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                  : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <span className="text-xs text-slate-600 font-medium">{item.label}</span>
              <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
                {item.value}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Benchmark: {item.benchmark}</div>
            </div>
          ))}
        </div>
      </div>

      {/* YoY Comparison Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Compounding Analysis
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Year-over-Year (YoY) Financial Performance
            </h2>
          </div>
          <span className="text-xs text-slate-400">FY25 vs FY26 Trajectory</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-4">Performance Metric</th>
                <th className="py-3 px-4">FY25 Baseline</th>
                <th className="py-3 px-4">FY26 Current Run-Rate</th>
                <th className="py-3 px-4 text-right">YoY Expansion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {yoyComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">{row.metric}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {typeof row.fy25 === 'number' ? formatCurrency(row.fy25, currency) : row.fy25}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-bold">
                    {typeof row.fy26 === 'number' ? formatCurrency(row.fy26, currency) : row.fy26}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {row.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
