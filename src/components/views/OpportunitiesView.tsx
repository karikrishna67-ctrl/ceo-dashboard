import React from 'react';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';

export const OpportunitiesView: React.FC = () => {
  const { opportunities, currency, setActiveView, convertOpportunityToTask } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Opportunities & Expansion Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {opportunities.length} Levers Identified
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Algorithmic expansion playbooks, underpriced enterprise accounts, cross-sell opportunities, and vendor renegotiations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-view-all-action-tasks"
            onClick={() => setActiveView('tasks')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Assign as Action Tasks
          </button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            id={`opp-card-${opp.id}`}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {opp.category}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono-numeric">
                  +{formatCurrency(opp.estimatedUpsideAmount || opp.potentialRevenue || 0, currency)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{opp.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {opp.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Effort: <strong className="text-slate-800">{opp.effortLevel}</strong></span>
              <button
                id={`btn-execute-playbook-${opp.id}`}
                onClick={() => convertOpportunityToTask(opp.id)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Execute Playbook</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
