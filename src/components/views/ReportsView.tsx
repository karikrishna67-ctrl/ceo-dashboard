import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const ReportsView: React.FC = () => {
  const { currentOrg, currentUser, kpiSnapshot, currency, actions, alerts } = useApp();
  const [reportType, setReportType] = useState<'MONTHLY_BOARD' | 'P_AND_L' | 'SALES_PIPELINE' | 'UNIT_ECONOMICS'>('MONTHLY_BOARD');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      window.print();
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Executive Board & Financial Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Board Ready
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Generate and export structured, publication-grade executive dossiers for investors, board members, and executive committees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isExporting ? 'Preparing Report...' : 'Print / Save as PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-2 flex flex-wrap gap-2 shadow-xs">
        {[
          { id: 'MONTHLY_BOARD', label: 'Monthly Board Briefing' },
          { id: 'P_AND_L', label: 'Executive P&L Dossier' },
          { id: 'SALES_PIPELINE', label: 'Sales Velocity & Pipeline' },
          { id: 'UNIT_ECONOMICS', label: 'Unit Economics & CAC / LTV' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              reportType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 print:border-0 print:shadow-none">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                CONFIDENTIAL • EXECUTIVE COMMITTEE ONLY
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {currentOrg.name} — Executive Business Intelligence Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Prepared for CEO {currentOrg.ceoName || 'Rajesh Sharma'} • Fiscal Period: FY26 MTD (August 2026)
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Health Score</div>
            <div className="text-3xl font-black text-slate-900 font-mono-numeric">
              {kpiSnapshot.healthScore.totalScore}/100
            </div>
            <div className="text-[11px] text-emerald-600 font-bold">{kpiSnapshot.healthScore.status}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Executive Macro Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the current fiscal cycle, <strong>{currentOrg.name}</strong> generated{' '}
            <strong>{formatCurrency(kpiSnapshot.revenueMTD, currency)}</strong> in gross revenue with an{' '}
            <strong>82.0% gross margin</strong> and <strong>22.4% net profit margin</strong> (
            {formatCurrency(kpiSnapshot.netProfit, currency)} Net Profit). The business maintains a secure{' '}
            <strong>{kpiSnapshot.runwayMonths.toFixed(1)}-month cash runway</strong> backed by{' '}
            {formatCurrency(kpiSnapshot.cashBalance, currency)} in liquid reserves.
          </p>
        </div>

        {/* Section 2: Core Financial Key Performance Indicators */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Core Financial Key Performance Indicators
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">MTD Gross Revenue</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(kpiSnapshot.revenueMTD, currency)}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">+14.2% MoM Expansion</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Net Profit (EBITDA)</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(kpiSnapshot.netProfit, currency)}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">22.4% Net Margin</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Active Pipeline Value</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(kpiSnapshot.pipelineValue, currency)}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">48 Qualified Deals</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Trapped Receivables</div>
              <div className="text-lg font-black text-rose-600 font-mono-numeric mt-1">
                {formatCurrency(kpiSnapshot.overdueReceivables, currency)}
              </div>
              <div className="text-[10px] text-rose-600 font-bold mt-1">4 Overdue Invoices</div>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic Findings & Action Tasks */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Prioritized Strategic CEO Action Items
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Initiative / Problem</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3 text-right">Financial Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.slice(0, 5).map((action) => (
                  <tr key={action.id}>
                    <td className="py-2.5 px-3 font-bold">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                        {action.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{action.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{action.problem}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{action.owner}</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-600 font-mono-numeric">
                      +{formatCurrency(action.expectedImpactAmount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>AI CEO Command Center • Generated automatically with real-time business telemetry</span>
          <span>Sign-off: _______________________________ (CEO Rajesh Sharma)</span>
        </div>
      </div>
    </div>
  );
};
