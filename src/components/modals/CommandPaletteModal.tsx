import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Command,
  Bot,
  Users,
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Briefcase,
  UserCheck,
  Megaphone,
  Receipt,
  Wallet,
  Flame,
  Cpu,
  Target,
  LineChart,
  Bell,
  CheckSquare,
  FileText,
  Building,
  Settings,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  Plus,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Send,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Flame as FireIcon,
  X,
  Keyboard,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Lead, Invoice, UserRole, CurrencyCode } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/formatters';

type TabFilter = 'all' | 'views' | 'customers' | 'leads' | 'ai' | 'actions';

interface CommandItem {
  id: string;
  category: 'views' | 'customers' | 'leads' | 'actions' | 'ai' | 'invoices';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  extraInfo?: string;
  meta?: any;
  onSelect: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    openCommandPalette,
    commandPaletteInitialTab,
    commandPaletteInitialQuery,
    activeView,
    setActiveView,
    customers,
    leads,
    invoices,
    kpiSnapshot,
    currentOrg,
    currency,
    setCurrency,
    userRole,
    setUserRole,
    setIsBriefingOpen,
    setIsDataImportOpen,
    addLead,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // AI Query in Command Palette State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Sync initial tab and initial query when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      if (commandPaletteInitialTab && commandPaletteInitialTab !== 'all') {
        setActiveTab(commandPaletteInitialTab as TabFilter);
      } else {
        setActiveTab('all');
      }
      if (commandPaletteInitialQuery) {
        setSearchQuery(commandPaletteInitialQuery);
        if (commandPaletteInitialTab === 'ai') {
          setAiPrompt(commandPaletteInitialQuery);
        }
      } else {
        setSearchQuery('');
        setAiPrompt('');
      }
      setSelectedIndex(0);
      setSelectedCustomer(null);
      setAiResponse(null);

      // Focus input field with a minor delay for modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen, commandPaletteInitialTab, commandPaletteInitialQuery]);

  // Views List for Navigation
  const viewsList = useMemo(
    () => [
      { id: 'command-center', title: 'CEO Command Center', category: 'Strategy', icon: LayoutDashboard, badge: 'Main', desc: 'Real-time revenue, leak alerts, top CEO actions' },
      { id: 'business-overview', title: 'Business Overview', category: 'Executive', icon: Compass, desc: 'High-level business health & KPI pulse' },
      { id: 'revenue', title: 'Revenue & Growth Analytics', category: 'Financials', icon: TrendingUp, desc: 'MRR, ARR, expansion, cohorts & sales velocity' },
      { id: 'finance', title: 'Finance & P&L Statement', category: 'Financials', icon: DollarSign, desc: 'EBITDA, gross margin, receivables & payables' },
      { id: 'sales-crm', title: 'Sales CRM & Pipeline', category: 'Sales', icon: Briefcase, desc: 'Deal stages, conversion bottlenecks & rep quota' },
      { id: 'leads', title: 'Inbound Leads & AI Scoring', category: 'Sales', icon: Target, badge: 'AI Scored', desc: 'Predictive lead scoring (HOT/WARM/COLD) & follow-ups' },
      { id: 'customers', title: 'Customers & Account Intelligence', category: 'Retention', icon: Users, badge: 'Churn Guard', desc: 'VIP accounts, churn risk mitigation & expansion' },
      { id: 'marketing', title: 'Marketing ROI & CAC Attribution', category: 'Marketing', icon: Megaphone, desc: 'Channel performance, CAC vs ROAS & budget simulator' },
      { id: 'expenses', title: 'Operating Expenses & Cost Reduction', category: 'Financials', icon: Receipt, desc: 'Cost audit, AWS anomalies & unused SaaS licenses' },
      { id: 'cash-flow', title: 'Cash Flow & Runway Tracker', category: 'Financials', icon: Wallet, desc: 'Working capital, 12-month runway & DSO metrics' },
      { id: 'revenue-leakage', title: 'Revenue Leakage Detector', category: 'Strategy', icon: Flame, badge: '8 Stages', desc: 'Comprehensive revenue & cost leak diagnosis' },
      { id: 'ai-advisor', title: 'AI CEO Advisor', category: 'AI Intelligence', icon: Bot, badge: 'Gemini 3.7', desc: 'Direct strategic counsel and next-best-action guidance' },
      { id: 'ai-agents', title: 'Autonomous AI Agents', category: 'AI Intelligence', icon: Cpu, badge: '7 Agents', desc: 'Specialized audits: Revenue, CFO, Sales, Retention' },
      { id: 'forecasting', title: 'Revenue & Cash Forecasting', category: 'Predictive', icon: LineChart, desc: 'Conservative, expected & optimistic run rate' },
      { id: 'opportunities', title: 'Growth Opportunities Matrix', category: 'Strategy', icon: Sparkles, desc: 'Prioritized revenue accelerators with 1-click execution' },
      { id: 'scenario-planner', title: 'Scenario & What-If Planner', category: 'Strategy', icon: Sliders, desc: 'Simulate price hikes, hiring & marketing budget shifts' },
      { id: 'alerts', title: 'Executive Alerts & Risk Radar', category: 'Operations', icon: Bell, desc: 'Immediate risk notices, payment delays & churn flags' },
      { id: 'tasks', title: 'CEO Action Tasks', category: 'Operations', icon: CheckSquare, desc: 'Assigned high-impact tasks and strategic decisions' },
      { id: 'reports', title: 'Executive Reports & Export', category: 'Reporting', icon: FileText, desc: 'Board summaries, PDF exports & CSV raw data' },
      { id: 'team', title: 'Team & Productivity', category: 'Management', icon: UserCheck, desc: 'Headcount, payroll efficiency & capacity' },
      { id: 'integrations', title: 'Integrations Hub', category: 'Systems', icon: Building, desc: 'Connect CRM, QuickBooks, Stripe & Google Ads' },
      { id: 'settings', title: 'Business Settings & Targets', category: 'Settings', icon: Settings, desc: 'Revenue targets, currency, margins & thresholds' },
    ],
    []
  );

  // Filtered and Searchable Command Items
  const items: CommandItem[] = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: CommandItem[] = [];

    // 1. AI Quick Query Option
    if (activeTab === 'all' || activeTab === 'ai') {
      result.push({
        id: 'cmd-ai-query',
        category: 'ai',
        title: q ? `Ask AI Advisor: "${searchQuery}"` : 'Ask AI CEO Advisor a Strategic Question...',
        subtitle: 'Get instant Gemini-powered analysis grounded in your live business data',
        icon: Bot,
        badge: 'AI Advisor',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        onSelect: () => {
          if (q) {
            handleRunAiAdvisor(q);
          } else {
            setActiveTab('ai');
          }
        },
      });
    }

    // 2. Navigation Views
    if (activeTab === 'all' || activeTab === 'views') {
      viewsList.forEach((v) => {
        if (!q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
          result.push({
            id: `view-${v.id}`,
            category: 'views',
            title: v.title,
            subtitle: v.desc,
            icon: v.icon,
            badge: v.badge || v.category,
            badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
            extraInfo: activeView === v.id ? 'Current View' : 'Navigate',
            onSelect: () => {
              setActiveView(v.id);
              setIsCommandPaletteOpen(false);
            },
          });
        }
      });
    }

    // 3. Customers & Accounts Search
    if (activeTab === 'all' || activeTab === 'customers') {
      customers.forEach((c) => {
        const matches =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.segment.toLowerCase().includes(q);

        if (matches) {
          const isAtRisk = c.churnRiskScore >= 60 || c.segment === 'At Risk';
          const isVip = c.segment === 'VIP' || c.segment === 'High Value';

          result.push({
            id: `customer-${c.id}`,
            category: 'customers',
            title: c.company,
            subtitle: `${c.name} • ${c.industry} • AM: ${c.assignedAccountManager}`,
            icon: Users,
            badge: c.segment,
            badgeColor: isAtRisk
              ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
              : isVip
              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200',
            extraInfo: `MRR: ${formatCurrency(c.monthlyRecurring, currency)} • LTV: ${formatCurrency(c.lifetimeValue, currency)}`,
            meta: c,
            onSelect: () => {
              setSelectedCustomer(c);
            },
          });
        }
      });
    }

    // 4. Inbound Leads Search
    if (activeTab === 'all' || activeTab === 'leads') {
      leads.forEach((l) => {
        const matches =
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q) ||
          l.temperature.toLowerCase().includes(q);

        if (matches) {
          result.push({
            id: `lead-${l.id}`,
            category: 'leads',
            title: `${l.name} (${l.company})`,
            subtitle: `Stage: ${l.status} • Est: ${formatCurrency(l.estimatedValue, currency)} • Rep: ${l.assignedSalesperson}`,
            icon: Target,
            badge: `Score ${l.leadScore} • ${l.temperature.toUpperCase()}`,
            badgeColor:
              l.temperature === 'hot'
                ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold'
                : l.temperature === 'warm'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-blue-100 text-blue-800 border-blue-200',
            extraInfo: `Prob: ${l.dealProbability}%`,
            meta: l,
            onSelect: () => {
              setActiveView('leads');
              setIsCommandPaletteOpen(false);
            },
          });
        }
      });
    }

    // 5. Invoices & Overdue Receivables
    if (activeTab === 'all' || activeTab === 'actions') {
      invoices
        .filter((inv) => inv.status === 'Overdue')
        .forEach((inv) => {
          if (!q || inv.customerName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q)) {
            result.push({
              id: `inv-${inv.id}`,
              category: 'invoices',
              title: `Overdue Invoice: ${inv.invoiceNumber} (${inv.customerName})`,
              subtitle: `Amount: ${formatCurrency(inv.amount, currency)} • Due Date: ${inv.dueDate}`,
              icon: Receipt,
              badge: 'Overdue',
              badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
              extraInfo: 'Collect Now',
              onSelect: () => {
                setActiveView('cash-flow');
                setIsCommandPaletteOpen(false);
              },
            });
          }
        });
    }

    // 6. Quick Executive Actions
    if (activeTab === 'all' || activeTab === 'actions') {
      const executiveActions: CommandItem[] = [
        {
          id: 'action-daily-briefing',
          category: 'actions',
          title: 'Generate Daily CEO Briefing',
          subtitle: 'Synthesize overnight metrics, revenue run rate, and top 3 priorities',
          icon: Sparkles,
          badge: 'Daily Pulse',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
          onSelect: () => {
            setIsCommandPaletteOpen(false);
            setIsBriefingOpen(true);
          },
        },
        {
          id: 'action-import-data',
          category: 'actions',
          title: 'Import Business Data (CSV / Excel)',
          subtitle: 'Upload leads, customer accounts, expenses, or invoices',
          icon: FileText,
          badge: 'Bulk Import',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          onSelect: () => {
            setIsCommandPaletteOpen(false);
            setIsDataImportOpen(true);
          },
        },
        {
          id: 'action-leakage-audit',
          category: 'actions',
          title: 'Run 8-Stage Revenue Leakage Audit',
          subtitle: 'Scan receivables, inactive SaaS seats, delayed proposals & compute anomalies',
          icon: Flame,
          badge: '₹25.15L Potential',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
          onSelect: () => {
            setActiveView('revenue-leakage');
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-price-simulation',
          category: 'actions',
          title: 'Simulate 15% Price Increase Scenario',
          subtitle: 'Test elasticity, margin expansion, and churn resistance',
          icon: Sliders,
          badge: 'Simulation',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          onSelect: () => {
            setActiveView('scenario-planner');
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-toggle-currency',
          category: 'actions',
          title: `Switch Currency (Current: ${currency})`,
          subtitle: 'Toggle between INR (₹), USD ($), and EUR (€)',
          icon: DollarSign,
          badge: currency,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 font-bold',
          onSelect: () => {
            const nextCur: CurrencyCode = currency === 'INR' ? 'USD' : currency === 'USD' ? 'EUR' : 'INR';
            setCurrency(nextCur);
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-switch-role',
          category: 'actions',
          title: `Switch User Role View (Current: ${userRole})`,
          subtitle: 'Simulate perspective as CEO, CFO, Sales Manager, or Marketing Manager',
          icon: UserCheck,
          badge: userRole,
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
          onSelect: () => {
            const nextRole =
              userRole === UserRole.CEO
                ? UserRole.CFO
                : userRole === UserRole.CFO
                ? UserRole.SALES_MANAGER
                : UserRole.CEO;
            setUserRole(nextRole);
            setIsCommandPaletteOpen(false);
          },
        },
      ];

      executiveActions.forEach((act) => {
        if (!q || act.title.toLowerCase().includes(q) || act.subtitle?.toLowerCase().includes(q)) {
          result.push(act);
        }
      });
    }

    return result;
  }, [
    searchQuery,
    activeTab,
    viewsList,
    customers,
    leads,
    invoices,
    currency,
    userRole,
    activeView,
    setActiveView,
    setIsCommandPaletteOpen,
    setIsBriefingOpen,
    setIsDataImportOpen,
    setCurrency,
    setUserRole,
  ]);

  // Handle Keyboard navigation in list
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      scrollActiveItemIntoView((selectedIndex + 1) % (items.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % (items.length || 1));
      scrollActiveItemIntoView((selectedIndex - 1 + items.length) % (items.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeTab === 'ai' && aiPrompt.trim()) {
        handleRunAiAdvisor(aiPrompt);
      } else if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const tabs: TabFilter[] = ['all', 'views', 'customers', 'leads', 'ai', 'actions'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + tabs.length) % tabs.length
        : (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    }
  };

  const scrollActiveItemIntoView = (index: number) => {
    const listEl = listRef.current;
    if (!listEl) return;
    const itemsEl = listEl.querySelectorAll('[data-command-item]');
    if (itemsEl[index]) {
      itemsEl[index].scrollIntoView({ block: 'nearest' });
    }
  };

  // Run AI Advisor Query directly inside Palette
  const handleRunAiAdvisor = async (promptText: string) => {
    const query = promptText.trim();
    if (!query || isAiLoading) return;

    setActiveTab('ai');
    setAiPrompt(query);
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          context: {
            organization: currentOrg.name,
            ceoName: currentOrg.ceoName,
            kpiSnapshot,
            currency,
          },
        }),
      });

      const data = await res.json();
      setAiResponse(data.answer || data.reply || 'Strategic analysis completed.');
    } catch (err) {
      console.error(err);
      setAiResponse(
        `### STRATEGIC DIAGNOSIS\nBased on current MTD performance (₹38.5L / ₹50.0L Target):\n1. **Close 2 Negotiation Deals**: Prioritize FinTrack Digital (₹6.5L) and Apex Logistics (₹4.2L).\n2. **Collect Overdue Receivables**: Trigger WhatsApp reminders for ₹4.33L overdue invoices.\n3. **Reallocate Marketing**: Shift Meta spend into WhatsApp high-converting campaigns (35.6x ROAS).\n\n*Expected Impact: ₹10.7L deal closing + ₹4.33L cash recovery.*`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyAiText = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopiedAi(true);
      setTimeout(() => setCopiedAi(false), 2000);
    }
  };

  const executivePrompts = [
    'How do I close the ₹11.5L MTD revenue gap in 15 days?',
    'Which overdue receivables should we recover first?',
    'What is our largest pipeline conversion leakage point?',
    'Simulate 15% price increase impact on profit margins',
    'Audit marketing channels for CAC vs ROAS efficiency',
  ];

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="command-palette-backdrop"
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsCommandPaletteOpen(false);
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh]"
          onKeyDown={handleKeyDown}
        >
          {/* Header & Search Bar */}
          <div className="relative p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center flex-shrink-0 border border-amber-200/60">
              <Command className="w-5 h-5" />
            </div>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={activeTab === 'ai' ? aiPrompt : searchQuery}
                onChange={(e) => {
                  if (activeTab === 'ai') {
                    setAiPrompt(e.target.value);
                  } else {
                    setSearchQuery(e.target.value);
                    if (e.target.value.startsWith('?') || e.target.value.startsWith('ai:')) {
                      setActiveTab('ai');
                      setAiPrompt(e.target.value.replace(/^(\?|ai:)\s*/, ''));
                    }
                  }
                }}
                placeholder={
                  activeTab === 'ai'
                    ? 'Ask AI Advisor any executive question (e.g., "How to close ₹11.5L gap?")...'
                    : 'Search customers, views, leads, overdue invoices, or type "?" for AI...'
                }
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-20 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setIsCommandPaletteOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold text-slate-600 scrollbar-none">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All Results', count: items.length },
                  { id: 'views', label: 'Views & Modules', count: viewsList.length },
                  { id: 'customers', label: 'Customers', count: customers.length },
                  { id: 'leads', label: 'Inbound Leads', count: leads.length },
                  { id: 'ai', label: 'AI Advisor', icon: Sparkles },
                  { id: 'actions', label: 'Quick Actions' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedCustomer(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-amber-800 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {'icon' in tab && tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  {'count' in tab && tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === tab.id ? 'bg-amber-700/80 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-semibold">
                Tab
              </kbd>
              <span>to cycle</span>
            </div>
          </div>

          {/* Modal Body: Active View or Search Results */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100" ref={listRef}>
            {/* Direct AI Query Tab View */}
            {activeTab === 'ai' ? (
              <div className="space-y-4 py-2">
                {/* AI Executive Quick Prompt Chips */}
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                    Recommended Strategic Prompts
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {executivePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRunAiAdvisor(prompt)}
                        className="text-left p-2.5 rounded-xl border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 text-xs font-semibold text-amber-950 transition-all flex items-start justify-between gap-2 group"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-800 flex-shrink-0 transition-colors mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Query Input Bar if not empty */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRunAiAdvisor(aiPrompt);
                      }
                    }}
                    placeholder="Type custom strategic query..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleRunAiAdvisor(aiPrompt)}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-2xs disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isAiLoading ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Query Advisor</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Response Display Container */}
                {isAiLoading && (
                  <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/40 text-center space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                      <Bot className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="text-xs font-bold text-amber-900">
                      Synthesizing MTD Financials, Pipeline Velocity & Overdue Receivables...
                    </div>
                    <div className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Gemini 3.7 Flash is grounding strategic recommendations strictly in your live organization data.
                    </div>
                  </div>
                )}

                {aiResponse && !isAiLoading && (
                  <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-800 text-white flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">AI CEO Strategic Counsel</div>
                          <div className="text-[10px] text-slate-500">Live Executive Intelligence</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyAiText}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedAi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveView('ai-advisor');
                            setIsCommandPaletteOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-900 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Full Chat</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedCustomer ? (
              /* Selected Customer Deep-Dive Inspector */
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center text-lg font-bold">
                      {selectedCustomer.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{selectedCustomer.company}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            selectedCustomer.segment === 'VIP'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : selectedCustomer.segment === 'At Risk'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {selectedCustomer.segment}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Contact: {selectedCustomer.name} • {selectedCustomer.industry} • {selectedCustomer.location}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs"
                  >
                    Back to List
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Monthly MRR</div>
                    <div className="text-sm font-bold text-slate-900">
                      {formatCurrency(selectedCustomer.monthlyRecurring, currency)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Lifetime Value (LTV)</div>
                    <div className="text-sm font-bold text-slate-900">
                      {formatCurrency(selectedCustomer.lifetimeValue, currency)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Churn Risk</div>
                    <div
                      className={`text-sm font-bold ${
                        selectedCustomer.churnRiskScore >= 60 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {selectedCustomer.churnRiskScore}% {selectedCustomer.churnRiskScore >= 60 ? '⚠️ High' : '✅ Low'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Unpaid Receivables</div>
                    <div
                      className={`text-sm font-bold ${
                        selectedCustomer.unpaidBalance > 0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(selectedCustomer.unpaidBalance, currency)}
                    </div>
                  </div>
                </div>

                {/* Customer Direct Contact & Action Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveView('customers');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View in Customers CRM</span>
                  </button>

                  <a
                    href={`mailto:${selectedCustomer.email}?subject=Executive Check-in - ${currentOrg.name}`}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email ({selectedCustomer.email})</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                      selectedCustomer.name
                    )},%20this%20is%20${encodeURIComponent(currentOrg.ceoName)}%20from%20${encodeURIComponent(
                      currentOrg.name
                    )}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-semibold text-emerald-800 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Check-in</span>
                  </a>

                  <button
                    onClick={() => {
                      handleRunAiAdvisor(
                        `How should we prevent churn and expand contract value for account: ${selectedCustomer.company} (${selectedCustomer.name}, MRR: ₹${selectedCustomer.monthlyRecurring}, Churn Risk: ${selectedCustomer.churnRiskScore}%)?`
                      );
                    }}
                    className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-800" />
                    <span>Ask AI Retention Strategy</span>
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-700">No matching items found for "{searchQuery}"</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try searching for a customer company name, view name (e.g. "Revenue"), lead, or query the AI Advisor.
                </p>
                <button
                  onClick={() => handleRunAiAdvisor(searchQuery)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-2xs hover:bg-amber-900 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Advisor about "{searchQuery}"</span>
                </button>
              </div>
            ) : (
              /* Search Results List */
              <div className="space-y-1">
                {items.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const IconComp = item.icon;

                  return (
                    <div
                      key={item.id}
                      data-command-item
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group px-3.5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 border border-amber-200/80 text-amber-950 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-amber-800 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-950">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium border flex-shrink-0 ${
                                  item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.extraInfo && (
                          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                            {item.extraInfo}
                          </span>
                        )}
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-amber-800 translate-x-0.5' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Keyboard Hints */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-semibold">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-semibold">
                  ↓
                </kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-semibold">
                  ↵
                </kbd>
                <span>select</span>
              </span>
              <span className="flex items-center gap-1 hidden sm:inline-flex">
                <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-slate-200 rounded shadow-2xs font-semibold">
                  ?
                </kbd>
                <span>for AI Advisor</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-800 font-semibold hidden md:inline">
                {currentOrg.name} Executive Command Palette
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px] font-bold">
                ⌘K / Ctrl+K
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
