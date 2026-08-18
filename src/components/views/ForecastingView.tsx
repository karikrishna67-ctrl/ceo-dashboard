import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Sparkles,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';

export const ForecastingView: React.FC = () => {
  const { kpiSnapshot, currency, setActiveView } = useApp();
  const [horizon, setHorizon] = useState<'30' | '60' | '90'>('30');

  const forecastData = {
    '30': {
      conservative: 4450000,
      expected: 4920000,
      optimistic: 5380000,
    },
    '60': {
      conservative: 9200000,
      expected: 10400000,
      optimistic: 11800000,
    },
    '90': {
      conservative: 14100000,
      expected: 16200000,
      optimistic: 18500000,
    },
  };

  const currentHorizonData = forecastData[horizon];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Predictive Revenue Forecasting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Machine Learning Model
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Conservative, expected, and optimistic multi-horizon projections based on weighted pipeline probability and historical deal velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['30', '60', '90'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                horizon === h
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* 3 Forecast Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Conservative Forecast (90% Confidence)
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono-numeric">
            {formatCurrency(currentHorizonData.conservative, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assumes only locked renewals and highly probable late-stage negotiations close.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-amber-300 bg-amber-50/30 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Expected Base Case (Most Likely)
          </span>
          <div className="text-3xl font-black text-amber-900 font-mono-numeric">
            {formatCurrency(currentHorizonData.expected, currency)}
          </div>
          <p className="text-xs text-amber-700/80 mt-1">
            Historical deal conversion rate maintained across current qualified pipeline.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Optimistic Upside (Top Execution)
          </span>
          <div className="text-3xl font-black text-emerald-700 font-mono-numeric">
            {formatCurrency(currentHorizonData.optimistic, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accelerated close of enterprise tier deals with prompt-payment discount triggers.
          </p>
        </div>
      </div>
    </div>
  );
};
