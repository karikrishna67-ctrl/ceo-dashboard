import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Building,
  DollarSign,
  ArrowRight,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadTemperature, LeadStatus } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const LeadsView: React.FC = () => {
  const { leads, currency, updateLeadStatus, addLead, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'follow-ups' | 'lost'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [selectedLeadForAction, setSelectedLeadForAction] = useState<Lead | null>(null);
  const [actionType, setActionType] = useState<'call' | 'whatsapp' | 'meeting' | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadSource, setNewLeadSource] = useState('Google Ads');
  const [newLeadValue, setNewLeadValue] = useState('250000');
  const [newLeadIndustry, setNewLeadIndustry] = useState('B2B Services');

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Metrics
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.temperature === 'hot');
  const warmLeads = leads.filter((l) => l.temperature === 'warm');
  const coldLeads = leads.filter((l) => l.temperature === 'cold');
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const lostLeads = leads.filter((l) => l.status === 'Lost');
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0';

  // Leads with followups due or stalled
  const followUpLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === 'hot' && lead.temperature !== 'hot') return false;
    if (activeTab === 'follow-ups' && (lead.status === 'Won' || lead.status === 'Lost')) return false;
    if (activeTab === 'lost' && lead.status !== 'Lost') return false;

    if (channelFilter !== 'ALL' && lead.source !== channelFilter) return false;

    if (searchTerm) {
      const match =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    const val = Number(newLeadValue) || 150000;
    // Calculate AI Lead score heuristically
    const calculatedScore = val > 400000 ? 92 : val > 200000 ? 78 : 62;
    const temp: LeadTemperature = calculatedScore >= 80 ? 'hot' : calculatedScore >= 55 ? 'warm' : 'cold';

    addLead({
      name: newLeadName,
      company: newLeadCompany,
      phone: newLeadPhone || '+91 98765 00000',
      email: newLeadEmail || 'contact@company.com',
      source: newLeadSource,
      industry: newLeadIndustry,
      location: 'India',
      leadScore: calculatedScore,
      temperature: temp,
      status: 'New',
      assignedSalesperson: 'Vikram Mehta',
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowupDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      estimatedValue: val,
      dealProbability: temp === 'hot' ? 70 : 35,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          description: 'Lead captured via command center interface.',
          date: new Date().toISOString().split('T')[0],
          createdBy: 'Rajesh Sharma',
        },
      ],
    });

    setIsAddLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    showNotification(`New lead "${newLeadCompany}" added with AI Lead Score ${calculatedScore}/100.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Lead Intelligence & AI Scoring
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {leads.length} Inbound Leads
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time lead scoring (0-100), response time SLA monitoring, follow-up recovery, and 1-click sales triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Lead</span>
          </button>

          <button
            onClick={() => setActiveView('sales-crm')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            View Sales Pipeline
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Leads</div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">{totalLeads}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">+18% vs last month</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            Hot Leads (Score &ge; 80)
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono-numeric mt-1">{hotLeads.length}</div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">High conversion intent</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800">Warm Leads</div>
          <div className="text-2xl font-black text-amber-900 font-mono-numeric mt-1">{warmLeads.length}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">Nurturing in progress</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Cold Leads</div>
          <div className="text-2xl font-black text-slate-700 font-mono-numeric mt-1">{coldLeads.length}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">Low engagement</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800">Won Conversion</div>
          <div className="text-2xl font-black text-emerald-900 font-mono-numeric mt-1">{conversionRate}%</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">{wonLeads.length} Closed Won</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-800">Avg Lead Value</div>
          <div className="text-xl font-black text-indigo-900 font-mono-numeric mt-1">
            {formatCurrency(315000, currency)}
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1">Qualified pipeline</div>
        </div>
      </div>

      {/* Subtabs & Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Subtabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Inbound Leads', badge: `${leads.length}` },
              { id: 'hot', label: '🔥 Hot Deals', badge: `${hotLeads.length}` },
              { id: 'follow-ups', label: '⏰ Follow-up Recovery', badge: `${followUpLeads.length}` },
              { id: 'lost', label: 'Lost Lead Audit', badge: `${lostLeads.length}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    activeTab === tab.id ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Channel Filter */}
          <div className="flex items-center gap-3">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="ALL">All Sources</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Referral">Referral</option>
              <option value="Organic">Organic</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-3">Lead / Company</th>
                <th className="py-3 px-3">AI Lead Score</th>
                <th className="py-3 px-3">Est. Value</th>
                <th className="py-3 px-3">Stage / Status</th>
                <th className="py-3 px-3">Channel Origin</th>
                <th className="py-3 px-3">Next Follow-Up</th>
                <th className="py-3 px-3 text-right">Instant CEO Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {filteredLeads.map((lead) => {
                const isHot = lead.temperature === 'hot';
                const isWarm = lead.temperature === 'warm';

                return (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-sans">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{lead.company}</span>
                        {isHot && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lead.name} • {lead.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isHot
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isWarm
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {lead.leadScore} / 100
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {lead.dealProbability}% win prob
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {formatCurrency(lead.estimatedValue, currency)}
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                          lead.status === 'Won'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : lead.status === 'Lost'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : lead.status === 'Negotiation'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : lead.status === 'Proposal'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Appointment">Appointment</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Closed Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {lead.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {lead.nextFollowupDate ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{lead.nextFollowupDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            showNotification(`Initiated direct call with ${lead.name} (${lead.phone}).`);
                          }}
                          title="Call Lead Now"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            showNotification(`WhatsApp follow-up template generated for ${lead.name}.`);
                          }}
                          title="Send WhatsApp Follow-up"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            updateLeadStatus(lead.id, 'Proposal');
                            showNotification(`Proposal dispatched to ${lead.company}.`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Proposal
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Add & Score Inbound Lead
              </h3>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Logistics"
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditya Singhania"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98201 XXXXX"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referral">Referral</option>
                    <option value="Organic">Organic Inbound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Est. Deal Value (₹)</label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono-numeric focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save & Score Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
