import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  HeartHandshake,
  DollarSign,
  ArrowRight,
  Search,
  Plus,
  Flame,
  CheckCircle2,
  Phone,
  Mail,
  Sparkles,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerSegment } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const CustomersView: React.FC = () => {
  const { customers, currency, addCustomer, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'at-risk' | 'vip' | 'upsell'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custMRR, setCustMRR] = useState('85000');
  const [custProduct, setCustProduct] = useState('Enterprise Growth Engine (SaaS)');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Metrics
  const totalCustomers = customers.length;
  const totalMRR = customers.reduce((sum, c) => sum + c.monthlyRecurring, 0);
  const avgLTV = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / totalCustomers : 0;
  const atRiskCustomers = customers.filter((c) => c.churnRiskScore >= 50);
  const vipCustomers = customers.filter((c) => c.segment === 'VIP' || c.segment === 'High Value');
  const expansionCandidates = customers.filter((c) => c.nextPurchaseProbability >= 60);

  const filteredCustomers = customers.filter((c) => {
    if (activeTab === 'at-risk' && c.churnRiskScore < 50) return false;
    if (activeTab === 'vip' && c.segment !== 'VIP' && c.segment !== 'High Value') return false;
    if (activeTab === 'upsell' && c.nextPurchaseProbability < 60) return false;

    if (segmentFilter !== 'ALL' && c.segment !== segmentFilter) return false;

    if (searchTerm) {
      const match =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custCompany || !custName) return;

    const mrr = Number(custMRR) || 45000;
    addCustomer({
      name: custName,
      company: custCompany,
      phone: custPhone || '+91 98100 00000',
      email: custEmail || 'client@company.com',
      industry: 'Enterprise Technology',
      location: 'India',
      productsPurchased: [custProduct],
      totalRevenue: mrr * 6,
      monthlyRecurring: mrr,
      firstPurchaseDate: new Date().toISOString().split('T')[0],
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      nextPurchaseProbability: 75,
      lifetimeValue: mrr * 24,
      status: 'Active',
      segment: mrr >= 150000 ? 'VIP' : 'Regular',
      churnRiskScore: 12,
      unpaidBalance: 0,
      assignedAccountManager: 'Vikram Mehta',
    });

    setIsAddCustomerOpen(false);
    setCustName('');
    setCustCompany('');
    setCustPhone('');
    setCustEmail('');
    showToast(`Customer account "${custCompany}" created.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Customer Intelligence & Retention
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              1.4% Monthly Churn Rate
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Predictive churn risk monitoring, VIP tier management, expansion & upsell opportunities, and executive touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Customer Account</span>
          </button>

          <button
            onClick={() => setActiveView('opportunities')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            Upsell Opportunities
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Active Accounts</div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">{totalCustomers}</div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">100% retained MTD</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-800">Total MRR</div>
          <div className="text-xl font-black text-indigo-900 font-mono-numeric mt-1">
            {formatCurrency(totalMRR, currency)}
          </div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1">Recurring revenue</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800">Average LTV</div>
          <div className="text-xl font-black text-emerald-900 font-mono-numeric mt-1">
            {formatCurrency(avgLTV, currency)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">Per active client</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-800">VIP / High-Value</div>
          <div className="text-2xl font-black text-purple-900 font-mono-numeric mt-1">{vipCustomers.length}</div>
          <div className="text-[10px] text-purple-700 font-medium mt-1">Generate 68% of rev</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            At-Risk Accounts
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono-numeric mt-1">{atRiskCustomers.length}</div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">₹2.35L/mo exposure</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800">Expansion Ready</div>
          <div className="text-2xl font-black text-amber-900 font-mono-numeric mt-1">{expansionCandidates.length}</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">&gt;60% upgrade prob</div>
        </div>
      </div>

      {/* Main Content Table & Subtabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Customer Accounts', badge: `${customers.length}` },
              { id: 'at-risk', label: '⚠️ At-Risk Accounts', badge: `${atRiskCustomers.length}` },
              { id: 'vip', label: '⭐ VIP & High Value', badge: `${vipCustomers.length}` },
              { id: 'upsell', label: '🚀 Expansion Candidates', badge: `${expansionCandidates.length}` },
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

          <div className="flex items-center gap-3">
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Segments</option>
              <option value="VIP">VIP</option>
              <option value="High Value">High Value</option>
              <option value="Regular">Regular</option>
              <option value="At Risk">At Risk</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search clients, industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-3">Company & Contact</th>
                <th className="py-3 px-3">Segment</th>
                <th className="py-3 px-3">Monthly MRR</th>
                <th className="py-3 px-3">Lifetime Value</th>
                <th className="py-3 px-3">Churn Risk Score</th>
                <th className="py-3 px-3">Unpaid Balance</th>
                <th className="py-3 px-3 text-right">Executive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {filteredCustomers.map((c) => {
                const isHighRisk = c.churnRiskScore >= 50;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-sans">
                      <div className="font-bold text-slate-900">{c.company}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.name} • {c.location}
                      </div>
                      {c.notes && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {c.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          c.segment === 'VIP'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : c.segment === 'High Value'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : c.segment === 'At Risk'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {c.segment}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {formatCurrency(c.monthlyRecurring, currency)}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {formatCurrency(c.lifetimeValue, currency)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isHighRisk
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.churnRiskScore}% Churn Risk
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {c.unpaidBalance > 0 ? (
                        <span className="font-bold text-rose-600">
                          {formatCurrency(c.unpaidBalance, currency)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-sans text-[11px] font-semibold">Cleared ✓</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {isHighRisk ? (
                          <button
                            onClick={() => {
                              showToast(`CEO Touchpoint initiated for ${c.company}. Account manager notified.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>CEO Check-in</span>
                          </button>
                        ) : c.nextPurchaseProbability >= 60 ? (
                          <button
                            onClick={() => {
                              showToast(`Upsell pitch for AI Optimizer sent to ${c.company}.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Pitch Upgrade</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              showToast(`Scheduled quarterly review with ${c.company}.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Customer Account</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Executive Contact *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaurav Aggarwal"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98100 XXXXX"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly MRR (₹)</label>
                  <input
                    type="number"
                    value={custMRR}
                    onChange={(e) => setCustMRR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono-numeric focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
