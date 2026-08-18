import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'Accounting' | 'Payment Gateway' | 'CRM & Leads' | 'Marketing' | 'Communication';
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  lastSync: string;
  description: string;
  recordsSynced: string;
}

export const IntegrationsView: React.FC = () => {
  const { currentOrg } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'tally',
      name: 'Tally Prime / ERP',
      category: 'Accounting',
      status: 'CONNECTED',
      lastSync: '10 mins ago',
      description: 'Auto-syncs vouchers, sales invoices, ledger balances, and GST returns.',
      recordsSynced: '1,420 Invoices & Vouchers',
    },
    {
      id: 'zoho',
      name: 'Zoho Books',
      category: 'Accounting',
      status: 'CONNECTED',
      lastSync: '15 mins ago',
      description: 'Live sync for accounts receivable, billable expenses, and vendor balances.',
      recordsSynced: '42 Active Accounts',
    },
    {
      id: 'razorpay',
      name: 'Razorpay Payment Gateway',
      category: 'Payment Gateway',
      status: 'CONNECTED',
      lastSync: 'Just now',
      description: 'Instant settlement tracking, recurring subscriptions, and payment links.',
      recordsSynced: '₹38.5L Settled Volume',
    },
    {
      id: 'stripe',
      name: 'Stripe Global Payments',
      category: 'Payment Gateway',
      status: 'CONNECTED',
      lastSync: '1 hour ago',
      description: 'Cross-border USD/EUR customer billing, MRR webhooks, and invoice payouts.',
      recordsSynced: '$14,200 Processed',
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM & Leads',
      status: 'CONNECTED',
      lastSync: '4 mins ago',
      description: 'Two-way lead sync, pipeline deal stages, and rep activity tracking.',
      recordsSynced: '84 Active Pipeline Deals',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API (Meta)',
      category: 'Communication',
      status: 'CONNECTED',
      lastSync: 'Real-time Webhook',
      description: 'Inbound lead capture, automated quote delivery, and invoice reminder bot.',
      recordsSynced: '640 Active Conversations',
    },
    {
      id: 'google-ads',
      name: 'Google Ads Intent API',
      category: 'Marketing',
      status: 'CONNECTED',
      lastSync: '30 mins ago',
      description: 'Real-time CPC, search conversion tracking, and blended ROAS analytics.',
      recordsSynced: '24 Tracked Keywords',
    },
    {
      id: 'meta-ads',
      name: 'Meta Ads Manager',
      category: 'Marketing',
      status: 'CONNECTED',
      lastSync: '45 mins ago',
      description: 'Instagram/Facebook retargeting spend, CTR, and blended lead acquisition cost.',
      recordsSynced: '3 Active Ad Campaigns',
    },
  ]);

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const triggerSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, lastSync: 'Just now', status: 'CONNECTED' } : item
        )
      );
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Enterprise Integrations Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              8 Systems Live
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time automated data pipelines syncing accounting, CRM, payment gateways, and ad channels into the CEO Command Center.
          </p>
        </div>

        <button
          onClick={() => {
            setSyncingId('ALL');
            setTimeout(() => {
              setIntegrations((prev) =>
                prev.map((item) => ({ ...item, lastSync: 'Just now', status: 'CONNECTED' }))
              );
              setSyncingId(null);
            }, 1500);
          }}
          disabled={syncingId !== null}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncingId !== null ? 'animate-spin' : ''}`} />
          <span>{syncingId === 'ALL' ? 'Syncing All Data...' : 'Sync All Integrations'}</span>
        </button>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isSyncing = syncingId === item.id || syncingId === 'ALL';

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                  <span className="text-slate-500">Synced Volume: </span>
                  <strong className="text-slate-900">{item.recordsSynced}</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Sync: {item.lastSync}</span>
                <button
                  onClick={() => triggerSync(item.id)}
                  disabled={isSyncing}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
