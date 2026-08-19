import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';

export const CashFlowView: React.FC = () => {
  const { kpiSnapshot, currency, setActiveView } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Cash Flow, Runway & Working Capital
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {(kpiSnapshot.cashRunwayMonths ?? kpiSnapshot.runwayMonths ?? 0).toFixed(1)} Months Runway
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Cash reserves, net burn rate, receivables collection impact, and runway safety projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('scenario-planner')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Simulate Runway Scenarios
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Liquid Cash Reserves</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.cashBalance, currency)}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">HDFC & ICICI Bank Accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Monthly Net Burn Rate</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.monthlyBurnRate, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Operating cash expenditure / mo</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Runway Duration</span>
          <div className="text-2xl font-black text-emerald-700 font-mono-numeric mt-1">
            {(kpiSnapshot.cashRunwayMonths ?? kpiSnapshot.runwayMonths ?? 0).toFixed(1)} Months
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">Zero capital raise required</div>
        </div>
      </div>
    </div>
  );
};
