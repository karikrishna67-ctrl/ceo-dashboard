export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CEO = 'CEO',
  CFO = 'CFO',
  SALES_MANAGER = 'SALES_MANAGER',
  MARKETING_MANAGER = 'MARKETING_MANAGER',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER',
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export interface BusinessSettings {
  currency: CurrencyCode;
  currencySymbol: string;
  monthlyRevenueTarget: number;
  annualRevenueTarget: number;
  minCashReserve: number;
  averageDealSize: number;
  salesCycleDays: number;
  monthlyMarketingBudget: number;
  monthlyOperatingBudget: number;
  dsoThresholdDays: number;
  churnThresholdPct: number;
  burnRateAlertThreshold: number;
  primaryGoals: string[];
  fiscalYearStart: string; // e.g. "April" or "January"
  isDemoMode: boolean;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  businessModel: 'B2B SaaS' | 'B2B Services' | 'D2C / E-commerce' | 'Agency' | 'Manufacturing' | 'Enterprise';
  ceoName: string;
  employeeCount: number;
  customerCount: number;
  website: string;
  createdAt: string;
  settings: BusinessSettings;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  title: string;
  department: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Appointment'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Nurture';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export interface LeadActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal_sent' | 'status_change';
  description: string;
  date: string;
  createdBy: string;
}

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string; // Google, Meta, LinkedIn, Referral, Inbound, Direct, Outbound
  campaign?: string;
  industry: string;
  location: string;
  leadScore: number; // 0-100
  temperature: LeadTemperature;
  status: LeadStatus;
  assignedSalesperson: string;
  createdDate: string;
  lastContactDate: string;
  nextFollowupDate: string;
  estimatedValue: number;
  dealProbability: number; // 0-100%
  lostReason?: string;
  activities: LeadActivity[];
}

export type CustomerSegment =
  | 'VIP'
  | 'High Value'
  | 'Regular'
  | 'New'
  | 'Inactive'
  | 'At Risk'
  | 'Churned';

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  location: string;
  productsPurchased: string[];
  totalRevenue: number;
  monthlyRecurring: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  nextPurchaseProbability: number; // 0-100%
  lifetimeValue: number;
  status: 'Active' | 'Inactive' | 'Churned';
  segment: CustomerSegment;
  churnRiskScore: number; // 0-100%
  unpaidBalance: number;
  notes?: string;
  assignedAccountManager: string;
}

export interface ProductService {
  id: string;
  organizationId: string;
  name: string;
  type: 'Product' | 'Service' | 'Subscription';
  category: string;
  price: number;
  cogs: number;
  marginPct: number;
  activeCustomersCount: number;
  revenueTotal: number;
  growthPct: number;
}

export interface RevenueTransaction {
  id: string;
  organizationId: string;
  date: string;
  amount: number;
  customerId: string;
  customerName: string;
  productOrService: string;
  category: string;
  channel: string;
  salesperson: string;
  isRecurring: boolean;
  type: 'Subscription' | 'One-Time' | 'Retainer' | 'Project Milestones';
  status: 'Completed' | 'Pending' | 'Refunded';
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';
  paymentMethod?: string;
  paidDate?: string;
  daysOverdue?: number;
}

export type ExpenseCategory =
  | 'Payroll'
  | 'Marketing'
  | 'Software'
  | 'Rent'
  | 'Utilities'
  | 'Travel'
  | 'Operations'
  | 'Professional Fees'
  | 'Loans'
  | 'Interest'
  | 'Other';

export interface Expense {
  id: string;
  organizationId: string;
  title: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  date: string;
  paymentMethod: string;
  department: string;
  isRecurring: boolean;
  budgetAllocated: number;
  status: 'Approved' | 'Pending' | 'Flagged';
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface CashFlowRecord {
  id: string;
  organizationId: string;
  date: string;
  type: 'Inflow' | 'Outflow';
  category: string;
  amount: number;
  description: string;
  sourceDestination: string;
  runningBalance: number;
}

export interface MarketingCampaign {
  id: string;
  organizationId: string;
  name: string;
  channel: 'Google Ads' | 'Meta Ads' | 'LinkedIn' | 'YouTube' | 'SEO & Content' | 'WhatsApp' | 'Referral' | 'Organic' | 'Events' | 'Partnerships';
  spend: number;
  leadsGenerated: number;
  qualifiedLeads: number;
  customersAcquired: number;
  revenueGenerated: number;
  cac: number;
  cpl: number;
  roas: number;
  roiPct: number;
  status: 'Active' | 'Paused' | 'Completed';
  startDate: string;
  endDate?: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  department: 'Sales' | 'Marketing' | 'Operations' | 'Finance' | 'Engineering' | 'Leadership';
  email: string;
  phone: string;
  leadsHandled: number;
  callsDone: number;
  dealsClosed: number;
  revenueGenerated: number;
  monthlyTarget: number;
  achievementPct: number;
  conversionRatePct: number;
  status: 'Active' | 'On Leave';
  avatar?: string;
}

export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Dismissed';

export interface CEOActionTask {
  id: string;
  organizationId: string;
  title: string;
  problem: string;
  recommendedAction: string;
  expectedImpactAmount: number;
  expectedImpactDescription: string;
  owner: string;
  priority: ActionPriority;
  dueDate: string;
  status: ActionStatus;
  category: 'Cash Recovery' | 'Sales Acceleration' | 'Cost Reduction' | 'Marketing Optimization' | 'Customer Retention' | 'Operations';
  sourceInsightId?: string;
  createdAt: string;
  completedAt?: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AIAlert {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: 'REVENUE' | 'CASH' | 'SALES' | 'EXPENSE' | 'CUSTOMER' | 'MARKETING' | 'OPERATIONS' | 'PREDICTIVE';
  metricImpact?: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionRoute?: string;
  isPredictive?: boolean;
  confidencePct?: number;
  projectedDeficit?: number;
  recommendedVelocity?: string;
  pacingLagPct?: number;
}

export interface OpportunityItem {
  id: string;
  title: string;
  category: 'Revenue' | 'Customers' | 'Pricing' | 'Marketing' | 'Sales' | 'Products' | 'Partnerships' | 'Cost Reduction' | 'Automation';
  description: string;
  evidence: string;
  potentialRevenue: number;
  difficulty: 'Easy' | 'Medium' | 'Complex';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  recommendedAction: string;
  timeframe: 'Immediate (<7 days)' | 'Short term (1-4 weeks)' | 'Quarterly';
}

export interface RevenueLeakageBreakdown {
  totalLeakage: number;
  receivables: { amount: number; count: number; description: string };
  lostLeads: { amount: number; count: number; description: string };
  unusedCapacity: { amount: number; description: string };
  pricingLeakage: { amount: number; description: string };
  expenseLeakage: { amount: number; count: number; description: string };
}

export interface HealthScoreBreakdown {
  totalScore: number; // 0-100
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  categories: {
    revenueHealth: { score: number; max: 20; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    profitability: { score: number; max: 15; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    cashFlow: { score: number; max: 20; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    salesPipeline: { score: number; max: 15; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    marketingROI: { score: number; max: 10; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    customerRetention: { score: number; max: 10; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
    operations: { score: number; max: 10; status: 'green' | 'yellow' | 'red'; label: string; insight: string };
  };
}

export interface CEODailyBriefing {
  date: string;
  ceoName: string;
  yesterday: {
    revenue: number;
    leads: number;
    salesWon: number;
    collections: number;
  };
  today: {
    topOpportunities: string[];
    criticalMeetings: string[];
    urgentFollowups: string[];
  };
  risks: {
    revenueRisk: string;
    cashRisk: string;
    salesRisk: string;
    operationalRisk: string;
  };
  aiRecommendations: {
    action: string;
    owner: string;
    impact: number;
  }[];
  totalImpactOpportunity: number;
}

export interface ScenarioPlanState {
  targetRevenue: number;
  currentRevenue: number;
  averageDealSize: number;
  currentConversionPct: number;
  monthlyMarketingBudget: number;
  priceIncreasePct: number;
  leadVolumeIncreasePct: number;
  conversionImprovementPct: number;
  expenseReductionPct: number;
}

export type AIAgentId =
  | 'CEO_STRATEGIST'
  | 'REVENUE_ANALYST'
  | 'SALES_COACH'
  | 'MARKETING_ANALYST'
  | 'CFO_AGENT'
  | 'CUSTOMER_SUCCESS'
  | 'OPERATIONS_AGENT'
  | 'FORECASTING_AGENT';

export interface AIAgentMeta {
  id: AIAgentId;
  name: string;
  role: string;
  avatarIcon: string;
  badgeColor: string;
  focusArea: string;
  description: string;
  sampleQuestions: string[];
}

export type DateFilterOption =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface FilterState {
  dateRange: DateFilterOption;
  customStartDate?: string;
  customEndDate?: string;
  channelFilter?: string;
  salespersonFilter?: string;
  departmentFilter?: string;
  searchQuery?: string;
}
