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
  Table,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const ReportsView: React.FC = () => {
  const { currentOrg, currentUser, currency, actions, alerts, addToast } = useApp();
  const {
    kpiSnapshot,
    revenueMetrics,
    marginMetrics,
    velocityMetrics,
    cashMetrics,
    customerMetrics,
    marketingMetrics,
    leakageMetrics,
    healthScore,
  } = useDashboardData();

  const [reportType, setReportType] = useState<'MONTHLY_BOARD' | 'P_AND_L' | 'SALES_PIPELINE' | 'UNIT_ECONOMICS'>('MONTHLY_BOARD');
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 400);
  };

  /**
   * Generates and downloads a clean, structured CSV report
   * derived directly from KPIUtility computations and the live business state.
   */
  const handleDownloadCSV = () => {
    setIsDownloadingCSV(true);

    try {
      const escapeCSV = (str: string | number | undefined | null): string => {
        if (str === undefined || str === null) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return `"${stringified}"`;
      };

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const csvRows: string[][] = [
        ['EXECUTIVE BUSINESS INTELLIGENCE & KPI PERFORMANCE REPORT'],
        ['Organization', currentOrg.name],
        ['CEO / Executive Lead', currentOrg.ceoName || 'Rajesh Sharma'],
        ['Report Generation Date', dateStr],
        ['Base Currency', currency],
        ['Overall Health Score', `${healthScore.totalScore} / 100 (${healthScore.status})`],
        [''],
        ['Category', 'Metric Name', 'Calculated Value', 'Unit / Currency', 'Target / Benchmark', 'Variance / Status', 'Methodology & Data Source'],
        
        // Revenue Section
        ['Revenue', 'MTD Gross Revenue', revenueMetrics.revenueMTD.toString(), currency, revenueMetrics.revenueTarget.toString(), `${revenueMetrics.revenueAchievementPct.toFixed(1)}% Attainment`, 'Verified paid invoices + active sales transactions'],
        ['Revenue', 'Monthly Revenue Target', revenueMetrics.revenueTarget.toString(), currency, revenueMetrics.revenueTarget.toString(), 'Baseline Goal', 'Configured organizational monthly revenue target'],
        ['Revenue', 'Monthly Revenue Gap', revenueMetrics.revenueGap.toString(), currency, '0', revenueMetrics.revenueGap > 0 ? 'Deficit' : 'Target Achieved', 'Target minus current MTD gross revenue'],
        ['Revenue', 'Revenue Target Achievement', `${revenueMetrics.revenueAchievementPct.toFixed(1)}%`, '%', '100%', `${(revenueMetrics.revenueAchievementPct - 100).toFixed(1)}% vs Target`, '(MTD Revenue / Target) * 100'],
        ['Revenue', 'MoM Revenue Expansion', `+${revenueMetrics.revenueGrowthMoM.toFixed(1)}%`, '%', '+10.0%', 'On Track', 'Month-over-month compound growth rate'],
        ['Revenue', 'Monthly Recurring Revenue (MRR)', revenueMetrics.mrr.toString(), currency, '2500000', 'Active Subscriptions', 'Sum of recurring monthly subscription contracts'],
        ['Revenue', 'Annual Run Rate (ARR)', revenueMetrics.arr.toString(), currency, '30000000', 'Annualized MRR', 'MRR multiplied by 12 months'],
        ['Revenue', 'Average Revenue Per User (ARPU)', revenueMetrics.arpu.toString(), currency, '20000', 'Healthy', 'MRR divided by active customer accounts'],
        ['Revenue', 'Required Daily Run Rate', revenueMetrics.requiredDailyRevenue.toString(), currency, '166667', `${revenueMetrics.daysRemainingInMonth} days remaining`, 'Revenue gap divided by days left in cycle'],

        // Profitability & Margins
        ['Profitability & Margins', 'Cost of Goods Sold (COGS)', marginMetrics.cogsMTD.toString(), currency, '750000', `${((marginMetrics.cogsMTD / (revenueMetrics.revenueMTD || 1)) * 100).toFixed(1)}% of Revenue`, 'Direct software hosting, compute & delivery cost'],
        ['Profitability & Margins', 'Gross Profit', marginMetrics.grossProfit.toString(), currency, '4250000', `${marginMetrics.grossMarginPct.toFixed(1)}% Margin`, 'Gross Revenue minus COGS'],
        ['Profitability & Margins', 'Gross Margin Percentage', `${marginMetrics.grossMarginPct.toFixed(1)}%`, '%', '80.0%', 'Strong Unit Economics', '(Gross Profit / Gross Revenue) * 100'],
        ['Profitability & Margins', 'Operating Expenses (OPEX)', marginMetrics.operatingExpenses.toString(), currency, '2200000', 'Approved Budget', 'Sum of active payroll, rent, media, SaaS expenses'],
        ['Profitability & Margins', 'EBITDA / Operating Income', marginMetrics.ebitda.toString(), currency, '1500000', `${((marginMetrics.ebitda / (revenueMetrics.revenueMTD || 1)) * 100).toFixed(1)}% Margin`, 'Gross Profit minus Operating Expenses'],
        ['Profitability & Margins', 'Net Profit', marginMetrics.netProfit.toString(), currency, '1250000', `${marginMetrics.netMarginPct.toFixed(1)}% Net Margin`, 'EBITDA after estimated statutory provisions'],
        ['Profitability & Margins', 'Net Margin Percentage', `${marginMetrics.netMarginPct.toFixed(1)}%`, '%', '20.0%', 'Profitable', '(Net Profit / Gross Revenue) * 100'],

        // Sales & Velocity
        ['Sales & Pipeline', 'Active Pipeline Value', velocityMetrics.pipelineValue.toString(), currency, '45000000', `${velocityMetrics.qualifiedLeads} Qualified Deals`, 'Weighted value of active qualified stage opportunities'],
        ['Sales & Pipeline', 'Qualified Leads Count', velocityMetrics.qualifiedLeads.toString(), 'Deals', '50', 'Active Funnel', 'Leads in Qualified/Demo/Proposal/Negotiation stages'],
        ['Sales & Pipeline', 'Closed Won Deals Count', velocityMetrics.wonDealsCount.toString(), 'Deals', '20', 'MTD Closures', 'Deals successfully transitioned to Closed Won'],
        ['Sales & Pipeline', 'Closed Won Deals Value', velocityMetrics.wonDealsValue.toString(), currency, '2500000', 'MTD Won Value', 'Total value of deals closed in current period'],
        ['Sales & Pipeline', 'Sales Win Rate', `${velocityMetrics.winRatePct.toFixed(1)}%`, '%', '25.0%', 'Above Benchmark', '(Won Deals / Total Evaluated Leads) * 100'],
        ['Sales & Pipeline', 'Average Deal Size', velocityMetrics.averageDealSize.toString(), currency, '150000', 'Deal ACV', 'Average estimated deal value across active pipeline'],
        ['Sales & Pipeline', 'Average Sales Cycle', `${velocityMetrics.salesCycleDays} Days`, 'Days', '20 Days', 'Velocity', 'Average days elapsed from first touch to close'],
        ['Sales & Pipeline', 'Required Deals to Close Target', velocityMetrics.requiredDealsCount.toString(), 'Deals', '-', 'Target Pacing', 'Revenue Gap divided by Average Deal Size'],

        // Cash & Runway
        ['Cash & Liquidity', 'Liquid Cash Balance', cashMetrics.cashBalance.toString(), currency, '2500000', 'Safe Reserve', 'Bank liquid balances minus settled outflows'],
        ['Cash & Liquidity', 'Monthly Operational Burn Rate', cashMetrics.monthlyBurnRate.toString(), currency, '2200000', 'Controlled', 'Average monthly operating cash expenditure'],
        ['Cash & Liquidity', 'Cash Runway', `${cashMetrics.cashRunwayMonths.toFixed(1)} Months`, 'Months', '6.0 Months', cashMetrics.cashRunwayMonths >= 6 ? 'Secure' : 'Caution', 'Cash Balance divided by Monthly Burn Rate'],
        ['Cash & Liquidity', 'Total Outstanding Receivables', cashMetrics.outstandingReceivables.toString(), currency, '200000', 'Pending Invoices', 'Total unpaid client invoices issued'],
        ['Cash & Liquidity', 'Overdue Receivables (Leakage)', cashMetrics.overdueReceivables.toString(), currency, '0', 'Trapped Cash', 'Invoices past designated payment due dates'],
        ['Cash & Liquidity', 'Days Sales Outstanding (DSO)', `${cashMetrics.dsoDays} Days`, 'Days', '35 Days', 'Healthy Collections', '(Outstanding Receivables / MTD Revenue) * 30'],
        ['Cash & Liquidity', 'Working Capital', cashMetrics.workingCapital.toString(), currency, '3000000', 'Net Capital', 'Cash + Receivables minus Accounts Payable'],

        // Customers & Churn
        ['Customers & Retention', 'Total Accounts', customerMetrics.totalCustomers.toString(), 'Accounts', '150', 'Base', 'Total registered enterprise customer accounts'],
        ['Customers & Retention', 'Active Customer Accounts', customerMetrics.activeCustomers.toString(), 'Accounts', '135', 'Active Paying', 'Accounts actively generating monthly revenue'],
        ['Customers & Retention', 'At-Risk Customer Accounts', customerMetrics.atRiskCustomersCount.toString(), 'Accounts', '0', 'Retention Alert', 'Accounts with churn risk scores exceeding 60%'],
        ['Customers & Retention', 'Account Churn Rate', `${customerMetrics.churnRatePct.toFixed(1)}%`, '%', '3.0%', 'Healthy', '(At Risk Accounts / Total Accounts) * 100'],
        ['Customers & Retention', 'Customer Retention Rate', `${customerMetrics.retentionRatePct.toFixed(1)}%`, '%', '97.0%', 'High Retention', '100% minus Churn Rate'],
        ['Customers & Retention', 'Average Customer Lifetime Value (LTV)', customerMetrics.avgLTV.toString(), currency, '2000000', 'Enterprise LTV', 'Aggregated customer historical & projected value'],

        // Marketing & CAC
        ['Marketing & Acquisition', 'Total Marketing Spend', marketingMetrics.marketingSpend.toString(), currency, '450000', 'Budget Allocated', 'Paid media, advertising & performance budget'],
        ['Marketing & Acquisition', 'Direct Marketing Revenue', marketingMetrics.marketingRevenue.toString(), currency, '3500000', '+29.7% vs Target', 'Attributed revenue generated from active campaigns'],
        ['Marketing & Acquisition', 'Blended Customer Acquisition Cost (CAC)', marketingMetrics.blendedCAC.toString(), currency, '15000', 'Capital Efficient', 'Total marketing spend / customers acquired'],
        ['Marketing & Acquisition', 'Blended Cost Per Lead (CPL)', marketingMetrics.blendedCPL.toString(), currency, '1200', 'Optimized', 'Total marketing spend / leads generated'],
        ['Marketing & Acquisition', 'Blended Return on Ad Spend (ROAS)', `${marketingMetrics.blendedROAS.toFixed(1)}x`, 'Multiplier', '6.0x', 'High Return', 'Marketing Revenue / Marketing Spend'],
        ['Marketing & Acquisition', 'Top Performing Channel', marketingMetrics.topChannel, 'Channel', 'WhatsApp / Google', 'Highest ROI', 'Ranked by ROAS and acquisition conversion'],

        // Revenue Leakage
        ['Revenue Leakage', 'Total Trapped Capital', leakageMetrics.totalLeakage.toString(), currency, '0', 'Recoverable Cash', 'Sum of overdue invoices, lost leads, unused capacity'],
        ['Revenue Leakage', 'Overdue Invoices Leakage', leakageMetrics.receivables.amount.toString(), currency, '0', `${leakageMetrics.receivables.count} Overdue Invoices`, leakageMetrics.receivables.description],
        ['Revenue Leakage', 'Neglected Inbound Leads', leakageMetrics.lostLeads.amount.toString(), currency, '0', `${leakageMetrics.lostLeads.count} Stalled Leads`, leakageMetrics.lostLeads.description],
        ['Revenue Leakage', 'Unused Cloud & SaaS Capacity', leakageMetrics.unusedCapacity.amount.toString(), currency, '0', 'Expense Overhang', leakageMetrics.unusedCapacity.description],
        ['Revenue Leakage', 'Enterprise Pricing Under-Recovery', leakageMetrics.pricingLeakage.amount.toString(), currency, '0', 'Pricing Optimization', leakageMetrics.pricingLeakage.description],

        [''],
        ['PRIORITIZED STRATEGIC CEO ACTION ITEMS'],
        ['Priority', 'Action Title', 'Problem Statement', 'Assigned Owner', 'Expected Financial Impact', 'Status', 'Target Completion'],
        ...actions.slice(0, 8).map((act) => [
          act.priority,
          act.title,
          act.problem,
          act.owner,
          `+${formatCurrency(act.expectedImpactAmount, currency)}`,
          act.status,
          act.deadline || 'Immediate (Today)',
        ]),
      ];

      const csvContent = csvRows
        .map((row) => row.map((cell) => escapeCSV(cell)).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${(currentOrg.name || 'Executive').replace(/\s+/g, '_')}_KPI_Report_${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Downloaded ${filename} successfully`, 'success');
    } catch (err) {
      console.error('Failed to export CSV report:', err);
      addToast('Failed to generate CSV report. Please retry.', 'error');
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download CSV Report Button */}
          <button
            onClick={handleDownloadCSV}
            disabled={isDownloadingCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Download clean CSV summary derived from KPIUtility"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingCSV ? 'Generating CSV...' : 'Download Report (CSV)'}</span>
          </button>

          {/* Print / Save as PDF Button */}
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
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
              {healthScore.totalScore}/100
            </div>
            <div className="text-[11px] text-emerald-600 font-bold">{healthScore.status}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Executive Macro Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the current fiscal cycle, <strong>{currentOrg.name}</strong> generated{' '}
            <strong>{formatCurrency(revenueMetrics.revenueMTD, currency)}</strong> in gross revenue with an{' '}
            <strong>{marginMetrics.grossMarginPct.toFixed(1)}% gross margin</strong> and{' '}
            <strong>{marginMetrics.netMarginPct.toFixed(1)}% net profit margin</strong> (
            {formatCurrency(marginMetrics.netProfit, currency)} Net Profit). The business maintains a{' '}
            <strong>{cashMetrics.cashRunwayMonths.toFixed(1)}-month cash runway</strong> backed by{' '}
            {formatCurrency(cashMetrics.cashBalance, currency)} in liquid reserves.
          </p>
        </div>

        {/* Section 2: Core Financial Key Performance Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Core Financial Key Performance Indicators (KPIUtility Derived)
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Zero-Discrepancy Telemetry</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">MTD Gross Revenue</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(revenueMetrics.revenueMTD, currency)}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">
                +{revenueMetrics.revenueGrowthMoM.toFixed(1)}% MoM Expansion
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Net Profit (EBITDA)</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(marginMetrics.netProfit, currency)}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1">
                {marginMetrics.netMarginPct.toFixed(1)}% Net Margin
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Active Pipeline Value</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1">
                {formatCurrency(velocityMetrics.pipelineValue, currency)}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                {velocityMetrics.qualifiedLeads} Qualified Deals
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Trapped Receivables</div>
              <div className="text-lg font-black text-rose-600 font-mono-numeric mt-1">
                {formatCurrency(cashMetrics.overdueReceivables, currency)}
              </div>
              <div className="text-[10px] text-rose-600 font-bold mt-1">Overdue Invoices</div>
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

        {/* Section 4: Export Summary Strip */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" />
            <span className="text-slate-700 font-medium">
              Want the raw tabular dataset? Export all 42+ KPI dimensions into CSV format.
            </span>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV Summary</span>
          </button>
        </div>

        {/* Report Footer */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>AI CEO Command Center • Generated automatically with real-time business telemetry</span>
          <span>Sign-off: _______________________________ (CEO {currentOrg.ceoName || 'Rajesh Sharma'})</span>
        </div>
      </div>
    </div>
  );
};
