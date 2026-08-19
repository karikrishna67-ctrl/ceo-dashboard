import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const ScenarioPlannerView: React.FC = () => {
  const { kpiSnapshot, currency, addToast } = useApp();

  const [priceChangePct, setPriceChangePct] = useState(0);
  const [conversionBoostPct, setConversionBoostPct] = useState(0);
  const [adSpendBoostPct, setAdSpendBoostPct] = useState(0);
  const [churnReductionPct, setChurnReductionPct] = useState(0);

  // Baseline
  const baseRevenue = kpiSnapshot.revenueMTD;
  const baseNetProfit = kpiSnapshot.netProfit;

  // Simulated Calculations
  const simulatedRevenue = Math.round(
    baseRevenue *
      (1 + priceChangePct / 100) *
      (1 + conversionBoostPct / 100 * 0.4) *
      (1 + adSpendBoostPct / 100 * 0.25) *
      (1 + churnReductionPct / 100 * 0.15)
  );

  const revenueDelta = simulatedRevenue - baseRevenue;
  const simulatedNetProfit = Math.round(
    baseNetProfit + revenueDelta * 0.75 - (baseRevenue * (adSpendBoostPct / 100) * 0.08)
  );
  const netProfitDelta = simulatedNetProfit - baseNetProfit;

  const handleReset = () => {
    setPriceChangePct(0);
    setConversionBoostPct(0);
    setAdSpendBoostPct(0);
    setChurnReductionPct(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Executive Scenario Simulator & What-If Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sensitivity Engine
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Simulate pricing adjustments, pipeline conversion rate boosts, ad spend scaling, and churn reduction on bottom-line profit.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Sliders vs Simulated Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Adjustable Strategic Levers
          </h2>

          <div className="space-y-5">
            {/* Lever 1: Price Change */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-800">1. Pricing Adjustment</span>
                <span className="text-amber-800 font-bold font-mono-numeric">
                  {priceChangePct > 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="5"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>-20% Discount</span>
                <span>0% Baseline</span>
                <span>+30% Premium</span>
              </div>
            </div>

            {/* Lever 2: Conversion Boost */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-800">2. Sales Proposal Conversion Boost</span>
                <span className="text-amber-800 font-bold font-mono-numeric">
                  +{conversionBoostPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={conversionBoostPct}
                onChange={(e) => setConversionBoostPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0%</span>
                <span>+25% Fix Bottleneck</span>
                <span>+50% Elite Close</span>
              </div>
            </div>

            {/* Lever 3: Ad Spend Boost */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-800">3. Scale Marketing Spend (High ROAS)</span>
                <span className="text-amber-800 font-bold font-mono-numeric">
                  +{adSpendBoostPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={adSpendBoostPct}
                onChange={(e) => setAdSpendBoostPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% Base Spend</span>
                <span>+50% Scale</span>
                <span>+100% 2x Budget</span>
              </div>
            </div>

            {/* Lever 4: Churn Reduction */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-800">4. Customer Churn Reduction</span>
                <span className="text-amber-800 font-bold font-mono-numeric">
                  -{churnReductionPct}% Churn
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={churnReductionPct}
                onChange={(e) => setChurnReductionPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% Current (1.4%)</span>
                <span>-25% Retention Push</span>
                <span>-50% Elite Lock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projected Impact Results */}
        <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Projected Bottom-Line Financial Impact
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Simulated 30-Day Run-Rate
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500">Projected Monthly Revenue</span>
                <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
                  {formatCurrency(simulatedRevenue, currency)}
                </div>
                <div className="text-xs font-bold text-emerald-700 font-mono-numeric mt-1">
                  {revenueDelta >= 0 ? `+${formatCurrency(revenueDelta, currency)}` : formatCurrency(revenueDelta, currency)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs text-amber-800 font-medium">Projected Net Profit (EBITDA)</span>
                <div className="text-2xl font-black text-amber-900 font-mono-numeric mt-1">
                  {formatCurrency(simulatedNetProfit, currency)}
                </div>
                <div className="text-xs font-bold text-emerald-700 font-mono-numeric mt-1">
                  {netProfitDelta >= 0 ? `+${formatCurrency(netProfitDelta, currency)}` : formatCurrency(netProfitDelta, currency)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Simulated Net Margin:</span>
                <strong className="text-slate-900 font-mono-numeric">
                  {((simulatedNetProfit / (simulatedRevenue || 1)) * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Baseline Net Margin:</span>
                <strong className="text-slate-500 font-mono-numeric">22.4%</strong>
              </div>
            </div>
          </div>

          <button
            id="btn-save-scenario"
            onClick={() => addToast('Simulated strategy saved to Executive Scenarios dossier.', 'success')}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Save Scenario to Strategy Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
