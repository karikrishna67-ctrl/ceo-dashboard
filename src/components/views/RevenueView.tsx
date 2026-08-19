import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import { KPIProgressCard } from '../common/KPIProgressCard';

export const RevenueView: React.FC = () => {
  const { kpiSnapshot, currency, currentOrg, setActiveView } = useApp();
  const [revenueTimeframe, setRevenueTimeframe] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  const quarterlyTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;
  const quarterlyMrrTarget = 8500000;
  const quarterlyOneTimeTarget = 4000000;

  const arpu = kpiSnapshot.activeCustomers > 0 ? Math.round(kpiSnapshot.mrr / kpiSnapshot.activeCustomers) : 30078;

  const revenueByProduct = [
    { name: 'Enterprise SaaS Suite', revenue: 2150000, pct: '55.8%', color: '#0f172a' },
    { name: 'Cloud Integration & AI Bots', revenue: 980000, pct: '25.5%', color: '#d97706' },
    { name: 'Managed Data Operations', revenue: 480000, pct: '12.5%', color: '#059669' },
    { name: 'Advisory & Onboarding', revenue: 240000, pct: '6.2%', color: '#4f46e5' },
  ];

  const revenueByChannel = [
    { channel: 'Outbound Enterprise Reps', revenue: 1680000, share: '43.6%' },
    { channel: 'WhatsApp / Inbound Organic', revenue: 1120000, share: '29.1%' },
    { channel: 'Google Search Ads (Intent)', revenue: 640000, share: '16.6%' },
    { channel: 'Partner Referrals & Resellers', revenue: 410000, share: '10.7%' },
  ];

  const recurringVsOneTime = [
    { name: 'Recurring Revenue (MRR / ARR)', value: kpiSnapshot.mrr, color: '#059669' },
    { name: 'One-Time Setup & Projects', value: Math.max(0, kpiSnapshot.revenueMTD - kpiSnapshot.mrr), color: '#d97706' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Revenue Streams & Monetization Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              68.1% MRR Quality
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Product revenue mix, customer acquisition channel attribution, recurring stability, and pricing tier distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('opportunities')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Explore Upsell Levers
          </button>
        </div>
      </div>

      {/* Configured Quarterly Target Pacing Banner */}
      <TargetProgressBar
        current={12630000}
        target={quarterlyTarget}
        label="Q3 FY26 Master Revenue Target"
        subLabel="Executive pacing against quarterly revenue goal across all four business lines"
        quarterLabel="Q3 Revenue"
        currency={currency}
        size="detailed"
        timeElapsedPct={66.7}
      />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIProgressCard
          label="Monthly Recurring Revenue (MRR)"
          value={formatCurrency(kpiSnapshot.mrr, currency)}
          current={kpiSnapshot.mrr * 3}
          target={quarterlyMrrTarget}
          quarterLabel="Q3 MRR Target"
          change="+18.5%"
          prevValue={formatCurrency(Math.round(kpiSnapshot.mrr * 0.85), currency)}
          isPositive={true}
          currency={currency}
          icon={CreditCard}
        />

        <KPIProgressCard
          label="One-Time / Implementation"
          value={formatCurrency(Math.max(0, kpiSnapshot.revenueMTD - kpiSnapshot.mrr), currency)}
          current={Math.max(0, kpiSnapshot.revenueMTD - kpiSnapshot.mrr) * 3}
          target={quarterlyOneTimeTarget}
          quarterLabel="Q3 Setup Target"
          change="+8.2%"
          prevValue={formatCurrency(1135000, currency)}
          isPositive={true}
          currency={currency}
          icon={Building}
        />

        <KPIProgressCard
          label="Average Revenue Per User (ARPU)"
          value={formatCurrency(arpu, currency)}
          current={arpu}
          target={35000}
          quarterLabel="Q3 ARPU Goal"
          change="+12.0%"
          prevValue={formatCurrency(Math.round(arpu * 0.89), currency)}
          isPositive={true}
          currency={currency}
          icon={DollarSign}
        />

        <KPIProgressCard
          label="Net Revenue Retention (NRR)"
          value="118.5%"
          current={118.5}
          target={120}
          unit="%"
          quarterLabel="Q3 NRR Target"
          change="+2.4%"
          prevValue="115.7%"
          isPositive={true}
          currency={currency}
          icon={TrendingUp}
        />
      </div>

      {/* Product Mix vs Channel Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product Mix */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Offering Breakdown
              </span>
              <h3 className="text-sm font-bold text-slate-900">Revenue Contribution by Product Line</h3>
            </div>
          </div>

          <div className="space-y-3">
            {revenueByProduct.map((prod, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">{prod.name}</span>
                  <span className="font-black text-slate-900 font-mono-numeric">
                    {formatCurrency(prod.revenue, currency)} ({prod.pct})
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: prod.pct,
                      backgroundColor: prod.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Channel Mix */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Channel Attribution
                </span>
                <h3 className="text-sm font-bold text-slate-900">Revenue by Acquisition Channel</h3>
              </div>
            </div>

            <div className="space-y-3">
              {revenueByChannel.map((ch, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{ch.channel}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{ch.share} of total book</div>
                  </div>
                  <span className="font-bold text-slate-900 font-mono-numeric">
                    {formatCurrency(ch.revenue, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveView('marketing')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Analyze Channel CAC & ROAS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
