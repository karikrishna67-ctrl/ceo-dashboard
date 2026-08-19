import {
  Organization,
  Lead,
  Customer,
  ProductService,
  Invoice,
  Expense,
  MarketingCampaign,
  Employee,
  CEODailyBriefing,
  CEOActionTask,
} from '../types';
import { KPIUtility } from '../utils/kpi';

export type { KPISnapshot, FunnelStage } from '../types';

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
) {
  return KPIUtility.computeKPISnapshot(
    org,
    leads,
    customers,
    products,
    invoices,
    expenses,
    campaigns,
    employees,
    actions
  );
}

export function generateDailyBriefing(snapshot: any, ceoName: string): CEODailyBriefing {
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
