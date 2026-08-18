import React, { useState } from 'react';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  PieChart,
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const MarketingView: React.FC = () => {
  const { campaigns, currency, setActiveView } = useApp();

  const [reallocateAmount, setReallocateAmount] = useState<number>(60000);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Metrics
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);
  const totalCustomers = campaigns.reduce((sum, c) => sum + c.customersAcquired, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenueGenerated, 0);
  const blendedCAC = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
  const blendedROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : '0';

  // Projected extra revenue from reallocating Meta -> WhatsApp
  // Meta ROAS is 3.2x, WhatsApp is 35.6x. Difference is 32.4x.
  const projectedExtraRevenue = reallocateAmount * (35.6 - 3.2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Marketing ROI & Channel Attribution
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {blendedROAS}x Blended ROAS
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track lead acquisition cost (CAC), cost per lead (CPL), and return on ad spend across every inbound channel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('ai-advisor')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Budget Reallocation Audit</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Monthly Ad Spend</div>
          <div className="text-xl font-black text-slate-900 font-mono-numeric mt-1">
            {formatCurrency(totalSpend, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Budget: ₹4.5L</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Leads Generated</div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">{totalLeads}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">+24% vs last month</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Customers Won</div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">{totalCustomers}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">New accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-800">Blended CAC</div>
          <div className="text-xl font-black text-indigo-900 font-mono-numeric mt-1">
            {formatCurrency(blendedCAC, currency)}
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1">Payback &lt; 2.2 mos</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800">Revenue Won</div>
          <div className="text-xl font-black text-emerald-900 font-mono-numeric mt-1">
            {formatCurrency(totalRevenue, currency)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">Direct attribution</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800">Blended ROAS</div>
          <div className="text-2xl font-black text-purple-900 font-mono-numeric mt-1">{blendedROAS}x</div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">High efficiency</div>
        </div>
      </div>

      {/* AI Best vs Worst Channel Intelligence Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ⭐ BEST PERFORMING CHANNEL
              </span>
              <span className="text-xs font-black text-emerald-800 font-mono-numeric">35.6x ROAS</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">WhatsApp Inbound & Direct Retargeting</h3>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Lowest CAC in the portfolio at <strong>₹2,272</strong> per customer. High conversion velocity with 11 deals closed on ₹25k spend generating <strong>₹8.90L</strong> in revenue.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-bold">Recommendation: Scale monthly budget +₹50k</span>
            <button
              onClick={() => showToast('Budget allocation increased for WhatsApp Inbound.')}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
            >
              Scale Channel
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-300">
                ⚠️ LEAST EFFICIENT CHANNEL
              </span>
              <span className="text-xs font-black text-rose-800 font-mono-numeric">3.2x ROAS</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Meta Ads (Instagram & Facebook Top-of-Funnel)</h3>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Highest CAC at <strong>₹31,666</strong> with only 3 closed customers from ₹95k spend. High lead volume but poor deal qualification rate.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs">
            <span className="text-rose-800 font-bold">Recommendation: Reallocate ₹60k to WhatsApp</span>
            <button
              onClick={() => showToast('Trimmed Meta ad budget by ₹60k to cut waste.')}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
            >
              Trim Budget
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Budget Reallocation Simulator */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              AI Budget Simulator
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Shift Spend from Meta Ads → WhatsApp Inbound
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Projected Extra Revenue:</span>
            <div className="text-lg font-black text-emerald-600 font-mono-numeric">
              +{formatCurrency(projectedExtraRevenue, currency)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Reallocation Amount: {formatCurrency(reallocateAmount, currency)}</span>
            <span className="text-slate-400">Max: ₹95,000 (Meta budget)</span>
          </div>
          <input
            type="range"
            min={10000}
            max={95000}
            step={5000}
            value={reallocateAmount}
            onChange={(e) => setReallocateAmount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>₹10,000</span>
            <span>₹50,000</span>
            <span>₹95,000</span>
          </div>
        </div>
      </div>

      {/* Channel Performance Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Channel Attribution Breakdown</h2>
          <span className="text-xs text-slate-400">{campaigns.length} Tracked Channels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-3">Campaign / Channel</th>
                <th className="py-3 px-3">Monthly Spend</th>
                <th className="py-3 px-3">Leads</th>
                <th className="py-3 px-3">Cost per Lead</th>
                <th className="py-3 px-3">Cust. Won</th>
                <th className="py-3 px-3">CAC</th>
                <th className="py-3 px-3">Revenue Won</th>
                <th className="py-3 px-3 text-right">ROAS Multiple</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-sans">
                    <div className="font-bold text-slate-900">{camp.name}</div>
                    <div className="text-[11px] text-slate-500">{camp.channel}</div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {formatCurrency(camp.spend, currency)}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{camp.leadsGenerated}</td>
                  <td className="py-3.5 px-3 text-slate-600">{formatCurrency(camp.cpl, currency)}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{camp.customersAcquired}</td>
                  <td className="py-3.5 px-3 text-slate-700">{formatCurrency(camp.cac, currency)}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700">
                    {formatCurrency(camp.revenueGenerated, currency)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        camp.roas >= 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : camp.roas >= 5
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {camp.roas}x ROAS
                    </span>
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
