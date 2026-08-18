import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DataImportModal: React.FC = () => {
  const { isDataImportOpen, setIsDataImportOpen, importData } = useApp();
  const [dataType, setDataType] = useState<'leads' | 'customers' | 'expenses' | 'invoices'>('leads');
  const [rawText, setRawText] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  if (!isDataImportOpen) return null;

  const handleSampleLoad = () => {
    if (dataType === 'leads') {
      setRawText(
        JSON.stringify(
          [
            { name: 'Kavita Menon', company: 'Zenith Logistics', email: 'kavita@zenith.com', leadScore: 88, estimatedValue: 350000, status: 'Qualified' },
            { name: 'Sameer Joshi', company: 'Nova Healthcare', email: 'sameer@novahealth.in', leadScore: 74, estimatedValue: 220000, status: 'Proposal Sent' },
          ],
          null,
          2
        )
      );
    } else if (dataType === 'customers') {
      setRawText(
        JSON.stringify(
          [
            { name: 'Anil Kapoor', company: 'Apex Cloud Solutions', totalRevenue: 850000, monthlyRecurring: 65000, lifetimeValue: 2100000 },
          ],
          null,
          2
        )
      );
    }
  };

  const handleProcessImport = () => {
    try {
      let records: any[] = [];
      if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
        const parsed = JSON.parse(rawText);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Simple CSV parse
        const lines = rawText.trim().split('\n');
        const headers = lines[0].split(',').map((h) => h.trim());
        records = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = vals[idx];
          });
          return obj;
        });
      }

      const res = importData(dataType, records);
      setImportResult(res);
      setTimeout(() => {
        setIsDataImportOpen(false);
        setImportResult(null);
        setRawText('');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to parse data format. Please provide valid JSON or CSV.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">CSV & JSON Data Ingestion</h2>
              <p className="text-xs text-slate-500">Bulk upload business datasets into live metrics</p>
            </div>
          </div>

          <button
            onClick={() => setIsDataImportOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Target Data Collection</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['leads', 'customers', 'expenses', 'invoices'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDataType(t)}
                  className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                    dataType === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Paste JSON or CSV Data</label>
              <button
                onClick={handleSampleLoad}
                className="text-[11px] text-amber-700 font-bold hover:underline"
              >
                Load Sample Template
              </button>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder='[{"name": "Client Name", "company": "Company Ltd", "estimatedValue": 250000}]'
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {importResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Successfully ingested {importResult.success} records into {dataType}!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsDataImportOpen(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessImport}
            disabled={!rawText.trim()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Process Ingestion</span>
          </button>
        </div>
      </div>
    </div>
  );
};
