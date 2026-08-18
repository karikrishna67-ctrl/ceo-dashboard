import {
  Organization,
  Lead,
  Customer,
  ProductService,
  Invoice,
  Expense,
  MarketingCampaign,
  Employee,
  HealthScoreBreakdown,
  RevenueLeakageBreakdown,
  CEODailyBriefing,
  CEOActionTask,
} from '../types';

export interface KPISnapshot {
  // Primary Metrics
  revenueMTD: number;
  revenueTarget: number;
  revenueGap: number;
  revenueAchievementPct: number;
  revenueGrowthMoM: number;
  daysRemainingInMonth: number;
  requiredDailyRevenue: number;
  requiredDealsCount: number;
  requiredLeadsCount: number;

  // Profitability
  cogsMTD: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  ebitda: number;
  netProfit: number;
  netMarginPct: number;

  // Cash & Balance
  cashBalance: number;
  monthlyBurnRate: number;
  cashRunwayMonths: number;
  outstandingReceivables: number;
  overdueReceivables: number;
  accountsPayable: number;
  dsoDays: number;
  dpoDays: number;
  workingCapital: number;

  // Sales & CRM
  totalLeads: number;
  qualifiedLeads: number;
  pipelineValue: number;
  winRatePct: number;
  averageDealSize: number;
  salesCycleDays: number;
  wonDealsValue: number;
  wonDealsCount: number;

  // Customers & Retention
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomersCount: number;
  churnRatePct: number;
  retentionRatePct: number;
  avgLTV: number;
  mrr: number;
  arr: number;

  // Marketing
  marketingSpend: number;
  marketingRevenue: number;
  blendedCAC: number;
  blendedCPL: number;
  blendedROAS: number;
  topChannel: string;
  underperformingChannel: string;

  // Health Score & Leakage
  healthScore: HealthScoreBreakdown;
  leakage: RevenueLeakageBreakdown;
  salesFunnel: FunnelStage[];
  biggestBottleneck: { stage: string; dropPct: number; message: string };

  // Executive Questions
  whatIsGoingWell: string[];
  whatIsGoingWrong: string[];
  whereLosingMoney: string[];
  whereMakeMoreMoney: string[];
  top3ActionsToday: CEOActionTask[];
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  value: number;
  conversionToNext: number; // percentage (e.g. 65%)
  isBottleneck?: boolean;
}

export function computeKPISnapshot(
  org: Organization,
  leads: Lead[],
  customers: Customer[],
  products: ProductService[],
  invoices: Invoice[],
  expenses: Expense[],
  campaigns: MarketingCampaign[],
  employees: Employee[],
  actions: CEOActionTask[]
): KPISnapshot {
  const target = org.settings.monthlyRevenueTarget || 5000000;
  const avgDeal = org.settings.averageDealSize || 125000;

  // Calculate Revenue from paid and high-probability deals + recurring
  const paidInvoicesTotal = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // MTD baseline (using demo or live calculated sum)
  const revenueMTD = paidInvoicesTotal > 0 ? paidInvoicesTotal + 3610000 : 3850000; // Baseline ₹38.5L in demo
  const revenueGap = Math.max(0, target - revenueMTD);
  const revenueAchievementPct = target > 0 ? (revenueMTD / target) * 100 : 0;
  const revenueGrowthMoM = 14.2; // 14.2% growth

  // Time remaining
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = Math.min(now.getDate(), 28); // e.g. day 16
  const daysRemainingInMonth = Math.max(1, daysInMonth - currentDay);

  const requiredDailyRevenue = Math.round(revenueGap / daysRemainingInMonth);
  const requiredDealsCount = Math.ceil(revenueGap / (avgDeal || 100000));
  const avgConversion = 0.22; // 22%
  const requiredLeadsCount = Math.ceil(requiredDealsCount / avgConversion);

  // Expenses & Profitability
  const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) || 2295000;
  const cogsMTD = Math.round(revenueMTD * 0.18); // ~18% cogs
  const grossProfit = revenueMTD - cogsMTD;
  const grossMarginPct = revenueMTD > 0 ? (grossProfit / revenueMTD) * 100 : 0;
  const ebitda = grossProfit - operatingExpenses;
  const netProfit = Math.round(ebitda * 0.82); // After taxes/deprec
  const netMarginPct = revenueMTD > 0 ? (netProfit / revenueMTD) * 100 : 0;

  // Cash Flow & Runway
  const cashBalance = 4180000; // ₹41.8 Lakhs
  const monthlyBurnRate = operatingExpenses + cogsMTD - revenueMTD * 0.4;
  const cashRunwayMonths = monthlyBurnRate > 0 ? Math.round((cashBalance / operatingExpenses) * 10) / 10 : 12;

  // Receivables & Payables
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const overdueReceivables = overdueInvoices.reduce((sum, i) => sum + i.amount, 0) || 433000;
  const unpaidInvoices = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue');
  const outstandingReceivables = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0) || 628000;
  const accountsPayable = 280000;
  const dsoDays = 28; // Days Sales Outstanding
  const dpoDays = 34; // Days Payable Outstanding
  const workingCapital = cashBalance + outstandingReceivables - accountsPayable;

  // Sales & Funnel
  const totalLeads = leads.length || 142;
  const qualifiedLeads = leads.filter((l) => ['Qualified', 'Appointment', 'Proposal', 'Negotiation', 'Won'].includes(l.status)).length || 48;
  const pipelineValue = leads
    .filter((l) => ['Qualified', 'Appointment', 'Proposal', 'Negotiation'].includes(l.status))
    .reduce((sum, l) => sum + l.estimatedValue, 0) || 1530000;
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const wonDealsCount = wonLeads.length || 14;
  const wonDealsValue = wonLeads.reduce((sum, l) => sum + l.estimatedValue, 0) || 1850000;
  const winRatePct = 28.5;
  const averageDealSize = avgDeal;
  const salesCycleDays = org.settings.salesCycleDays || 22;

  // Customers & MRR
  const totalCustomers = customers.length || 142;
  const activeCustomers = customers.filter((c) => c.status === 'Active').length || 128;
  const atRiskCustomers = customers.filter((c) => c.segment === 'At Risk' || c.churnRiskScore > 60);
  const atRiskCustomersCount = atRiskCustomers.length || 8;
  const churnRatePct = 2.4;
  const retentionRatePct = 97.6;
  const mrr = customers.reduce((sum, c) => sum + (c.monthlyRecurring || 0), 0) || 1850000;
  const arr = mrr * 12;
  const avgLTV = customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length) : 1850000;

  // Marketing Analysis
  const marketingSpend = campaigns.reduce((sum, c) => sum + c.spend, 0) || 470000;
  const marketingRevenue = campaigns.reduce((sum, c) => sum + c.revenueGenerated, 0) || 4750000;
  const totalAcquired = campaigns.reduce((sum, c) => sum + c.customersAcquired, 0) || 42;
  const totalCampLeads = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0) || 540;
  const blendedCAC = totalAcquired > 0 ? Math.round(marketingSpend / totalAcquired) : 11190;
  const blendedCPL = totalCampLeads > 0 ? Math.round(marketingSpend / totalCampLeads) : 870;
  const blendedROAS = marketingSpend > 0 ? Math.round((marketingRevenue / marketingSpend) * 10) / 10 : 10.1;

  const sortedCampaigns = [...campaigns].sort((a, b) => b.roas - a.roas);
  const topChannel = sortedCampaigns[0]?.channel || 'WhatsApp (35.6x ROAS)';
  const underperformingChannel = sortedCampaigns[sortedCampaigns.length - 1]?.channel || 'Meta Ads (3.2x ROAS)';

  // Sales Funnel
  const funnelStages: FunnelStage[] = [
    { id: '1', name: 'Leads', count: 540, value: 67500000, conversionToNext: 38.5 },
    { id: '2', name: 'Qualified', count: 208, value: 26000000, conversionToNext: 62.0 },
    { id: '3', name: 'Calls / Demos', count: 129, value: 16125000, conversionToNext: 58.0 },
    { id: '4', name: 'Proposals', count: 75, value: 9375000, conversionToNext: 38.6, isBottleneck: true },
    { id: '5', name: 'Negotiations', count: 29, value: 3625000, conversionToNext: 65.5 },
    { id: '6', name: 'Won Deals', count: 19, value: 2375000, conversionToNext: 100 },
  ];

  const biggestBottleneck = {
    stage: 'Proposals → Negotiations',
    dropPct: 38.6,
    message: 'Proposal-to-Negotiation conversion dropped from 52% to 38.6% — 46 proposals are stalled past 14 days without follow-up.',
  };

  // Health Score Calculation (0-100)
  const revenueScore = revenueAchievementPct >= 90 ? 18 : revenueAchievementPct >= 75 ? 15 : 10;
  const profitScore = netMarginPct >= 20 ? 14 : netMarginPct >= 10 ? 12 : 7;
  const cashScore = cashRunwayMonths >= 6 ? 19 : cashRunwayMonths >= 3 ? 14 : 8;
  const salesScore = winRatePct >= 25 ? 13 : 9;
  const marketingScore = blendedROAS >= 6 ? 9 : 6;
  const retentionScore = churnRatePct <= 3 ? 9 : 6;
  const opsScore = 8;

  const totalScore = revenueScore + profitScore + cashScore + salesScore + marketingScore + retentionScore + opsScore; // ~86 / 100
  const normalizedScore = Math.min(100, Math.max(0, totalScore));

  const healthScore: HealthScoreBreakdown = {
    totalScore: normalizedScore,
    status: normalizedScore >= 75 ? 'Healthy' : normalizedScore >= 50 ? 'Needs Attention' : 'Critical',
    categories: {
      revenueHealth: {
        score: revenueScore,
        max: 20,
        status: revenueScore >= 16 ? 'green' : revenueScore >= 12 ? 'yellow' : 'red',
        label: 'Revenue Health',
        insight: `MTD ₹38.5L / Target ₹50L (${revenueAchievementPct.toFixed(0)}% achievement)`,
      },
      profitability: {
        score: profitScore,
        max: 15,
        status: profitScore >= 12 ? 'green' : profitScore >= 9 ? 'yellow' : 'red',
        label: 'Profitability',
        insight: `Net Margin at ${netMarginPct.toFixed(1)}% (Target: >18%)`,
      },
      cashFlow: {
        score: cashScore,
        max: 20,
        status: cashScore >= 16 ? 'green' : cashScore >= 12 ? 'yellow' : 'red',
        label: 'Cash Flow',
        insight: `${cashRunwayMonths} months runway (Cash reserve ₹41.8L)`,
      },
      salesPipeline: {
        score: salesScore,
        max: 15,
        status: salesScore >= 12 ? 'green' : 'yellow',
        label: 'Sales Pipeline',
        insight: `Win Rate at ${winRatePct}% | Active Pipeline ₹15.3L`,
      },
      marketingROI: {
        score: marketingScore,
        max: 10,
        status: marketingScore >= 8 ? 'green' : 'yellow',
        label: 'Marketing ROI',
        insight: `Blended ROAS ${blendedROAS}x (WhatsApp 35.6x, Meta 3.2x)`,
      },
      customerRetention: {
        score: retentionScore,
        max: 10,
        status: retentionScore >= 8 ? 'green' : 'yellow',
        label: 'Customer Retention',
        insight: `Churn Rate at ${churnRatePct}% (2 Enterprise accounts at risk)`,
      },
      operations: {
        score: opsScore,
        max: 10,
        status: opsScore >= 8 ? 'green' : 'yellow',
        label: 'Operations & Productivity',
        insight: `82% capacity utilization; 6 unused SaaS seats flagged`,
      },
    },
  };

  // Revenue Leakage Breakdown
  const leakage: RevenueLeakageBreakdown = {
    totalLeakage: overdueReceivables + 480000 + 816000 + 612000 + 174000,
    receivables: {
      amount: overdueReceivables,
      count: overdueInvoices.length || 4,
      description: 'Overdue invoices past 15+ days across 4 client accounts.',
    },
    lostLeads: {
      amount: 480000,
      count: 14,
      description: 'Qualified inbound leads neglected with >5 days delay in first outreach.',
    },
    unusedCapacity: {
      amount: 816000,
      description: '6 unused SaaS enterprise seats and redundant cloud compute clusters.',
    },
    pricingLeakage: {
      amount: 612000,
      description: 'Enterprise SaaS tier underpriced by 15-28% compared to competitor benchmarks.',
    },
    expenseLeakage: {
      amount: 174000,
      count: 2,
      description: 'AWS unindexed compute overrun (+29%) and duplicate subscription fees.',
    },
  };

  // Top 5 CEO Priority Answers
  const whatIsGoingWell = [
    'WhatsApp Inbound marketing channel is delivering unprecedented 35.6x ROAS at ₹2,272 CAC.',
    'Gross Profit Margin remains high at 82.0% with strong SaaS unit economics.',
    'Senior AE Vikram Mehta closed 92.5% of monthly quota (₹18.5L generated).',
    'Customer retention on Enterprise Growth Suite is 97.6% with high satisfaction.',
  ];

  const whatIsGoingWrong = [
    '₹11.5L revenue gap remains with 15 days left in current billing cycle.',
    'Proposal-to-Negotiation conversion rate dropped to 38.6% (bottleneck).',
    '₹4.33L in overdue receivables is locking up operational cash.',
    'Apex Fasteners (₹1.5L overdue) and NextGen EduSolutions show 82% & 68% churn risk.',
  ];

  const whereLosingMoney = [
    '₹4.33L trapped in overdue invoices with average payment delay of 23 days.',
    'Meta Ads CAC is ₹31,666 with only 3.2x ROAS (underperforming vs WhatsApp/Google).',
    '₹68,000/mo spent on 6 unused sales intelligence software seats (ZoomInfo/Apollo).',
    'AWS cloud compute costs spiked +29% (+₹32,000) from unindexed vector search clusters.',
  ];

  const whereMakeMoreMoney = [
    'Reactivate 18 past one-time transformation clients with the ₹85k/mo AI Suite (+₹15.3L ARR).',
    'Reallocate ₹60k/mo from Meta Ads to WhatsApp Inbound ads (+₹17.8L expected yield).',
    'Introduce 15% value-based price upgrade on new Enterprise SaaS contracts (+₹6.12L ARR).',
    'Speed up proposal turnaround time to 48 hours to recover ₹6.5L in stalled pipeline.',
  ];

  const top3ActionsToday = actions.slice(0, 3);

  return {
    revenueMTD,
    revenueTarget: target,
    revenueGap,
    revenueAchievementPct,
    revenueGrowthMoM,
    daysRemainingInMonth,
    requiredDailyRevenue,
    requiredDealsCount,
    requiredLeadsCount,

    cogsMTD,
    grossProfit,
    grossMarginPct,
    operatingExpenses,
    ebitda,
    netProfit,
    netMarginPct,

    cashBalance,
    monthlyBurnRate,
    cashRunwayMonths,
    outstandingReceivables,
    overdueReceivables,
    accountsPayable,
    dsoDays,
    dpoDays,
    workingCapital,

    totalLeads,
    qualifiedLeads,
    pipelineValue,
    winRatePct,
    averageDealSize,
    salesCycleDays,
    wonDealsValue,
    wonDealsCount,

    totalCustomers,
    activeCustomers,
    atRiskCustomersCount,
    churnRatePct,
    retentionRatePct,
    avgLTV,
    mrr,
    arr,

    marketingSpend,
    marketingRevenue,
    blendedCAC,
    blendedCPL,
    blendedROAS,
    topChannel,
    underperformingChannel,

    healthScore,
    leakage,
    salesFunnel: funnelStages,
    biggestBottleneck,

    whatIsGoingWell,
    whatIsGoingWrong,
    whereLosingMoney,
    whereMakeMoreMoney,
    top3ActionsToday,
  };
}

export function generateDailyBriefing(snapshot: KPISnapshot, ceoName: string): CEODailyBriefing {
  return {
    date: new Date().toISOString().split('T')[0],
    ceoName: ceoName || 'Rajesh Sharma',
    yesterday: {
      revenue: 185000,
      leads: 18,
      salesWon: 2,
      collections: 240000,
    },
    today: {
      topOpportunities: [
        'Close ₹6.5L negotiation with FinTrack Digital (Sneha Kulkarni).',
        'Deploy WhatsApp automated collection sequence for ₹4.33L overdue invoices.',
        'Review proposal for Apex Logistics Hub (₹4.2L annual contract).',
      ],
      criticalMeetings: [
        '10:30 AM — Executive Risk Check-in with NextGen EduSolutions CEO',
        '02:00 PM — Q3 Sales Pipeline Review & Proposal Bottleneck Fix',
        '04:30 PM — Finance & Cash Runway Forecast with CFO Pooja Iyer',
      ],
      urgentFollowups: [
        'Apex Fasteners (31 days overdue, ₹1.5L balance)',
        'Approve Meta-to-WhatsApp marketing budget reallocation',
      ],
    },
    risks: {
      revenueRisk: `₹${(snapshot.revenueGap / 100000).toFixed(1)}L gap to monthly target (${snapshot.daysRemainingInMonth} days left).`,
      cashRisk: `₹${(snapshot.overdueReceivables / 100000).toFixed(2)}L overdue receivables delaying cash collections.`,
      salesRisk: 'Proposal-to-Negotiation conversion dropped to 38.6% in Mid-Market.',
      operationalRisk: 'AWS cloud compute spiked +29% due to unindexed vector search queries.',
    },
    aiRecommendations: [
      {
        action: 'Execute automated WhatsApp + phone collection sequence on overdue invoices.',
        owner: 'Pooja Iyer (CFO)',
        impact: snapshot.overdueReceivables,
      },
      {
        action: 'Close ₹6.5L FinTrack Digital deal and expedite Apex Logistics proposal.',
        owner: 'Vikram Mehta (VP Sales)',
        impact: 1070000,
      },
      {
        action: 'Reallocate ₹60k from Meta Ads to WhatsApp Click-to-Chat campaigns.',
        owner: 'Ananya Roy (Marketing)',
        impact: 480000,
      },
    ],
    totalImpactOpportunity: snapshot.overdueReceivables + 1070000 + 480000,
  };
}
