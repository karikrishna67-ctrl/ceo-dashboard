import React, { useState } from 'react';
import {
  PieChart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const FinanceView: React.FC = () => {
  const { kpiSnapshot, invoices, currency, updateInvoiceStatus, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'PL' | 'RECEIVABLES' | 'MARGINS'>('RECEIVABLES');

  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Finance, P&L & Receivables
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {overdueInvoices.length} Overdue Accounts
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Accounts receivable aging, automated recovery dispatch, P&L structure, and gross margin protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('reports')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Export Board P&L Report
          </button>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Gross Margin</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            82.0%
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">{formatCurrency(kpiSnapshot.grossProfit, currency)} Gross Profit</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Net Profit Margin (EBITDA)</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            22.4%
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">{formatCurrency(kpiSnapshot.netProfit, currency)} Net EBITDA</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Trapped Receivables</span>
          <div className="text-2xl font-black text-rose-600 font-mono-numeric mt-1">
            {formatCurrency(kpiSnapshot.overdueReceivables, currency)}
          </div>
          <div className="text-xs text-rose-600 mt-1 font-medium">4 overdue customer invoices</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cash Runway Stability</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1">
            12.0 mos
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">{formatCurrency(kpiSnapshot.cashBalance, currency)} Bank Reserves</div>
        </div>
      </div>

      {/* Receivables & Invoices Ledger */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Cash Leak Recovery
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Live Invoices & Aging Receivables Ledger
            </h2>
          </div>
          <span className="text-xs text-slate-400">Tally & Zoho Live Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer Account</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-numeric">
              {invoices.map((inv) => {
                const isOverdue = inv.status === 'Overdue';
                const isPaid = inv.status === 'Paid';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-3 font-sans">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {formatCurrency(inv.amount, currency)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-sans text-xs">{inv.dueDate}</td>
                    <td className="py-3.5 px-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isOverdue
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans">
                      {isOverdue && (
                        <button
                          onClick={() => {
                            alert(`Automated WhatsApp payment link dispatched to ${inv.customerName}!`);
                            updateInvoiceStatus(inv.id, 'Paid');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Notice</span>
                        </button>
                      )}
                      {!isOverdue && !isPaid && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          Mark Paid
                        </button>
                      )}
                      {isPaid && <span className="text-emerald-700 font-semibold text-xs">Settled ✓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
