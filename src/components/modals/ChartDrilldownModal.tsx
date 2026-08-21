import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Download,
  Filter,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building,
  TrendingUp,
  Tag,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DrilldownContextData, DrilldownTransactionItem } from '../../utils/chartDrilldownData';
import { formatCurrency } from '../../lib/formatters';
import { CopyTableButton } from '../common/CopyTableButton';
import { useApp } from '../../context/AppContext';

export interface ChartDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrilldownContextData | null;
}

export const ChartDrilldownModal: React.FC<ChartDrilldownModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Reset filter when data changes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setStatusFilter('ALL');
    }
  }, [isOpen, data?.pointName]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const {
    chartTitle,
    pointName,
    periodLabel,
    metricFormatted,
    category,
    description,
    currency,
    items,
    summaryStats,
  } = data;

  // Filter items based on search and status
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && item.statusType === 'success') ||
      (statusFilter === 'WARNING' && item.statusType === 'warning') ||
      (statusFilter === 'DANGER' && item.statusType === 'danger');

    return matchesSearch && matchesStatus;
  });

  const totalFilteredAmount = filteredItems.reduce((acc, curr) => acc + curr.amount, 0);

  // CSV Export for Granular Line Items
  const handleExportCSV = () => {
    try {
      const headers = ['Transaction ID', 'Date', 'Item Description', 'Counterparty', 'Category', 'Department', 'Assigned Owner', 'Status', 'Amount', 'Currency', 'Notes'];
      const rows = filteredItems.map((item) => [
        item.id,
        item.date,
        item.title,
        item.counterparty,
        item.category,
        item.department,
        item.owner,
        item.status,
        item.amount.toString(),
        currency,
        item.notes || '',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `Drilldown_${pointName.replace(/[^a-zA-Z0-9]/g, '_')}_Transactions.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(`Exported ${filteredItems.length} transactions to CSV`, 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      addToast('Failed to export CSV file', 'error');
    }
  };

  const getStatusBadgeClass = (type: DrilldownTransactionItem['statusType']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drilldown-modal-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0 border-b border-slate-800">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded border border-amber-700/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Interactive Chart Drill-Down</span>
                </span>
                <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {periodLabel}
                </span>
              </div>
              <h2 id="drilldown-modal-title" className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{chartTitle}</span>
                <span className="text-slate-400 text-base font-normal">({pointName})</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close transaction drill-down modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric Highlights & Summary Strip */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Aggregate Point Value</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono-numeric mt-0.5">
                {metricFormatted}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Contributing Transactions</div>
              <div className="text-base sm:text-lg font-black text-indigo-600 font-mono-numeric mt-0.5">
                {summaryStats.totalCount} Line-Items
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Average Transaction Size</div>
              <div className="text-base sm:text-lg font-black text-slate-800 font-mono-numeric mt-0.5">
                {formatCurrency(summaryStats.avgValue, currency)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Primary Contributor</div>
              <div className="text-xs sm:text-sm font-black text-emerald-700 truncate mt-0.5" title={summaryStats.topCategory}>
                {summaryStats.topCategory}
              </div>
            </div>
          </div>

          {/* Executive Insights / Actionable Takeaway Banner */}
          {summaryStats.actionableTakeaway && (
            <div className="bg-amber-50/90 border-b border-amber-200/80 px-5 sm:px-6 py-2.5 flex items-start gap-2 text-xs text-amber-900 shrink-0">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="font-bold">Executive Diagnostic Takeaway:</strong>{' '}
                <span>{summaryStats.actionableTakeaway}</span>
              </div>
            </div>
          )}

          {/* Search, Status Filter & Export Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions, customer names, categories, or owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'SUCCESS', label: 'Reconciled / Won' },
                  { id: 'WARNING', label: 'Pending' },
                  { id: 'DANGER', label: 'Flagged / Overdue' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Copy Table For Email Button */}
              <CopyTableButton
                id="drilldown-copy-email-btn"
                options={{
                  title: `${chartTitle} — ${pointName} Granular Transactions`,
                  subtitle: `Detailed transaction audit contributing to ${metricFormatted} (${periodLabel})`,
                  periodLabel,
                  filteredCategory: statusFilter === 'ALL' ? 'All Transactions' : `${statusFilter} Status`,
                  columns: [
                    { header: 'ID', key: 'id', align: 'left' },
                    { header: 'Date', key: 'date', align: 'left' },
                    { header: 'Description / Item', key: 'title', align: 'left' },
                    { header: 'Counterparty', key: 'counterparty', align: 'left' },
                    { header: 'Category', key: 'category', align: 'left' },
                    { header: 'Owner', key: 'owner', align: 'left' },
                    { header: 'Status', key: 'status', align: 'center' },
                    { header: 'Amount', key: 'amount', align: 'right' },
                  ],
                  rows: filteredItems.map((item) => ({
                    id: item.id,
                    date: item.date,
                    title: item.title,
                    counterparty: item.counterparty,
                    category: item.category,
                    owner: item.owner,
                    status: item.status,
                    amount: formatCurrency(item.amount, currency),
                  })),
                  highlights: [
                    `Drilldown Value: ${metricFormatted} across ${filteredItems.length} transactions.`,
                    summaryStats.actionableTakeaway,
                  ],
                  footerNote: 'AI Studio Executive Financial Intelligence Drill-Down Audit',
                }}
                label="Copy for Email"
                size="sm"
              />

              {/* Export to CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
                title="Download granular transactions as CSV file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Granular Transactions Table (Scrollable Body) */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>
                Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> verified ledger line-items
              </span>
              <span className="font-mono-numeric font-bold text-slate-800">
                Filtered Subtotal: {formatCurrency(totalFilteredAmount, currency)}
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No transactions match your filter</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting 'All Items'.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5">Ref / Date</th>
                      <th className="py-3 px-3.5">Transaction & Entity</th>
                      <th className="py-3 px-3.5">Category & Dept</th>
                      <th className="py-3 px-3.5">Assigned Owner</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-right">Value Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-mono text-[11px] font-bold text-slate-700">{item.id}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{item.date}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">{item.counterparty}</span>
                            {item.notes && <span className="text-slate-400">• {item.notes}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{item.category}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.department}</div>
                        </td>

                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="text-slate-700 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.owner}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadgeClass(
                              item.statusType
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="font-black text-slate-900 font-mono-numeric text-xs sm:text-sm">
                            {formatCurrency(item.amount, currency)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Granular transaction ledger verified against active financial model & bank balance.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-2xs self-end sm:self-auto"
            >
              Close Drill-Down
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
