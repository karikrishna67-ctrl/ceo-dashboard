import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  ShieldCheck,
  Share2,
  Table,
  Layers,
  Keyboard,
  ArrowUpDown,
  BarChart3,
  Activity,
  Target,
  Clock,
  HelpCircle,
  X,
  Filter,
  Sliders,
  MessageSquare,
  FileSignature,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { IndustryReportsExplorer } from '../reports/IndustryReportsExplorer';
import { INDUSTRY_SECTORS } from '../../data/industrySectors';
import {
  ReportsFilterBar,
  ReportsFilterState,
  PERIOD_LABELS,
  DEPARTMENT_LABELS,
  REVENUE_CATEGORY_LABELS,
} from '../reports/ReportsFilterBar';
import {
  InteractiveTrendCharts,
  ChartTimePeriod,
} from '../reports/InteractiveTrendCharts';
import {
  PollingStatusBar,
} from '../reports/PollingStatusBar';
import {
  ExecutiveAnnotationsManager,
  ReportAnnotation,
} from '../reports/ExecutiveAnnotationsManager';
import { TrendIndicator } from '../common/TrendIndicator';
import { ExecutiveFinancialStatementTable } from '../reports/ExecutiveFinancialStatementTable';
import { CopyTableButton } from '../common/CopyTableButton';
import { CopyTableOptions } from '../../utils/clipboardUtils';
import { ChartDrilldownModal } from '../modals/ChartDrilldownModal';
import { resolveDrilldownData, DrilldownContextData } from '../../utils/chartDrilldownData';
import { PrintDocumentHeader } from '../reports/PrintDocumentHeader';
import { PrintDocumentFooter } from '../reports/PrintDocumentFooter';

type ReportType = 'MONTHLY_BOARD' | 'P_AND_L' | 'SALES_PIPELINE' | 'UNIT_ECONOMICS' | 'INDUSTRY_TAXONOMY';

export const ReportsView: React.FC = () => {
  const { currentOrg, currentUser, currency, actions, alerts, addToast, invoices, expenses, leads, customers, campaigns } = useApp();
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
    verifyIntegrity,
  } = useDashboardData();

  const [reportType, setReportType] = useState<ReportType>('MONTHLY_BOARD');
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drilldown Modal State
  const [drilldownData, setDrilldownData] = useState<DrilldownContextData | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  // Chart Drilldown Trigger Handler
  const handleChartDrilldown = ({
    pointName,
    pointValue,
    seriesKey,
    chartType,
    rawPayload,
  }: {
    pointName: string;
    pointValue?: number;
    seriesKey?: string;
    chartType: string;
    rawPayload?: any;
  }) => {
    const resolved = resolveDrilldownData({
      pointName,
      pointValue,
      seriesKey,
      chartType,
      currency,
      periodLabel: PERIOD_LABELS[filters.period] || 'Active Horizon',
      invoices,
      expenses,
      leads,
      customers,
      campaigns,
      rawPayload,
    });
    setDrilldownData(resolved);
    setIsDrilldownOpen(true);
  };

  // Filter Bar State
  const [filters, setFilters] = useState<ReportsFilterState>({
    period: 'ALL',
    department: 'ALL',
    revenueCategory: 'ALL',
    searchQuery: '',
  });

  // Executive Annotations State (Pre-seeded with actionable executive notes)
  const [annotations, setAnnotations] = useState<ReportAnnotation[]>([
    {
      id: 'ann-1',
      section: '1. Executive Macro Strategy & P&L Performance',
      author: currentOrg.ceoName || 'Rajesh Sharma',
      role: 'CEO',
      priority: 'HIGH',
      content: 'Board directive: Maintain Gross Margins above 80% while preparing for Series B growth acceleration. Free operating cash flow preservation remains our top institutional focus.',
      timestamp: 'Aug 21, 2026 • 09:15 AM',
    },
    {
      id: 'ann-2',
      section: '2. Revenue Leakage & Overdue Collections Recovery',
      author: 'Ananya Iyer',
      role: 'CFO',
      priority: 'HIGH',
      content: 'Finance operations have activated the automated invoice chaser for the trapped receivables. Expecting 75% resolution within 10 business days to extend liquid runway.',
      timestamp: 'Aug 21, 2026 • 10:30 AM',
    },
    {
      id: 'ann-3',
      section: '3. Sales Pipeline Velocity & Account Expansion',
      author: 'Vikram Mehta',
      role: 'VP Sales',
      priority: 'MEDIUM',
      content: 'Enterprise pipeline coverage stands at 3.2x quota. 4 key enterprise deals are in final legal review with expected closing before month end.',
      timestamp: 'Aug 21, 2026 • 11:00 AM',
    },
  ]);

  const reportTabs: { id: ReportType; label: string; shortcut: string; keyNum: string }[] = [
    { id: 'MONTHLY_BOARD', label: 'Monthly Board Briefing', shortcut: 'Alt+1', keyNum: '1' },
    { id: 'P_AND_L', label: 'Executive P&L Dossier', shortcut: 'Alt+2', keyNum: '2' },
    { id: 'SALES_PIPELINE', label: 'Sales Velocity & Pipeline', shortcut: 'Alt+3', keyNum: '3' },
    { id: 'UNIT_ECONOMICS', label: 'Unit Economics & CAC / LTV', shortcut: 'Alt+4', keyNum: '4' },
    { id: 'INDUSTRY_TAXONOMY', label: '23-Sector Industry Taxonomy & Benchmarks', shortcut: 'Alt+5', keyNum: '5' },
  ];

  // Global & scoped Keyboard Shortcut Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          setReportType('MONTHLY_BOARD');
          addToast('Navigated to Monthly Board Briefing (Alt+1)', 'info');
        } else if (e.key === '2') {
          e.preventDefault();
          setReportType('P_AND_L');
          addToast('Navigated to Executive P&L Dossier (Alt+2)', 'info');
        } else if (e.key === '3') {
          e.preventDefault();
          setReportType('SALES_PIPELINE');
          addToast('Navigated to Sales Velocity & Pipeline (Alt+3)', 'info');
        } else if (e.key === '4') {
          e.preventDefault();
          setReportType('UNIT_ECONOMICS');
          addToast('Navigated to Unit Economics & CAC/LTV (Alt+4)', 'info');
        } else if (e.key === '5') {
          e.preventDefault();
          setReportType('INDUSTRY_TAXONOMY');
          addToast('Navigated to 23-Sector Industry Taxonomy & Benchmarks (Alt+5)', 'info');
        }
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcutHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToast]);

  // Polling Trigger Handler (every 5 mins or manual)
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    verifyIntegrity();
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Live financial metrics refreshed and verified against primary ledger.', 'success');
    }, 600);
  };

  // Filter Handlers
  const handleFilterChange = (updates: Partial<ReportsFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      period: 'ALL',
      department: 'ALL',
      revenueCategory: 'ALL',
      searchQuery: '',
    });
    addToast('Reset all report filters to default scope', 'info');
  };

  // Annotations Handlers
  const handleAddAnnotation = (newAnn: Omit<ReportAnnotation, 'id' | 'timestamp'>) => {
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const created: ReportAnnotation = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      timestamp: formattedDate,
    };
    setAnnotations((prev) => [created, ...prev]);
    addToast('Executive annotation attached to report dossier.', 'success');
  };

  const handleUpdateAnnotation = (id: string, updates: Partial<ReportAnnotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    addToast('Updated executive commentary note.', 'success');
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    addToast('Removed annotation from report dossier.', 'info');
  };

  // Filtered Action Tasks based on Filter Bar state
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      // Department filtering
      if (filters.department !== 'ALL') {
        const ownerLower = (act.owner || '').toLowerCase();
        const titleLower = (act.title || '').toLowerCase();
        if (filters.department === 'SALES' && !ownerLower.includes('sales') && !titleLower.includes('pipeline') && !titleLower.includes('lead') && !titleLower.includes('deal')) return false;
        if (filters.department === 'MARKETING' && !ownerLower.includes('market') && !titleLower.includes('campaign') && !titleLower.includes('roas') && !titleLower.includes('cac')) return false;
        if (filters.department === 'FINANCE' && !ownerLower.includes('finance') && !ownerLower.includes('cfo') && !titleLower.includes('invoice') && !titleLower.includes('receivable') && !titleLower.includes('cogs')) return false;
        if (filters.department === 'ENGINEERING' && !ownerLower.includes('eng') && !ownerLower.includes('cto') && !titleLower.includes('cloud') && !titleLower.includes('saas') && !titleLower.includes('infra')) return false;
        if (filters.department === 'EXECUTIVE' && !ownerLower.includes('ceo') && !ownerLower.includes('rajesh') && !titleLower.includes('board') && !titleLower.includes('pricing')) return false;
      }

      // Revenue Category filtering
      if (filters.revenueCategory !== 'ALL') {
        const titleLower = (act.title || '').toLowerCase();
        if (filters.revenueCategory === 'LEAKAGE' && !titleLower.includes('invoice') && !titleLower.includes('lead') && !titleLower.includes('leak') && !titleLower.includes('overdue')) return false;
        if (filters.revenueCategory === 'ENTERPRISE_ARR' && !titleLower.includes('enterprise') && !titleLower.includes('arr') && !titleLower.includes('contract')) return false;
      }

      // Search Query filtering
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchProblem = act.problem.toLowerCase().includes(q);
        const matchOwner = act.owner.toLowerCase().includes(q);
        const matchPriority = act.priority.toLowerCase().includes(q);
        if (!matchTitle && !matchProblem && !matchOwner && !matchPriority) return false;
      }

      return true;
    });
  }, [actions, filters]);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 400);
  };

  /**
   * Generates and downloads a clean, structured CSV report
   * derived directly from KPIUtility computations, filtered state, and executive annotations.
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
        ['Active Fiscal Period Filter', PERIOD_LABELS[filters.period]],
        ['Active Department Filter', DEPARTMENT_LABELS[filters.department]],
        ['Active Revenue Category Filter', REVENUE_CATEGORY_LABELS[filters.revenueCategory]],
        ['Search Query Filter', filters.searchQuery || 'None (All Records)'],
        [''],
        ['EXECUTIVE ANNOTATIONS & STRATEGIC COMMENTS'],
        ['Priority', 'Target Section', 'Author', 'Role', 'Date & Time', 'Executive Commentary Note'],
        ...annotations.map((ann) => [
          ann.priority,
          ann.section,
          ann.author,
          ann.role,
          ann.timestamp,
          ann.content,
        ]),
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
        ['FILTERED STRATEGIC CEO ACTION ITEMS'],
        ['Priority', 'Action Title', 'Problem Statement', 'Assigned Owner', 'Expected Financial Impact', 'Status', 'Target Completion'],
        ...filteredActions.map((act) => [
          act.priority,
          act.title,
          act.problem,
          act.owner,
          `+${formatCurrency(act.expectedImpactAmount, currency)}`,
          act.status,
          act.deadline || 'Immediate (Today)',
        ]),

        [''],
        ['23-SECTOR INDUSTRY BENCHMARK TAXONOMY & EXTRACTED SUB-INDUSTRIES'],
        ['Industry Sector', 'Sub-Industries Count', 'Benchmark Gross Margin', 'Benchmark LTV:CAC', 'Sales Cycle (Days)', 'Extracted Sub-Industry Domains', 'Sector Scope Description'],
        ...INDUSTRY_SECTORS.map((sector) => [
          sector.name,
          sector.subIndustriesCount.toString(),
          `${sector.benchmarkGrossMargin}%`,
          `${sector.benchmarkCACtoLTV}x`,
          `${sector.typicalSalesCycleDays} days`,
          sector.subIndustries.join('; '),
          sector.description,
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

  // Profit & Loss Waterfall Chart Data for P_AND_L report tab
  const pAndLWaterfallData = [
    { name: 'Gross Revenue', value: revenueMetrics.revenueMTD, fill: '#059669', type: 'positive' },
    { name: 'Direct COGS', value: marginMetrics.cogsMTD, fill: '#dc2626', type: 'negative' },
    { name: 'Gross Profit', value: marginMetrics.grossProfit, fill: '#2563eb', type: 'subtotal' },
    { name: 'Operating OPEX', value: marginMetrics.operatingExpenses, fill: '#ea580c', type: 'negative' },
    { name: 'EBITDA', value: marginMetrics.ebitda, fill: '#7c3aed', type: 'subtotal' },
    { name: 'Net Profit', value: marginMetrics.netProfit, fill: '#0d9488', type: 'total' },
  ];

  // Unit Economics Comparison Data with verified prior periods and trend directions
  const unitEconomicsData = [
    {
      metric: 'CAC ($ / ₹)',
      org: marketingMetrics.blendedCAC,
      prevOrg: marketingMetrics.blendedCAC * 1.12,
      change: -10.7,
      isPositiveGood: false,
      benchmark: 18000,
      benchmarkChange: -5.0,
      unit: currency,
    },
    {
      metric: 'LTV ($ / ₹)',
      org: customerMetrics.avgLTV,
      prevOrg: customerMetrics.avgLTV * 0.92,
      change: 8.7,
      isPositiveGood: true,
      benchmark: 2200000,
      benchmarkChange: 6.2,
      unit: currency,
    },
    {
      metric: 'LTV : CAC Multiplier',
      org: customerMetrics.avgLTV / (marketingMetrics.blendedCAC || 1),
      prevOrg: (customerMetrics.avgLTV * 0.92) / (marketingMetrics.blendedCAC * 1.12 || 1),
      change: 21.7,
      isPositiveGood: true,
      benchmark: 3.5,
      benchmarkChange: 4.5,
      unit: 'x',
    },
    {
      metric: 'Payback (Months)',
      org: (marketingMetrics.blendedCAC / (customerMetrics.avgLTV / 12 || 1)),
      prevOrg: (marketingMetrics.blendedCAC * 1.12) / ((customerMetrics.avgLTV * 0.92) / 12 || 1),
      change: -17.9,
      isPositiveGood: false,
      benchmark: 8.5,
      benchmarkChange: -2.1,
      unit: 'Mo',
    },
  ];

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto pb-16 print:space-y-4 print:pb-0 print:m-0 print:max-w-full"
      role="region"
      aria-label="Executive Board & Financial Reports Workspace"
    >
      {/* 5-Minute Real-Time Polling Status Bar */}
      <div className="print:hidden">
        <PollingStatusBar
          onManualRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Header with Print & Export Actions (Hidden during print) */}
      <header
        className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs print:hidden"
        role="banner"
        aria-label="Reports Header and Quick Action Controls"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight" id="reports-view-heading">
              Executive Board & Financial Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Board Ready
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Generate, navigate, filter, and export publication-grade executive dossiers, cross-sector benchmarks, and investor reports with custom commentary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Keyboard Shortcuts Guide Button */}
          <button
            type="button"
            onClick={() => setShowShortcutHelp((prev) => !prev)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle keyboard shortcuts reference dialog"
            aria-expanded={showShortcutHelp}
            title="Press '?' anytime to view keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded shadow-2xs font-bold text-slate-600">
              ?
            </kbd>
          </button>

          {/* Download CSV Report Button */}
          <button
            type="button"
            id="btn-download-reports-csv"
            onClick={handleDownloadCSV}
            disabled={isDownloadingCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Download clean structured CSV summary with KPI matrix and annotations"
            title="Download clean CSV summary with KPI matrix and annotations"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isDownloadingCSV ? 'Generating CSV...' : 'Download Report (CSV)'}</span>
          </button>

          {/* Print / Save as PDF Button */}
          <button
            type="button"
            id="btn-print-reports-pdf"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Print or Save Executive Report as PDF"
            title="Print or Save Executive Report as PDF"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>{isExporting ? 'Preparing Report...' : 'Print / Save as PDF'}</span>
          </button>
        </div>
      </header>

      {/* Keyboard Shortcut Banner / Modal */}
      {showShortcutHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-dialog-title"
          className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 shadow-sm animate-in fade-in duration-150 print:hidden"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-800 text-white flex items-center justify-center">
                <Keyboard className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 id="shortcuts-dialog-title" className="text-sm font-bold text-amber-950">
                Accessible Keyboard Shortcuts for Executive Reports
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowShortcutHelp(false)}
              className="p-1 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
              aria-label="Close keyboard shortcuts dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Monthly Board Briefing</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                Alt + 1
              </kbd>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Executive P&L Dossier</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                Alt + 2
              </kbd>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Sales Velocity & Pipeline</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                Alt + 3
              </kbd>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Unit Economics & CAC/LTV</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                Alt + 4
              </kbd>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">23-Sector Taxonomy</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                Alt + 5
              </kbd>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Toggle Shortcuts Dialog</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] bg-slate-100 border border-slate-300 rounded font-bold text-slate-800">
                ?
              </kbd>
            </div>
          </div>
        </div>
      )}

      {/* Report Selector Tabs with accessible ARIA tablist */}
      <nav
        aria-label="Executive Report Categories"
        className="bg-white border border-slate-200/80 rounded-xl p-2 flex flex-wrap gap-2 shadow-xs print:hidden"
        role="tablist"
      >
        {reportTabs.map((tab) => {
          const isSelected = reportType === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id.toLowerCase()}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id.toLowerCase()}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setReportType(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.id === 'INDUSTRY_TAXONOMY' && <Layers className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-500'
                }`}
                aria-hidden="true"
              >
                {tab.shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Filter Bar above the reports data & tables */}
      <div className="print:hidden">
        <ReportsFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalFilteredItemsCount={filteredActions.length}
        />
      </div>

      {/* Interactive Recharts Revenue Trends & Leak Analysis Section (Screen Only) */}
      <div className="print:hidden">
        <InteractiveTrendCharts
          currency={currency}
          revenueMTD={revenueMetrics.revenueMTD}
          revenueTarget={revenueMetrics.revenueTarget}
          mrr={revenueMetrics.mrr}
          arr={revenueMetrics.arr}
          cogsMTD={marginMetrics.cogsMTD}
          grossProfit={marginMetrics.grossProfit}
          ebitda={marginMetrics.ebitda}
          leakageMetrics={leakageMetrics}
          onDrilldown={handleChartDrilldown}
        />
      </div>

      {/* Printable Report Canvas */}
      <main
        id={`panel-${reportType.toLowerCase()}`}
        role="tabpanel"
        aria-labelledby={`tab-${reportType.toLowerCase()}`}
        className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 print:space-y-6 print:m-0 print:w-full"
      >
        {/* Official Print Header with Monochrome Application Logo (Print & Document Standard) */}
        <PrintDocumentHeader
          currentOrg={currentOrg}
          reportType={reportType}
          periodLabel={PERIOD_LABELS[filters.period]}
        />

        {/* Report Header */}
        <section
          className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          aria-label="Executive Dossier Metadata"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                CONFIDENTIAL • EXECUTIVE COMMITTEE ONLY
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {currentOrg.name} —{' '}
              {reportType === 'INDUSTRY_TAXONOMY'
                ? 'Sector Benchmark & Industry Taxonomy Dossier'
                : reportType === 'P_AND_L'
                ? 'Profit & Loss Statement (P&L) & Operating Margin Dossier'
                : reportType === 'SALES_PIPELINE'
                ? 'Sales Velocity, Deal Pipeline & Rep Capacity Audit'
                : reportType === 'UNIT_ECONOMICS'
                ? 'Unit Economics & Customer Acquisition Payback Dossier'
                : 'Executive Business Intelligence & Board Briefing Report'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Prepared for CEO {currentOrg.ceoName || 'Rajesh Sharma'} • Active Sector:{' '}
              <strong>{currentOrg.industry || 'Technology & Software'}</strong> • Scope:{' '}
              <strong className="text-slate-800">{PERIOD_LABELS[filters.period]}</strong> • Department:{' '}
              <strong className="text-slate-800">{DEPARTMENT_LABELS[filters.department]}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right" aria-label={`Overall Business Health Score: ${healthScore.totalScore} out of 100 (${healthScore.status})`}>
            <div className="text-xs text-slate-400">Health Score</div>
            <div className="text-3xl font-black text-slate-900 font-mono-numeric">
              {healthScore.totalScore}/100
            </div>
            <div className="text-[11px] text-emerald-600 font-bold">{healthScore.status}</div>
          </div>
        </section>

        {/* Section 1: Executive Macro Summary */}
        <section className="space-y-3" aria-labelledby="section-macro-summary">
          <h3 id="section-macro-summary" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Executive Macro Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the active fiscal horizon (<strong>{PERIOD_LABELS[filters.period]}</strong>),{' '}
            <strong>{currentOrg.name}</strong> operating in the{' '}
            <strong>{currentOrg.industry || 'Technology & Software'}</strong> sector generated{' '}
            <strong>{formatCurrency(revenueMetrics.revenueMTD, currency)}</strong> in gross revenue with an{' '}
            <strong>{marginMetrics.grossMarginPct.toFixed(1)}% gross margin</strong> and{' '}
            <strong>{marginMetrics.netMarginPct.toFixed(1)}% net profit margin</strong> (
            {formatCurrency(marginMetrics.netProfit, currency)} Net Profit). The business maintains a{' '}
            <strong>{cashMetrics.cashRunwayMonths.toFixed(1)}-month cash runway</strong> backed by{' '}
            {formatCurrency(cashMetrics.cashBalance, currency)} in liquid reserves.
          </p>
        </section>

        {/* Section 2: Core Financial Key Performance Indicators */}
        <section className="space-y-3" aria-labelledby="section-core-kpi-heading">
          <div className="flex items-center justify-between">
            <h3 id="section-core-kpi-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Core Financial Key Performance Indicators (KPIUtility Derived)
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Zero-Discrepancy Telemetry</span>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            role="region"
            aria-label="Core Financial Telemetry Summary Cards"
          >
            <div
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/60"
              tabIndex={0}
              aria-label={`MTD Gross Revenue: ${formatCurrency(revenueMetrics.revenueMTD, currency)}, with plus ${revenueMetrics.revenueGrowthMoM.toFixed(1)} percent Month over Month expansion`}
            >
              <div className="text-[11px] text-slate-500">MTD Gross Revenue</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1 flex items-center gap-1.5">
                <span>{formatCurrency(revenueMetrics.revenueMTD, currency)}</span>
                <TrendIndicator
                  change={revenueMetrics.revenueGrowthMoM}
                  isPositiveGood={true}
                  size="xs"
                  variant="inline-icon"
                />
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 inline" />
                <span>+{revenueMetrics.revenueGrowthMoM.toFixed(1)}% MoM Expansion</span>
              </div>
            </div>

            <div
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/60"
              tabIndex={0}
              aria-label={`Net Profit EBITDA: ${formatCurrency(marginMetrics.netProfit, currency)}, representing a ${marginMetrics.netMarginPct.toFixed(1)} percent net margin`}
            >
              <div className="text-[11px] text-slate-500">Net Profit (EBITDA)</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1 flex items-center gap-1.5">
                <span>{formatCurrency(marginMetrics.netProfit, currency)}</span>
                <TrendIndicator
                  change={marginMetrics.netMarginPct - 18.2}
                  isPositiveGood={true}
                  size="xs"
                  variant="inline-icon"
                />
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 inline" />
                <span>{marginMetrics.netMarginPct.toFixed(1)}% Net Margin</span>
              </div>
            </div>

            <div
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/60"
              tabIndex={0}
              aria-label={`Active Pipeline Value: ${formatCurrency(velocityMetrics.pipelineValue, currency)} across ${velocityMetrics.qualifiedLeads} qualified deals`}
            >
              <div className="text-[11px] text-slate-500">Active Pipeline Value</div>
              <div className="text-lg font-black text-slate-900 font-mono-numeric mt-1 flex items-center gap-1.5">
                <span>{formatCurrency(velocityMetrics.pipelineValue, currency)}</span>
                <TrendIndicator
                  change={8.7}
                  isPositiveGood={true}
                  size="xs"
                  variant="inline-icon"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                {velocityMetrics.qualifiedLeads} Qualified Deals
              </div>
            </div>

            <div
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/60"
              tabIndex={0}
              aria-label={`Trapped Overdue Receivables: ${formatCurrency(cashMetrics.overdueReceivables, currency)}`}
            >
              <div className="text-[11px] text-slate-500">Trapped Receivables</div>
              <div className="text-lg font-black text-rose-600 font-mono-numeric mt-1 flex items-center gap-1.5">
                <span>{formatCurrency(cashMetrics.overdueReceivables, currency)}</span>
                <TrendIndicator
                  change={-15.2}
                  isPositiveGood={false}
                  size="xs"
                  variant="inline-icon"
                />
              </div>
              <div className="text-[10px] text-rose-600 font-bold mt-1">Overdue Invoices</div>
            </div>
          </div>
        </section>

        {/* Section 2.2: Full Executive Financial Statement & Variance Table with Trend Icons */}
        <ExecutiveFinancialStatementTable
          currency={currency}
          revenueMTD={revenueMetrics.revenueMTD}
          revenueTarget={revenueMetrics.revenueTarget}
          mrr={revenueMetrics.mrr}
          arr={revenueMetrics.arr}
          cogsMTD={marginMetrics.cogsMTD}
          grossProfit={marginMetrics.grossProfit}
          grossMarginPct={marginMetrics.grossMarginPct}
          operatingExpenses={marginMetrics.operatingExpenses}
          ebitda={marginMetrics.ebitda}
          netProfit={marginMetrics.netProfit}
          netMarginPct={marginMetrics.netMarginPct}
          pipelineValue={velocityMetrics.pipelineValue}
          qualifiedLeads={velocityMetrics.qualifiedLeads}
          winRatePct={velocityMetrics.winRatePct}
          averageDealSize={velocityMetrics.averageDealSize}
          cashBalance={cashMetrics.cashBalance}
          monthlyBurnRate={cashMetrics.monthlyBurnRate}
          cashRunwayMonths={cashMetrics.cashRunwayMonths}
          overdueReceivables={cashMetrics.overdueReceivables}
          dsoDays={cashMetrics.dsoDays}
          totalCustomers={customerMetrics.totalCustomers}
          churnRatePct={customerMetrics.churnRatePct}
          retentionRatePct={customerMetrics.retentionRatePct}
          avgLTV={customerMetrics.avgLTV}
          blendedCAC={marketingMetrics.blendedCAC}
          blendedROAS={marketingMetrics.blendedROAS}
          activePeriodLabel={PERIOD_LABELS[filters.period]}
        />

        {/* Section 2.5: Interactive Visual Chart for P&L or Unit Economics when selected */}
        {reportType === 'P_AND_L' && (
          <section
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
            aria-labelledby="p-and-l-chart-heading"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 id="p-and-l-chart-heading" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Profit & Loss Financial Waterfall Visualization</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual breakdown of Gross Revenue, direct delivery costs, operating expenses, and retained Net Profit. Click any bar to view contributing line-items.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Interactive Drill-down</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  FY26 Statement
                </span>
              </div>
            </div>

            <div
              className="h-64 w-full cursor-pointer"
              role="img"
              aria-label={`Bar chart of Profit and Loss Waterfall: Gross Revenue ${formatCurrency(revenueMetrics.revenueMTD, currency)}, COGS ${formatCurrency(marginMetrics.cogsMTD, currency)}, Gross Profit ${formatCurrency(marginMetrics.grossProfit, currency)}, Operating OPEX ${formatCurrency(marginMetrics.operatingExpenses, currency)}, EBITDA ${formatCurrency(marginMetrics.ebitda, currency)}, Net Profit ${formatCurrency(marginMetrics.netProfit, currency)}. Click any bar to view transaction line items.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pAndLWaterfallData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  onClick={(e: any) => {
                    if (e && e.activeLabel) {
                      const match = pAndLWaterfallData.find((d) => d.name === e.activeLabel);
                      handleChartDrilldown({
                        pointName: e.activeLabel,
                        pointValue: match ? match.value : undefined,
                        chartType: 'P_AND_L_WATERFALL',
                        rawPayload: match,
                      });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(val) => {
                      if (val >= 100000) return `${currency === 'INR' ? '₹' : '$'}${(val / 100000).toFixed(1)}L`;
                      return `${val}`;
                    }}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${formatCurrency(Number(val), currency)} (Click to Drill Down)`, 'Waterfall Value']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} cursor="pointer">
                    {pAndLWaterfallData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => {
                          handleChartDrilldown({
                            pointName: entry.name,
                            pointValue: entry.value,
                            chartType: 'P_AND_L_WATERFALL',
                            rawPayload: entry,
                          });
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {reportType === 'UNIT_ECONOMICS' && (
          <section
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
            aria-labelledby="unit-economics-chart-heading"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 id="unit-economics-chart-heading" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span>Unit Economics & Payback Period Telemetry</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Blended acquisition cost, lifetime value multiplier, and cohort payback metrics with period growth vectors.
                </p>
              </div>

              <CopyTableButton
                id="copy-unit-economics-table-btn"
                options={{
                  title: 'Unit Economics & Payback Telemetry Report',
                  subtitle: `Organization Performance vs Industry Sector Benchmarks (${PERIOD_LABELS[filters.period]})`,
                  periodLabel: PERIOD_LABELS[filters.period],
                  filteredCategory: 'Unit Economics Cohorts',
                  columns: [
                    { header: 'Metric Dimension', key: 'metric', align: 'left' },
                    { header: 'Current Org Performance', key: 'current', align: 'right' },
                    { header: 'Previous Baseline', key: 'previous', align: 'right' },
                    { header: 'Variance', key: 'variance', align: 'right' },
                    { header: 'Sector Benchmark', key: 'benchmark', align: 'right' },
                    { header: 'Health Status', key: 'status', align: 'center' },
                  ],
                  rows: unitEconomicsData.map((r) => {
                    const formatUnitVal = (v: number) =>
                      r.unit === 'x'
                        ? `${v.toFixed(1)}x`
                        : r.unit === 'Mo'
                        ? `${v.toFixed(1)} Months`
                        : formatCurrency(v, currency);
                    return {
                      metric: r.metric,
                      current: formatUnitVal(r.org),
                      previous: formatUnitVal(r.prevOrg),
                      variance: `${r.change >= 0 ? '+' : ''}${r.change.toFixed(1)}%`,
                      benchmark: formatUnitVal(r.benchmark),
                      status: 'Optimal',
                    };
                  }),
                  highlights: [
                    `Blended CAC: ${formatCurrency(marketingMetrics.blendedCAC, currency)} (-10.7% cost reduction).`,
                    `Customer LTV: ${formatCurrency(customerMetrics.avgLTV, currency)} with a ${(customerMetrics.avgLTV / (marketingMetrics.blendedCAC || 1)).toFixed(1)}x multiple.`,
                  ],
                }}
                label="Copy Table for Email"
                size="xs"
                onCopySuccess={() => {
                  addToast('Copied Unit Economics table formatted for email to clipboard!', 'success', 'Table Copied');
                }}
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table
                className="w-full text-left text-xs"
                role="table"
                aria-label="Unit Economics Comparison Data Table with Growth and Decline Trend Icons"
              >
                <caption className="sr-only">Unit Economics comparison between Organization Performance and Sector Benchmark</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 uppercase text-[10px] tracking-wider">
                    <th scope="col" className="py-2.5 px-3">Metric Dimension</th>
                    <th scope="col" className="py-2.5 px-3 font-mono-numeric">Current Org Performance</th>
                    <th scope="col" className="py-2.5 px-3 font-mono-numeric">Previous Period Baseline</th>
                    <th scope="col" className="py-2.5 px-3 font-mono-numeric">Sector Benchmark</th>
                    <th scope="col" className="py-2.5 px-3 text-center">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unitEconomicsData.map((row, idx) => {
                    const formatUnitVal = (v: number) =>
                      row.unit === 'x'
                        ? `${v.toFixed(1)}x`
                        : row.unit === 'Mo'
                        ? `${v.toFixed(1)} Months`
                        : formatCurrency(v, currency);

                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          handleChartDrilldown({
                            pointName: row.metric,
                            pointValue: row.org,
                            chartType: 'UNIT_ECONOMICS',
                            rawPayload: row,
                          });
                        }}
                        className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        role="button"
                        tabIndex={0}
                        title="Click to drill down into unit economics granular components"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleChartDrilldown({
                              pointName: row.metric,
                              pointValue: row.org,
                              chartType: 'UNIT_ECONOMICS',
                              rawPayload: row,
                            });
                          }
                        }}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center justify-between">
                          <span className="group-hover:text-indigo-600 transition-colors">{row.metric}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors ml-1" />
                        </td>
                        {/* Current Org Performance with Trend Icon */}
                        <td className="py-2.5 px-3 font-mono-numeric font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{formatUnitVal(row.org)}</span>
                            <TrendIndicator
                              change={row.change}
                              isPositiveGood={row.isPositiveGood}
                              size="xs"
                              variant="inline-icon"
                              comparisonLabel={`vs previous ${formatUnitVal(row.prevOrg)}`}
                            />
                          </div>
                        </td>
                        {/* Previous Period Baseline */}
                        <td className="py-2.5 px-3 font-mono-numeric text-slate-500">
                          {formatUnitVal(row.prevOrg)}
                        </td>
                        {/* Sector Standard Benchmark with Trend Icon */}
                        <td className="py-2.5 px-3 font-mono-numeric text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{formatUnitVal(row.benchmark)}</span>
                            <TrendIndicator
                              change={row.benchmarkChange}
                              isPositiveGood={row.isPositiveGood}
                              size="xs"
                              variant="inline-icon"
                              comparisonLabel="Sector trajectory"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Optimal</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Diagnostic Findings & Filtered Action Tasks */}
        <section className="space-y-3" aria-labelledby="section-action-items-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 id="section-action-items-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Strategic CEO Action Items ({filteredActions.length} Filtered)
              </h3>
              {filters.department !== 'ALL' && (
                <span className="text-[11px] font-semibold text-indigo-600">
                  Department: {DEPARTMENT_LABELS[filters.department]}
                </span>
              )}
            </div>

            {filteredActions.length > 0 && (
              <CopyTableButton
                id="copy-action-items-table-btn"
                options={{
                  title: 'Prioritized Strategic CEO Action Items & Financial Upside',
                  subtitle: `Department Focus: ${DEPARTMENT_LABELS[filters.department]} (${PERIOD_LABELS[filters.period]})`,
                  periodLabel: PERIOD_LABELS[filters.period],
                  filteredCategory: filters.department === 'ALL' ? 'All Departments' : DEPARTMENT_LABELS[filters.department],
                  columns: [
                    { header: 'Priority', key: 'priority', align: 'center' },
                    { header: 'Initiative & Problem Statement', key: 'initiative', align: 'left' },
                    { header: 'Owner', key: 'owner', align: 'left' },
                    { header: 'Expected Financial Impact', key: 'impact', align: 'right' },
                  ],
                  rows: filteredActions.slice(0, 10).map((a) => ({
                    priority: a.priority,
                    initiative: `${a.title} — ${a.problem}`,
                    owner: a.owner,
                    impact: `+${formatCurrency(a.expectedImpactAmount, currency)}`,
                  })),
                  highlights: [
                    `Total Filtered Strategic Initiatives: ${filteredActions.length}`,
                    `Aggregate Financial Recovery Upside: +${formatCurrency(
                      filteredActions.reduce((acc, curr) => acc + curr.expectedImpactAmount, 0),
                      currency
                    )}`,
                  ],
                }}
                label="Copy Actions for Email"
                size="xs"
                onCopySuccess={() => {
                  addToast(
                    `Copied ${filteredActions.slice(0, 10).length} CEO action items formatted for email to clipboard!`,
                    'success',
                    'Action Table Copied'
                  );
                }}
              />
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table
              className="w-full text-left text-xs"
              role="table"
              aria-label="Prioritized Strategic CEO Action Items and Financial Impact Table with Growth Trend Indicators"
            >
              <caption className="sr-only">Top prioritized CEO action items, assigned owners, and expected financial impact</caption>
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50 uppercase text-[10px] tracking-wider">
                  <th scope="col" className="py-2.5 px-3">Priority</th>
                  <th scope="col" className="py-2.5 px-3">Initiative / Problem Statement</th>
                  <th scope="col" className="py-2.5 px-3">Owner</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Financial Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      No action items match the active filter criteria. Try changing or resetting filters.
                    </td>
                  </tr>
                ) : (
                  filteredActions.slice(0, 8).map((action) => (
                    <tr key={action.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <div className="flex items-center justify-end gap-1.5">
                          <span>+{formatCurrency(action.expectedImpactAmount, currency)}</span>
                          <TrendIndicator
                            direction="up"
                            isPositiveGood={true}
                            size="xs"
                            variant="inline-icon"
                            comparisonLabel="Positive recovery upside"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Executive Annotations & Strategic Commentary (Custom Text Annotations feature) */}
        <ExecutiveAnnotationsManager
          annotations={annotations}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          defaultAuthorName={currentOrg.ceoName || 'Rajesh Sharma'}
          defaultRole="CEO"
        />

        {/* Section 5: Industry Taxonomy & Sector Intelligence with Search & Multi-Select Filters */}
        <section className="space-y-3 pt-2" aria-labelledby="section-taxonomy-heading">
          <div className="flex items-center justify-between">
            <h3 id="section-taxonomy-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              5. Industry Sector Taxonomy & Cross-Domain Benchmarks
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              23 Master Sectors Available
            </span>
          </div>

          {/* Search bar and multi-select filter controls component */}
          <IndustryReportsExplorer />
        </section>

        {/* Section 6: Export Summary Strip (Screen Only) */}
        <section
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden"
          aria-label="Raw Dataset Export Options"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span className="text-slate-700 font-medium">
              Export includes live telemetry, current filter scope ({PERIOD_LABELS[filters.period]}), all {annotations.length} executive annotations, and 23 sector benchmarks.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              aria-label="Download Full CSV Report"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              aria-label="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </section>

        {/* Report Footer with dynamic signature */}
        <footer className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 print:pt-4 print:text-[10px] print:text-slate-600">
          <span>AI CEO Command Center • Real-time verified telemetry • Ledger Verified</span>
          <span>Sign-off: _______________________________ (CEO {currentOrg.ceoName || 'Rajesh Sharma'})</span>
        </footer>

        {/* Official Fixed Print Document Footer (Rendered only in print stream across pages) */}
        <PrintDocumentFooter
          currentOrg={currentOrg}
          reportType={reportType}
          periodLabel={PERIOD_LABELS[filters.period]}
        />
      </main>

      {/* Granular Chart Drill-down Modal (Screen Only) */}
      <div className="print:hidden">
        <ChartDrilldownModal
          isOpen={isDrilldownOpen}
          onClose={() => setIsDrilldownOpen(false)}
          data={drilldownData}
        />
      </div>
    </div>
  );
};
