import React, { useState } from 'react';
import {
  Receipt,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  PieChart,
  CheckCircle2,
  Filter,
  Plus,
  Zap,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const ExpensesView: React.FC = () => {
  const { expenses, currency, addExpense, setActiveView } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'anomalies' | 'software' | 'marketing'>('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Software');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState('45000');
  const [expDepartment, setExpDepartment] = useState('Engineering');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const anomalies = expenses.filter((e) => e.isAnomaly);
  const totalAnomalyAmount = anomalies.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    if (activeTab === 'anomalies' && !e.isAnomaly) return false;
    if (activeTab === 'software' && e.category !== 'Software') return false;
    if (activeTab === 'marketing' && e.category !== 'Marketing') return false;

    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expVendor) return;

    const amt = Number(expAmount) || 25000;
    addExpense({
      title: expTitle,
      category: expCategory,
      vendor: expVendor,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Corporate Card',
      department: expDepartment,
      isRecurring: true,
      budgetAllocated: amt * 1.1,
      status: 'Approved',
    });

    setIsAddExpenseOpen(false);
    setExpTitle('');
    setExpVendor('');
    showToast(`Logged expense "${expTitle}" for ${formatCurrency(amt, currency)}.`);
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
              Operating Expenses & Cost Savings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {formatCurrency(totalSpend, currency)} Total OPEX
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Department budget tracking, SaaS bloat reduction, cloud infrastructure leak detection, and vendor audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setActiveView('revenue-leakage')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          >
            Leakage Breakdown
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Monthly Spend</div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            {formatCurrency(totalSpend, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Budget: ₹24.5L (Under budget)</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Anomalous / Waste Spend
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono-numeric mt-1">
            {formatCurrency(totalAnomalyAmount, currency)}
          </div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">2 flagged items</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800">Actionable Cost Savings</div>
          <div className="text-2xl font-black text-emerald-900 font-mono-numeric mt-1">
            {formatCurrency(100000, currency)}
            <span className="text-xs text-emerald-700 font-normal"> / mo</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">₹12.0L annualized</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-800">Payroll vs OPEX Ratio</div>
          <div className="text-2xl font-black text-indigo-900 font-mono-numeric mt-1">65.8%</div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1">Healthy tech benchmark</div>
        </div>
      </div>

      {/* Anomalies Highlight Box */}
      {anomalies.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Active Expense Leaks & Software Bloat Flags
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => (
              <div key={anom.id} className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{anom.title}</span>
                    <span className="text-rose-600 font-mono-numeric">{formatCurrency(anom.amount, currency)}</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{anom.anomalyReason}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Vendor: {anom.vendor}</span>
                  <button
                    onClick={() => showToast(`Executed cost reduction workflow for ${anom.title}.`)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Fix Leak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Expenses Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Expenses' },
              { id: 'anomalies', label: '⚠️ Anomalies / Leaks' },
              { id: 'software', label: '💻 Software / SaaS' },
              { id: 'marketing', label: '📣 Marketing Spend' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Payroll">Payroll</option>
            <option value="Marketing">Marketing</option>
            <option value="Software">Software</option>
            <option value="Rent">Rent</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-3">Expense Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Vendor / Account</th>
                <th className="py-3 px-3">Monthly Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-sans">
                    <div className="font-bold text-slate-900">{exp.title}</div>
                    <div className="text-[11px] text-slate-500">Dept: {exp.department}</div>
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-sans text-slate-700">{exp.vendor}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">
                    {formatCurrency(exp.amount, currency)}
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    {exp.isAnomaly ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Anomaly Flagged
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px]">Normal</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-sans">
                    <button
                      onClick={() => showToast(`Audit details opened for ${exp.vendor}.`)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Figma Enterprise Organization License"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="Software">Software / SaaS</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Rent">Rent & Facility</option>
                    <option value="Operations">Operations</option>
                    <option value="Travel">Travel & Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Amount (₹)</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono-numeric focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vendor / Payee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Figma Inc."
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
