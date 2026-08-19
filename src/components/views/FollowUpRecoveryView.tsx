import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  Mail,
  Sparkles,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  User,
  Calendar,
  Send,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';
import { Lead, Customer, Invoice } from '../../types';

export const FollowUpRecoveryView: React.FC = () => {
  const { leads, customers, invoices, currency, updateLeadStatus } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'missed' | 'proposals' | 'uncontacted' | 'overdue' | 'dormant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'lead' | 'invoice' | 'customer';
    name: string;
    company: string;
    phone: string;
    email: string;
    amount: number;
    daysOverdue?: number;
    status: string;
    lastContact?: string;
  } | null>(null);

  // Message generation state
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [messageChannel, setMessageChannel] = useState<'whatsapp' | 'email' | 'call'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [actionDoneId, setActionDoneId] = useState<string | null>(null);

  // Calculate high-risk recovery buckets
  const missedFollowups = leads.filter(
    (l) => (l.status === 'Contacted' || l.status === 'Qualified' || l.status === 'Appointment') && l.leadScore >= 60
  );
  const pendingProposals = leads.filter((l) => l.status === 'Proposal' || l.status === 'Negotiation');
  const uncontactedHotLeads = leads.filter((l) => l.status === 'New' && l.leadScore >= 70);
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue' || (i.status === 'Unpaid' && (i.daysOverdue || 0) > 0));
  const dormantHighValueCustomers = customers.filter((c) => c.status === 'Inactive' || c.segment === 'At Risk');

  const totalMissedRevenue = missedFollowups.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const totalProposalRevenue = pendingProposals.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const totalOverdueRevenue = overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalAtRiskRevenue = totalMissedRevenue + totalProposalRevenue + totalOverdueRevenue;

  // Filter items
  const allRecoveryItems = [
    ...missedFollowups.map((l) => ({
      id: l.id,
      type: 'lead' as const,
      name: l.name,
      company: l.company,
      phone: l.phone,
      email: l.email,
      amount: l.estimatedValue,
      score: l.leadScore,
      temperature: l.temperature,
      status: `Missed Follow-up (${l.status})`,
      category: 'missed',
      reason: 'No contact recorded in 4+ days. Risk of deal cooling off.',
      lastContact: l.lastContactDate || '4 days ago',
      stage: l.status,
    })),
    ...pendingProposals.map((l) => ({
      id: l.id,
      type: 'lead' as const,
      name: l.name,
      company: l.company,
      phone: l.phone,
      email: l.email,
      amount: l.estimatedValue,
      score: l.leadScore,
      temperature: l.temperature,
      status: `Pending ${l.status}`,
      category: 'proposals',
      reason: 'Proposal sent over 5 days ago without active signoff.',
      lastContact: l.lastContactDate || '5 days ago',
      stage: l.status,
    })),
    ...uncontactedHotLeads.map((l) => ({
      id: l.id,
      type: 'lead' as const,
      name: l.name,
      company: l.company,
      phone: l.phone,
      email: l.email,
      amount: l.estimatedValue,
      score: l.leadScore,
      temperature: l.temperature,
      status: 'Uncontacted Hot Lead',
      category: 'uncontacted',
      reason: 'High purchase intent score (85+), waiting for 1st touchpoint.',
      lastContact: 'Never',
      stage: 'New',
    })),
    ...overdueInvoices.map((i) => ({
      id: i.id,
      type: 'invoice' as const,
      name: i.customerName,
      company: i.customerName,
      phone: '+91 98201 44512',
      email: 'finance@' + i.customerName.toLowerCase().replace(/[^a-z]/g, '') + '.com',
      amount: i.amount,
      score: 95,
      temperature: 'hot' as const,
      status: `Overdue Invoice (#${i.invoiceNumber})`,
      category: 'overdue',
      reason: `Payment is ${i.daysOverdue || 14} days past due date (${i.dueDate}).`,
      lastContact: 'Invoice issued',
      stage: 'Overdue',
    })),
    ...dormantHighValueCustomers.map((c) => ({
      id: c.id,
      type: 'customer' as const,
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      amount: c.monthlyRecurring ? c.monthlyRecurring * 12 : 250000,
      score: 80,
      temperature: 'warm' as const,
      status: `Dormant VIP (${c.segment})`,
      category: 'dormant',
      reason: 'No order in 90+ days. Prime candidate for loyalty reactivation.',
      lastContact: c.lastPurchaseDate || '92 days ago',
      stage: c.status,
    })),
  ];

  const filteredItems = allRecoveryItems.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleGenerateMessage = (item: typeof allRecoveryItems[0], channel: 'whatsapp' | 'email' | 'call') => {
    setSelectedItem(item);
    setMessageChannel(channel);

    let msg = '';
    if (item.category === 'overdue') {
      if (channel === 'whatsapp') {
        msg = `Hi ${item.name}, Rajesh here from AI CEO Command Center. Hope all is well! Just a quick gentle reminder regarding invoice #${item.status.match(/#[A-Z0-9-]+/)?.[0] || 'INV-2024'} for ${formatCurrency(item.amount, currency)}, which is currently past due. Could you kindly confirm if the accounts team has scheduled the transfer today? Let me know if you need the invoice resent or have questions!`;
      } else {
        msg = `Subject: Polite Payment Follow-up: Invoice #${item.status.match(/#[A-Z0-9-]+/)?.[0] || 'INV-2024'} - ${item.company}\n\nDear ${item.name},\n\nI hope you are having a productive week.\n\nOur accounts ledger indicates that invoice #${item.status.match(/#[A-Z0-9-]+/)?.[0] || 'INV-2024'} for ${formatCurrency(item.amount, currency)} is currently pending clearance. Could you kindly review and confirm the expected remittance schedule?\n\nIf you require an updated statement of account or bank remittance instructions, please reply to this email.\n\nWarm regards,\nRajesh Sharma\nCEO`;
      }
    } else if (item.category === 'proposals') {
      if (channel === 'whatsapp') {
        msg = `Hi ${item.name}! Checking in on the growth proposal we sent over for ${item.company}. We have allocated an executive implementation slot for your team this month. Would you be open to a 10-minute call today at 3:30 PM to finalize terms?`;
      } else {
        msg = `Subject: Executive Check-in: Strategic Proposal for ${item.company}\n\nHi ${item.name},\n\nFollowing up on our recent proposal discussion. We have reserved project rollout capacity to help ${item.company} meet its quarterly growth milestones.\n\nAre there any specific adjustments to scope, pricing, or milestone schedules you would like us to refine before we lock in the agreement?\n\nLet me know your availability for a brief 10-minute sync.\n\nBest regards,\nRajesh Sharma\nCEO`;
      }
    } else {
      if (channel === 'whatsapp') {
        msg = `Hi ${item.name}, thank you for reaching out regarding our revenue & growth solutions. I wanted to personally connect and offer a tailored 15-minute diagnostic session for ${item.company}. What time today works best for a quick chat?`;
      } else {
        msg = `Subject: Priority Consultation for ${item.company}\n\nHi ${item.name},\n\nThank you for your interest in our solutions. Given your focus on scaling revenue, I'd like to share an executive benchmark report specifically designed for companies in your industry.\n\nWould you have 15 minutes this Thursday or Friday for a high-level walkthrough?\n\nWarm regards,\nRajesh Sharma\nCEO`;
      }
    }

    setGeneratedMessage(msg);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Revenue Recovery Command</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Data → Insight → Impact → Action
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Follow-up & Revenue Recovery Center
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1">
                Recover lost revenue sitting in inactive proposals, missed lead follow-ups, and overdue invoices with 1-click AI outreach automation.
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-xl text-right min-w-[200px]">
              <div className="text-xs text-slate-400 font-medium">Estimated Revenue at Risk</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono-numeric mt-0.5">
                {formatCurrency(totalAtRiskRevenue, currency)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Across {allRecoveryItems.length} priority accounts
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Missed Follow-ups</div>
              <div className="text-lg font-black text-white font-mono-numeric">{missedFollowups.length} deals</div>
              <div className="text-[10px] text-amber-400">{formatCurrency(totalMissedRevenue, currency)} at risk</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Pending Proposals</div>
              <div className="text-lg font-black text-white font-mono-numeric">{pendingProposals.length} proposals</div>
              <div className="text-[10px] text-amber-400">{formatCurrency(totalProposalRevenue, currency)} pending</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Overdue Invoices</div>
              <div className="text-lg font-black text-white font-mono-numeric">{overdueInvoices.length} invoices</div>
              <div className="text-[10px] text-rose-400">{formatCurrency(totalOverdueRevenue, currency)} unpaid</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400">Uncontacted Hot Leads</div>
              <div className="text-lg font-black text-white font-mono-numeric">{uncontactedHotLeads.length} leads</div>
              <div className="text-[10px] text-emerald-400">Immediate action needed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Tabs & Recovery Queue */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts, contacts, or invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredItems.length} items queued
              </span>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Leaks', count: allRecoveryItems.length },
                { id: 'missed', label: 'Missed Follow-ups', count: missedFollowups.length },
                { id: 'proposals', label: 'Stalled Proposals', count: pendingProposals.length },
                { id: 'overdue', label: 'Overdue Cash', count: overdueInvoices.length },
                { id: 'uncontacted', label: 'Hot Leads (0 touch)', count: uncontactedHotLeads.length },
                { id: 'dormant', label: 'Dormant VIPs', count: dormantHighValueCustomers.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/50 text-slate-200">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recovery List */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleGenerateMessage(item, 'whatsapp')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedItem?.id === item.id
                    ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm truncate">{item.company}</span>
                      <span className="text-xs text-slate-500">({item.name})</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.reason}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Phone: <strong className="text-slate-700">{item.phone}</strong></span>
                      <span>Last contact: <strong className="text-slate-700">{item.lastContact}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900 font-mono-numeric">
                      {formatCurrency(item.amount, currency)}
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mt-0.5">
                      Potential Recovery
                    </span>
                  </div>
                </div>

                {/* Instant Action Triggers */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMessage(item, 'whatsapp');
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMessage(item, 'email');
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>Email Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateMessage(item, 'call');
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3 text-purple-600" />
                      <span>Call Script</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateMessage(item, 'whatsapp');
                    }}
                    className="text-xs text-amber-700 font-bold hover:text-amber-800 flex items-center gap-0.5"
                  >
                    <span>Generate AI Follow-up</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Outreach Generator & Action Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  AI CEO Outreach Studio
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                Instant Action
              </span>
            </div>

            {selectedItem ? (
              <div className="space-y-4">
                {/* Active Target Banner */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{selectedItem.company}</div>
                    <div className="text-[11px] text-slate-500">Contact: {selectedItem.name} ({selectedItem.phone})</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 font-mono-numeric">
                      {formatCurrency(selectedItem.amount, currency)}
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase">Target</span>
                  </div>
                </div>

                {/* Channel Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateMessage(selectedItem as any, 'whatsapp')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      messageChannel === 'whatsapp'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateMessage(selectedItem as any, 'email')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      messageChannel === 'email'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateMessage(selectedItem as any, 'call')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      messageChannel === 'call'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Phone Call</span>
                  </button>
                </div>

                {/* Generated Message Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Generated AI Message:</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2 pt-2">
                  {messageChannel === 'whatsapp' ? (
                    <button
                      type="button"
                      onClick={() => handleLaunchWhatsApp(selectedItem.phone, generatedMessage)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open WhatsApp with Message</span>
                    </button>
                  ) : messageChannel === 'email' ? (
                    <a
                      href={`mailto:${selectedItem.email}?subject=Follow-up%20re:%20${encodeURIComponent(selectedItem.company)}&body=${encodeURIComponent(generatedMessage)}`}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 text-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open Email Client</span>
                    </a>
                  ) : (
                    <a
                      href={`tel:${selectedItem.phone}`}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 text-center"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial Contact ({selectedItem.phone})</span>
                    </a>
                  )}

                  <p className="text-[10px] text-slate-400 text-center italic">
                    Outreach templates automatically calibrate tone based on contact history & transaction size.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">Select an Account to Recover</div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click any missed proposal, lead, or overdue invoice from the queue to generate executive WhatsApp & email outreach.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
