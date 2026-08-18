import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Copy,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Zap,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';

interface FunnelLeakStage {
  id: string;
  stageNumber: number;
  name: string;
  count: number;
  expectedCount: number;
  conversionRate: number;
  benchmarkRate: number;
  lostCount: number;
  estimatedLostRevenue: number;
  leakReason: string;
  solution: string;
  isBiggestLeak?: boolean;
  actionButtonLabel: string;
  actionType: string;
}

export const RevenueLeakageView: React.FC = () => {
  const {
    kpiSnapshot,
    currency,
    invoices,
    customers,
    leads,
    expenses,
    setActiveView,
    addLead,
    updateActionStatus,
    convertOpportunityToTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'funnel' | 'receivables' | 'scripts' | 'cost-leaks'>('funnel');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    showToast('Script copied to clipboard!');
    setTimeout(() => setCopiedScriptId(null), 2500);
  };

  // 8-Stage Business Funnel Leakage Data
  const funnelStages: FunnelLeakStage[] = [
    {
      id: 'stg-1',
      stageNumber: 1,
      name: '1. Inbound Leads Generated',
      count: 520,
      expectedCount: 520,
      conversionRate: 90.8,
      benchmarkRate: 95.0,
      lostCount: 48,
      estimatedLostRevenue: 720000,
      leakReason: 'Average response time > 6.4 hours on weekends causes lead drop-off.',
      solution: 'Deploy 5-minute automated WhatsApp instant greeting with calendar link.',
      actionButtonLabel: 'Enforce 5-Min SLA',
      actionType: 'sla',
    },
    {
      id: 'stg-2',
      stageNumber: 2,
      name: '2. Leads Contacted & Qualified',
      count: 472,
      expectedCount: 494,
      conversionRate: 74.6,
      benchmarkRate: 82.0,
      lostCount: 120,
      estimatedLostRevenue: 1500000,
      leakReason: 'Low-intent Meta ad traffic diluting sales reps qualification time.',
      solution: 'Add mandatory budget qualification questions on lead capture forms.',
      actionButtonLabel: 'Optimize Form Filter',
      actionType: 'form',
    },
    {
      id: 'stg-3',
      stageNumber: 3,
      name: '3. Appointments / Demos Held',
      count: 352,
      expectedCount: 387,
      conversionRate: 88.1,
      benchmarkRate: 92.0,
      lostCount: 42,
      estimatedLostRevenue: 525000,
      leakReason: 'Demo no-show rate of 11.9% due to missing calendar reminder SMS/WhatsApp.',
      solution: 'Enable automated 24h & 2h WhatsApp reminder alerts before demo.',
      actionButtonLabel: 'Trigger Demo Reminders',
      actionType: 'reminder',
    },
    {
      id: 'stg-4',
      stageNumber: 4,
      name: '4. Proposals Sent',
      count: 310,
      expectedCount: 324,
      conversionRate: 40.6,
      benchmarkRate: 65.0,
      lostCount: 184,
      estimatedLostRevenue: 1480000,
      leakReason: 'Proposals taking > 4 days to deliver; pricing unclear to mid-market buyers.',
      solution: 'Implement standard 24h proposal turnaround and tiered self-serve packages.',
      isBiggestLeak: true,
      actionButtonLabel: 'Fix Proposal Bottleneck',
      actionType: 'proposal',
    },
    {
      id: 'stg-5',
      stageNumber: 5,
      name: '5. Negotiations',
      count: 126,
      expectedCount: 201,
      conversionRate: 85.7,
      benchmarkRate: 88.0,
      lostCount: 18,
      estimatedLostRevenue: 225000,
      leakReason: 'Payment term friction; lack of upfront annual discount incentive.',
      solution: 'Offer 8% concession for deals paid annually upfront before month-end.',
      actionButtonLabel: 'Deploy Annual Discount Terms',
      actionType: 'discount',
    },
    {
      id: 'stg-6',
      stageNumber: 6,
      name: '6. Closed Won Sales',
      count: 108,
      expectedCount: 111,
      conversionRate: 100.0,
      benchmarkRate: 100.0,
      lostCount: 0,
      estimatedLostRevenue: 0,
      leakReason: 'Healthy deal closing rate for qualified proposal-stage deals.',
      solution: 'Maintain current account executive closing playbook.',
      actionButtonLabel: 'View Closed Sales',
      actionType: 'sales',
    },
    {
      id: 'stg-7',
      stageNumber: 7,
      name: '7. Invoices & Cash Collections',
      count: 104,
      expectedCount: 108,
      conversionRate: 96.3,
      benchmarkRate: 99.0,
      lostCount: 4,
      estimatedLostRevenue: 433000,
      leakReason: '4 client invoices overdue by up to 31 days without structured collection cadence.',
      solution: 'Deploy multi-step WhatsApp + email collection sequence with CFO escalation.',
      actionButtonLabel: 'Trigger Auto-Collections',
      actionType: 'receivables',
    },
    {
      id: 'stg-8',
      stageNumber: 8,
      name: '8. Customer Retention & Repeat Sales',
      count: 128,
      expectedCount: 132,
      conversionRate: 96.9,
      benchmarkRate: 98.5,
      lostCount: 4,
      estimatedLostRevenue: 235000,
      leakReason: '3 at-risk enterprise accounts with low login frequency and overdue payments.',
      solution: 'Schedule CEO executive touchpoint calls with account leaders.',
      actionButtonLabel: 'Reactivate At-Risk Clients',
      actionType: 'churn',
    },
  ];

  // Overdue Invoices List
  const overdueInvoices = invoices.filter((inv) => inv.status === 'Overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Script Templates
  const scripts = [
    {
      id: 'script-inv-1',
      category: 'Cash Collection (Overdue > 14 Days)',
      title: 'Polite but Firm WhatsApp Collection Notice',
      text: `Hi [Client Name], Rajesh here from ABC Growth Solutions. 

Trust you are doing well!

Our finance desk noted that Invoice #[InvoiceNumber] for [Amount] was due on [DueDate]. To ensure uninterrupted service and support for your team, could you please confirm if this has been scheduled for release today?

Payment link / UPI: payments@abcgrowth.in
Attached copy: [Invoice PDF Link]

Thank you for your prompt partnership!`,
    },
    {
      id: 'script-prop-1',
      category: 'Stalled Proposal Follow-Up (Day 3)',
      title: 'Executive Proposal Follow-up & Value Lock',
      text: `Hi [Prospect Name],

Following up on the Growth Engine proposal we shared on [Date]. 

Our technical team has reserved rollout capacity for your team starting next Monday to hit your Q4 targets. 

If we can finalize terms before this Friday, I can also authorize our 8% annual prepayment concession (saving your team ₹[DiscountAmount]).

Do you have 10 minutes today at 3:30 PM for a quick alignment call?`,
    },
    {
      id: 'script-dormant-1',
      category: 'Dormant Client Reactivation',
      title: 'Executive Check-in & New AI Suite Pilot',
      text: `Hi [Client Name],

It's been a few months since we completed the pipeline audit for [Company Name]. 

We recently launched our new AI Revenue Optimizer Suite which has helped peers increase deal conversion by 24%. As a valued past client, I'd love to offer your team a complimentary 14-day full-access pilot with zero commitment.

Can I set up your login credentials this week?`,
    },
  ];

  const handleStageAction = (stage: FunnelLeakStage) => {
    if (stage.actionType === 'receivables') {
      setActiveTab('receivables');
      showToast('Navigated to Overdue Receivables Recovery.');
    } else if (stage.actionType === 'proposal') {
      setActiveView('sales-crm');
      showToast('Opening Sales Pipeline to unblock proposals.');
    } else if (stage.actionType === 'churn') {
      setActiveView('customers');
      showToast('Opening Customer Retention dashboard.');
    } else {
      showToast(`Action Triggered: ${stage.solution}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Revenue Leakage Detector & Recovery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              WHERE AM I LOSING MONEY?
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            End-to-end diagnosis across all 8 business stages. Identify leak causes, calculated revenue loss, and execute 1-click fixes.
          </p>
        </div>

        {/* Live Total Leakage Counter */}
        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Total Identified Monthly Leakage
            </div>
            <div className="text-2xl md:text-3xl font-black text-rose-700 font-mono-numeric">
              {formatCurrency(kpiSnapshot.leakage.totalLeakage, currency)}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('receivables')}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Start Recovery
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'funnel', label: '8-Stage Leakage Funnel', badge: '8 Stages' },
          { id: 'receivables', label: 'Overdue Receivables', badge: formatCurrency(totalOverdue, currency) },
          { id: 'cost-leaks', label: 'Expense & Software Waste', badge: '₹8.16L / yr' },
          { id: 'scripts', label: 'Recovery Script Templates', badge: '3 Ready' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: 8-STAGE FUNNEL LEAKAGE */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          {/* Funnel Highlight Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-amber-900 font-bold text-sm">
                Primary Revenue Bottleneck: Stage 4 (Proposals Sent → Negotiations)
              </strong>
              <p className="text-slate-700 mt-1 leading-relaxed">
                Conversion rate dropped to <strong>40.6%</strong> vs the 65% benchmark, stalling 184 proposals and resulting in an estimated <strong>₹14.80 Lakhs</strong> in delayed revenue. Turnaround time averages 4.2 days.
              </p>
            </div>
          </div>

          {/* Stage Cards Grid */}
          <div className="space-y-3">
            {funnelStages.map((stg) => (
              <div
                key={stg.id}
                className={`p-5 rounded-2xl border transition-all ${
                  stg.isBiggestLeak
                    ? 'bg-rose-50/30 border-rose-300 shadow-xs ring-1 ring-rose-200'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Stage Info */}
                  <div className="lg:w-1/3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        {stg.name}
                      </span>
                      {stg.isBiggestLeak && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-black uppercase tracking-wider shadow-2xs">
                          Biggest Leak
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-3 mt-2">
                      <div>
                        <span className="text-xs text-slate-400">Volume: </span>
                        <strong className="text-base text-slate-900 font-mono-numeric">{stg.count}</strong>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400">Conversion: </span>
                        <span
                          className={`font-bold font-mono-numeric ${
                            stg.conversionRate < stg.benchmarkRate ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {stg.conversionRate}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal"> (bm: {stg.benchmarkRate}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Diagnosis & Lost Revenue */}
                  <div className="lg:w-5/12 text-xs space-y-1">
                    <div className="text-slate-700">
                      <span className="font-bold text-slate-900">Why Money Leaks: </span>
                      {stg.leakReason}
                    </div>
                    <div className="text-emerald-800 font-medium">
                      <span className="font-bold">AI Recommended Fix: </span>
                      {stg.solution}
                    </div>
                    {stg.estimatedLostRevenue > 0 && (
                      <div className="text-rose-700 font-bold font-mono-numeric pt-1">
                        Est. Missed Revenue: -{formatCurrency(stg.estimatedLostRevenue, currency)} ({stg.lostCount} lost)
                      </div>
                    )}
                  </div>

                  {/* Right: 1-Click Action Button */}
                  <div className="lg:w-1/4 flex items-center justify-end">
                    <button
                      onClick={() => handleStageAction(stg)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        stg.isBiggestLeak
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{stg.actionButtonLabel}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OVERDUE RECEIVABLES */}
      {activeTab === 'receivables' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Overdue Invoice Collection Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {overdueInvoices.length} invoices past due date. Total uncollected working capital: <strong className="text-rose-600 font-mono-numeric">{formatCurrency(totalOverdue, currency)}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  showToast('Automated collection sequences dispatched to all 4 clients via WhatsApp + Email.');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Recover All Overdue Invoices ({formatCurrency(totalOverdue, currency)})</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Amount Due</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Aging Status</th>
                    <th className="py-3 px-3 text-right">Quick Recovery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-numeric">
                  {overdueInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-3 font-sans font-medium text-slate-800">{inv.customerName}</td>
                      <td className="py-3.5 px-3 font-bold text-rose-600">
                        {formatCurrency(inv.amount, currency)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{inv.dueDate}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {inv.daysOverdue} Days Overdue
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const script = scripts[0].text
                                .replace('[Client Name]', inv.customerName)
                                .replace('[InvoiceNumber]', inv.invoiceNumber)
                                .replace('[Amount]', formatCurrency(inv.amount, currency))
                                .replace('[DueDate]', inv.dueDate);
                              copyToClipboard(script, inv.id);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp Notice</span>
                          </button>

                          <button
                            onClick={() => showToast(`Payment reminder email sent for ${inv.invoiceNumber}.`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                          >
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE & SOFTWARE WASTE */}
      {activeTab === 'cost-leaks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Leak 1: Inactive SaaS Software Seats */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    RECURRING SOFTWARE BLOAT
                  </span>
                  <span className="text-xs font-bold text-rose-600 font-mono-numeric">
                    -₹8,16,000 / year
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Unused Apollo & ZoomInfo Seats
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  6 out of 14 enterprise prospecting seats have had zero login activity over the last 45 days. Current monthly burn is <strong>₹68,000/mo</strong>.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="text-slate-500">Immediate Action:</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    Downgrade from 14 seats to 8 seats at the next billing cycle.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Annual Savings: ₹8.16L</span>
                <button
                  onClick={() => showToast('Subscription downgrade requested for 6 inactive seats.')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Downgrade Seats
                </button>
              </div>
            </div>

            {/* Leak 2: AWS Cloud Compute Anomaly */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    INFRASTRUCTURE SPIKE (+29%)
                  </span>
                  <span className="text-xs font-bold text-amber-700 font-mono-numeric">
                    +₹32,000 / month
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Unindexed Vector Database Clusters
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  AWS compute costs jumped from ₹1.10L to ₹1.42L this month due to temporary test clusters that remained running in the staging environment.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="text-slate-500">Immediate Action:</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    Deprovision unused staging clusters and set up auto-shutdown scripts.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Monthly Savings: ₹32,000</span>
                <button
                  onClick={() => showToast('Engineering ticket created to shut down idle staging clusters.')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Optimize AWS Cluster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOVERY SCRIPTS & EXECUTIVE TEMPLATES */}
      {activeTab === 'scripts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scripts.map((sc) => (
              <div
                key={sc.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {sc.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-3 mb-2">
                    {sc.title}
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {sc.text}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => copyToClipboard(sc.text, sc.id)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    {copiedScriptId === sc.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Script Template</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
