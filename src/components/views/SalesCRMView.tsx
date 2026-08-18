import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import { KPIProgressCard } from '../common/KPIProgressCard';

export const SalesCRMView: React.FC = () => {
  const { kpiSnapshot, salesReps, deals, currency, currentOrg, updateDealStage, setActiveView } = useApp();

  const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const quarterlyPipelineTarget = 45000000;
  const quarterlySalesTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Sales CRM Pipeline & Rep Leaderboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {formatCurrency(kpiSnapshot.pipelineValue, currency)} Pipeline
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Live deal stage progression, bottleneck mitigation, rep quota pacing, and conversion velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('leads')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Manage Inbound Leads
          </button>
        </div>
      </div>

      {/* Sales KPI Summary Cards with Sleek Gradient Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIProgressCard
          label="Active Sales Pipeline"
          value={formatCurrency(kpiSnapshot.pipelineValue, currency)}
          current={38200000}
          target={quarterlyPipelineTarget}
          quarterLabel="Q3 Target"
          change="+19.5%"
          prevValue={formatCurrency(32000000, currency)}
          isPositive={true}
          currency={currency}
          icon={Briefcase}
        />

        <KPIProgressCard
          label="Closed Won Revenue (QTD)"
          value={formatCurrency(12630000, currency)}
          current={12630000}
          target={quarterlySalesTarget}
          quarterLabel="Q3 Goal"
          change="+14.2%"
          prevValue={formatCurrency(11050000, currency)}
          isPositive={true}
          currency={currency}
          icon={DollarSign}
        />

        <KPIProgressCard
          label="Average Deal Size"
          value={formatCurrency(kpiSnapshot.averageDealSize, currency)}
          current={kpiSnapshot.averageDealSize}
          target={150000}
          quarterLabel="Q3 Deal Target"
          change="+14.3%"
          prevValue={formatCurrency(125000, currency)}
          isPositive={true}
          currency={currency}
          icon={Award}
        />

        <KPIProgressCard
          label="Sales Win Rate"
          value={`${kpiSnapshot.winRatePct}%`}
          current={kpiSnapshot.winRatePct}
          target={30}
          unit="%"
          quarterLabel="Q3 Win Goal"
          change="+2.5%"
          prevValue="22.0%"
          isPositive={true}
          currency={currency}
          icon={TrendingUp}
        />
      </div>

      {/* Rep Leaderboard */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Team Performance
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Sales Rep Quota Attainment Leaderboard
            </h2>
          </div>
          <span className="text-xs text-slate-400">Monthly Targets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {salesReps.map((rep, idx) => (
            <div key={rep.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{rep.name}</div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span>Closed Revenue:</span>
                  <span className="font-bold text-slate-900 font-mono-numeric">
                    {formatCurrency(rep.closedRevenueMTD, currency)}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar for Quarterly Rep Quota */}
              <TargetProgressBar
                current={rep.closedRevenueMTD * 2.8}
                target={rep.monthlyQuota * 3}
                quarterLabel="Q3 Quota"
                currency={currency}
                size="compact"
                className="pt-1.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board of Active Deals */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Deals Kanban
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Pipeline Progression</h2>
          </div>
          <span className="text-xs text-slate-400">Drag or Click to Advance Stage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div key={stage} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{stage}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono-numeric">
                  {formatCurrency(stageTotal, currency)}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5"
                    >
                      <div className="text-xs font-bold text-slate-900 leading-tight">{deal.dealName}</div>
                      <div className="text-[11px] text-slate-500">{deal.company}</div>
                      <div className="text-xs font-black text-emerald-700 font-mono-numeric">
                        {formatCurrency(deal.amount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span>Rep: {deal.owner}</span>
                        <span>{deal.probability}% Prob</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
