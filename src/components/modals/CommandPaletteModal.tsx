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
  X,
  Keyboard,
  Compass,
  Layers,
  Scale,
  FileSpreadsheet,
  Download,
  Printer,
  BookmarkCheck,
  Zap,
  Activity,
  Percent,
  Clock,
  PieChart,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Lead, Invoice, UserRole, CurrencyCode } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { INDUSTRY_SECTORS } from '../../data/industrySectors';

type TabFilter = 'all' | 'reports' | 'taxonomy' | 'benchmarking' | 'views' | 'customers' | 'leads' | 'ai' | 'actions';

interface CommandItem {
  id: string;
  category: 'reports' | 'taxonomy' | 'benchmarking' | 'views' | 'customers' | 'leads' | 'actions' | 'ai' | 'invoices';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  extraInfo?: string;
  score?: number;
  meta?: any;
  onSelect: () => void;
}

/**
 * Multi-token fuzzy match scorer
 */
function calculateFuzzyScore(query: string, ...targets: (string | undefined | null)[]): number {
  if (!query) return 1;
  const q = query.toLowerCase().trim();
  const qTokens = q.split(/\s+/).filter(Boolean);
  if (qTokens.length === 0) return 1;

  let maxScore = 0;
  for (const target of targets) {
    if (!target) continue;
    const text = target.toLowerCase();

    // Exact string match
    if (text === q) {
      return 100;
    }
    // Starts with query
    if (text.startsWith(q)) {
      maxScore = Math.max(maxScore, 85);
    }
    // Contains full phrase
    else if (text.includes(q)) {
      maxScore = Math.max(maxScore, 70);
    }
    // Token evaluation
    else {
      const matchedTokens = qTokens.filter((tok) => text.includes(tok));
      if (matchedTokens.length === qTokens.length) {
        maxScore = Math.max(maxScore, 55 + qTokens.length * 5);
      } else if (matchedTokens.length > 0) {
        maxScore = Math.max(maxScore, Math.round((matchedTokens.length / qTokens.length) * 45));
      }
    }
  }
  return maxScore;
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
    addToast,
    runScenarioSimulation,
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

  // Static Views List for Navigation
  const viewsList = useMemo(
    () => [
      { id: 'command-center', title: 'CEO Command Center', category: 'Strategy', icon: LayoutDashboard, badge: 'Main', desc: 'Real-time revenue, leak alerts, top CEO actions' },
      { id: 'business-overview', title: 'Business Overview', category: 'Executive', icon: Compass, desc: 'High-level business health & KPI pulse' },
      { id: 'industry-benchmarking', title: 'Industry Benchmarking & Action Engine', category: 'Strategy', icon: Scale, badge: 'Gap Engine', desc: 'Compare live KPIs vs 23 sector standards and run prioritized gap-closing playbooks' },
      { id: 'industry-taxonomy', title: 'Industry Sector Taxonomy (23 Master Domains)', category: 'Reporting', icon: Layers, badge: '23 Sectors', desc: '108+ extracted sub-industries, gross margin baselines, LTV:CAC benchmarks' },
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
      { id: 'gamification', title: 'Gamification Dashboard & Milestones', category: 'Strategy', icon: Trophy, badge: 'Level Quest', desc: 'Simulate company revenue growth milestones, unlock badges & review financial trajectory impacts' },
      { id: 'alerts', title: 'Executive Alerts & Risk Radar', category: 'Operations', icon: Bell, desc: 'Immediate risk notices, payment delays & churn flags' },
      { id: 'tasks', title: 'CEO Action Tasks', category: 'Operations', icon: CheckSquare, desc: 'Assigned high-impact tasks and strategic decisions' },
      { id: 'reports', title: 'Executive Reports & Export', category: 'Reporting', icon: FileText, desc: 'Board summaries, PDF exports & CSV raw data' },
      { id: 'team', title: 'Team & Productivity', category: 'Management', icon: UserCheck, desc: 'Headcount, payroll efficiency & capacity' },
      { id: 'integrations', title: 'Integrations Hub', category: 'Systems', icon: Building, desc: 'Connect CRM, QuickBooks, Stripe & Google Ads' },
      { id: 'settings', title: 'Business Settings & Targets', category: 'Settings', icon: Settings, desc: 'Revenue targets, currency, margins & thresholds' },
    ],
    []
  );

  // Executive Reports Registry
  const reportsList = useMemo(
    () => [
      {
        id: 'report-monthly-board',
        title: 'Monthly Executive Board Deck Report',
        subtitle: 'Comprehensive monthly summary of ARR, EBITDA, net margin, sales velocity & working capital',
        category: 'Board Reporting',
        icon: FileText,
        badge: 'Board Deck',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 font-bold',
        extraInfo: 'View / Print PDF',
        keywords: 'monthly board p&l margin arr ebitda financial report deck presentation',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Opened Monthly Executive Board Deck Report', 'info');
        },
      },
      {
        id: 'report-p-and-l',
        title: 'Profit & Loss Statement (P&L) & Margin Audit',
        subtitle: 'Detailed revenue breakdown, direct COGS, gross margin %, operating expenses & net margin',
        category: 'Financial Statement',
        icon: DollarSign,
        badge: 'P&L Statement',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
        extraInfo: 'Financials',
        keywords: 'profit and loss p&l statement gross margin net margin cogs revenue ebitda cfo audit',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Opened Profit & Loss Statement (P&L)', 'info');
        },
      },
      {
        id: 'report-sales-pipeline',
        title: 'Sales Pipeline Velocity & Conversion Bottleneck Report',
        subtitle: 'Funnel stages, lead conversion rates, win rates, sales rep quotas and cycle velocity',
        category: 'Sales Analytics',
        icon: Target,
        badge: 'Pipeline Audit',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 font-bold',
        extraInfo: 'Sales CRM',
        keywords: 'sales pipeline funnel conversion deal size win rate cycle days quota rep performance velocity',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Opened Sales Pipeline & Velocity Report', 'info');
        },
      },
      {
        id: 'report-unit-economics',
        title: 'Unit Economics & LTV : CAC Payback Report',
        subtitle: 'Blended CAC, lifetime value (LTV), CAC payback period months, and cohort payback metrics',
        category: 'Unit Economics',
        icon: PieChart,
        badge: 'Unit Economics',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        extraInfo: 'Growth Metrics',
        keywords: 'unit economics ltv cac ratio payback period months blended cac customer acquisition lifetime value',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Opened Unit Economics & LTV:CAC Report', 'info');
        },
      },
      {
        id: 'report-industry-taxonomy',
        title: '23-Sector Industry Taxonomy & Benchmark Report',
        subtitle: 'Cross-industry benchmarking standards across 108+ extracted sub-industries and financial baselines',
        category: 'Taxonomy & Benchmark',
        icon: Layers,
        badge: '23 Sectors',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold',
        extraInfo: 'Sector Matrix',
        keywords: 'industry taxonomy sectors 23 domains sub industries benchmarks gross margin ltv cac sales cycle',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Opened 23-Sector Industry Taxonomy Report', 'info');
        },
      },
      {
        id: 'report-export-csv',
        title: 'Export Master KPI Diagnostic Report (CSV)',
        subtitle: 'Download complete structured tabular dataset of all active financial and operational indicators',
        category: 'Data Export',
        icon: FileSpreadsheet,
        badge: 'CSV Download',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
        extraInfo: '1-Click CSV',
        keywords: 'export download csv raw data spreadsheet kpis metrics tabular master audit excel',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Navigate to Board Reports to trigger CSV download', 'info');
        },
      },
      {
        id: 'report-export-pdf',
        title: 'Print Executive PDF Board Dossier',
        subtitle: 'Generate high-resolution printable PDF dossier with executive signatures and audit timestamps',
        category: 'Document Export',
        icon: Printer,
        badge: 'Print / PDF',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 font-bold',
        extraInfo: 'PDF Deck',
        keywords: 'print pdf download export board dossier signature printable report paper deck',
        onSelect: () => {
          setActiveView('reports');
          setIsCommandPaletteOpen(false);
          addToast('Triggering Printable Executive Report Mode...', 'info');
        },
      },
    ],
    [setActiveView, setIsCommandPaletteOpen, addToast]
  );

  // Benchmarking Action Items & Gap-Closing Playbooks
  const benchmarkingActionItems = useMemo(
    () => [
      {
        id: 'bench-act-cogs',
        title: 'COGS Rationalization & Direct Cost Restructuring',
        subtitle: 'Target: Gross Margin Baseline • Migrate active cloud workloads to 3-year reserved capacity & prune licenses',
        category: 'Unit Economics',
        icon: DollarSign,
        badge: 'Critical Gap',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
        extraInfo: '+4-8% Margin Expansion',
        timeframe: '4-8 Weeks',
        impact: 'Expand gross margins by rationalizing direct server infrastructure and vendor software',
        keywords: 'cogs rationalization gross margin direct costs hosting aws kubernetes reserved capacity pricing discount',
        onSelect: () => {
          setActiveView('industry-benchmarking');
          setIsCommandPaletteOpen(false);
          addToast('Focused on COGS Rationalization Action Plan', 'info');
        },
      },
      {
        id: 'bench-act-ltvcac',
        title: 'Acquisition Unit Economics & Sales Funnel Efficiency',
        subtitle: 'Target: LTV:CAC Multiplier • Reallocate paid search into high-intent product-led organic channels',
        category: 'Unit Economics',
        icon: Activity,
        badge: 'High Priority',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        extraInfo: '+0.8x CAC Efficiency',
        timeframe: '6-12 Weeks',
        impact: 'Increase customer lifetime value multiplier and compress payback period',
        keywords: 'ltv cac acquisition marketing spend organic channels annual upfront billing payback onboarding',
        onSelect: () => {
          setActiveView('industry-benchmarking');
          setIsCommandPaletteOpen(false);
          addToast('Focused on Unit Economics & CAC Efficiency Action Plan', 'info');
        },
      },
      {
        id: 'bench-act-velocity',
        title: 'Deal Pipeline Velocity & Stage Gating Optimization',
        subtitle: 'Target: Sales Cycle Velocity • Standardize 14-day POCs and pre-package SOC2 security compliance',
        category: 'Sales Pipeline',
        icon: Clock,
        badge: 'High Priority',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        extraInfo: '-15 Days Cycle Time',
        timeframe: '3-6 Weeks',
        impact: 'Compress enterprise deal sales cycle duration and accelerate throughput',
        keywords: 'sales cycle velocity pipeline stage gating poc proof of concept soc2 compliance legal msa deal size',
        onSelect: () => {
          setActiveView('industry-benchmarking');
          setIsCommandPaletteOpen(false);
          addToast('Focused on Sales Cycle Velocity Action Plan', 'info');
        },
      },
      {
        id: 'bench-act-nrr',
        title: 'Account Expansion & Churn Insulation Playbook',
        subtitle: 'Target: Net Retention Rate (NRR) • Deploy proactive telemetry health alerts for top 20% ARR tier accounts',
        category: 'Revenue Growth',
        icon: TrendingUp,
        badge: 'High Priority',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        extraInfo: '+6% NRR Lift',
        timeframe: '8-16 Weeks',
        impact: 'Compound ARR expansion via cross-sell add-ons and automated customer success interventions',
        keywords: 'net retention rate nrr churn reduction expansion upsell customer success proactive alerts renewals',
        onSelect: () => {
          setActiveView('industry-benchmarking');
          setIsCommandPaletteOpen(false);
          addToast('Focused on Account Expansion & Churn Insulation Plan', 'info');
        },
      },
      {
        id: 'bench-act-scale',
        title: 'Aggressive Capital Deployment & Market Share Capture',
        subtitle: 'Target: Top Decile Growth • Expand sales engineering headcount by 2-3 reps while unit economics outperform',
        category: 'Revenue Growth',
        icon: Zap,
        badge: 'Growth Engine',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
        extraInfo: '+35% ARR Acceleration',
        timeframe: 'Immediate',
        impact: 'Scale high-converting sales channels into adjacent industry sectors',
        keywords: 'aggressive capital scale market share growth hiring sales reps expansion enterprise acceleration',
        onSelect: () => {
          setActiveView('industry-benchmarking');
          setIsCommandPaletteOpen(false);
          addToast('Focused on Market Share Capture Action Plan', 'info');
        },
      },
    ],
    [setActiveView, setIsCommandPaletteOpen, addToast]
  );

  // Filtered and Fuzzy Searchable Command Items
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
        score: q ? 95 : 50,
        onSelect: () => {
          if (q) {
            handleRunAiAdvisor(q);
          } else {
            setActiveTab('ai');
          }
        },
      });
    }

    // 2. Executive Reports & Statements
    if (activeTab === 'all' || activeTab === 'reports') {
      reportsList.forEach((rpt) => {
        const score = calculateFuzzyScore(q, rpt.title, rpt.subtitle, rpt.category, rpt.keywords, rpt.badge);
        if (!q || score > 20) {
          result.push({
            id: rpt.id,
            category: 'reports',
            title: rpt.title,
            subtitle: rpt.subtitle,
            icon: rpt.icon,
            badge: rpt.badge,
            badgeColor: rpt.badgeColor,
            extraInfo: rpt.extraInfo,
            score,
            onSelect: rpt.onSelect,
          });
        }
      });
    }

    // 3. Benchmarking Action Items & Gap-Closing Playbooks
    if (activeTab === 'all' || activeTab === 'benchmarking') {
      benchmarkingActionItems.forEach((act) => {
        const score = calculateFuzzyScore(q, act.title, act.subtitle, act.category, act.keywords, act.impact, act.timeframe);
        if (!q || score > 20) {
          result.push({
            id: act.id,
            category: 'benchmarking',
            title: act.title,
            subtitle: act.subtitle,
            icon: act.icon,
            badge: act.badge,
            badgeColor: act.badgeColor,
            extraInfo: act.extraInfo,
            score,
            onSelect: act.onSelect,
          });
        }
      });
    }

    // 4. Industry Taxonomy Sectors (23 Master Domains & 108+ Sub-Industries)
    if (activeTab === 'all' || activeTab === 'taxonomy') {
      INDUSTRY_SECTORS.forEach((sector) => {
        const subIndustriesJoined = sector.subIndustries.join('; ');
        const score = calculateFuzzyScore(
          q,
          sector.name,
          sector.description,
          subIndustriesJoined,
          `${sector.benchmarkGrossMargin}% Gross Margin`,
          `${sector.benchmarkCACtoLTV}x LTV:CAC`,
          `${sector.typicalSalesCycleDays} Days Sales Cycle`,
          'industry sector taxonomy benchmark domain'
        );

        if (!q || score > 20) {
          result.push({
            id: `sector-${sector.id}`,
            category: 'taxonomy',
            title: `${sector.name} (${sector.subIndustriesCount} Domains)`,
            subtitle: `${sector.subIndustries.slice(0, 3).join(', ')}${sector.subIndustries.length > 3 ? '...' : ''} • GM: ${sector.benchmarkGrossMargin}% | LTV:CAC: ${sector.benchmarkCACtoLTV}x | Cycle: ${sector.typicalSalesCycleDays}d`,
            icon: Layers,
            badge: `${sector.subIndustriesCount} Sub-Industries`,
            badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
            extraInfo: `Benchmark: ${sector.benchmarkGrossMargin}% GM`,
            score,
            onSelect: () => {
              setActiveView('industry-taxonomy');
              setIsCommandPaletteOpen(false);
              addToast(`Inspecting ${sector.name} Taxonomy & Benchmarks`, 'info');
            },
          });
        }

        // Also index sub-industry specializations when query is specific
        if (q && q.length > 2) {
          sector.subIndustries.forEach((subName, subIdx) => {
            const subScore = calculateFuzzyScore(q, subName, sector.name);
            if (subScore > 35) {
              result.push({
                id: `sub-${sector.id}-${subIdx}`,
                category: 'taxonomy',
                title: subName,
                subtitle: `Specialization in ${sector.name} • Benchmark GM: ${sector.benchmarkGrossMargin}% | LTV:CAC: ${sector.benchmarkCACtoLTV}x`,
                icon: Building,
                badge: 'Sub-Industry',
                badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
                extraInfo: sector.name,
                score: subScore + 5,
                onSelect: () => {
                  setActiveView('industry-taxonomy');
                  setIsCommandPaletteOpen(false);
                  addToast(`Selected domain: "${subName}" (${sector.name})`, 'info');
                },
              });
            }
          });
        }
      });
    }

    // 5. Navigation Views & Modules
    if (activeTab === 'all' || activeTab === 'views') {
      viewsList.forEach((v) => {
        const score = calculateFuzzyScore(q, v.title, v.desc, v.category, v.badge);
        if (!q || score > 20) {
          result.push({
            id: `view-${v.id}`,
            category: 'views',
            title: v.title,
            subtitle: v.desc,
            icon: v.icon,
            badge: v.badge || v.category,
            badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
            extraInfo: activeView === v.id ? 'Current View' : 'Navigate',
            score,
            onSelect: () => {
              setActiveView(v.id);
              setIsCommandPaletteOpen(false);
            },
          });
        }
      });
    }

    // 6. Customers & Accounts Search
    if (activeTab === 'all' || activeTab === 'customers') {
      customers.forEach((c) => {
        const score = calculateFuzzyScore(q, c.company, c.name, c.industry, c.email, c.segment, c.assignedAccountManager);
        if (!q || score > 20) {
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
            score,
            meta: c,
            onSelect: () => {
              setSelectedCustomer(c);
            },
          });
        }
      });
    }

    // 7. Inbound Leads Search
    if (activeTab === 'all' || activeTab === 'leads') {
      leads.forEach((l) => {
        const score = calculateFuzzyScore(q, l.name, l.company, l.source, l.status, l.temperature, l.assignedSalesperson);
        if (!q || score > 20) {
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
            score,
            meta: l,
            onSelect: () => {
              setActiveView('leads');
              setIsCommandPaletteOpen(false);
            },
          });
        }
      });
    }

    // 8. Invoices & Overdue Receivables
    if (activeTab === 'all' || activeTab === 'actions') {
      invoices
        .filter((inv) => inv.status === 'Overdue')
        .forEach((inv) => {
          const score = calculateFuzzyScore(q, inv.customerName, inv.invoiceNumber, 'overdue invoice receivable');
          if (!q || score > 20) {
            result.push({
              id: `inv-${inv.id}`,
              category: 'invoices',
              title: `Overdue Invoice: ${inv.invoiceNumber} (${inv.customerName})`,
              subtitle: `Amount: ${formatCurrency(inv.amount, currency)} • Due Date: ${inv.dueDate}`,
              icon: Receipt,
              badge: 'Overdue',
              badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
              extraInfo: 'Collect Now',
              score,
              onSelect: () => {
                setActiveView('cash-flow');
                setIsCommandPaletteOpen(false);
              },
            });
          }
        });
    }

    // 9. Quick Executive Actions
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
          score: calculateFuzzyScore(q, 'daily ceo briefing morning update priorities run rate overnight'),
          onSelect: () => {
            setIsCommandPaletteOpen(false);
            setIsBriefingOpen(true);
          },
        },
        {
          id: 'action-benchmarking-engine',
          category: 'actions',
          title: 'Run Industry Benchmarking Gap Diagnostic',
          subtitle: 'Compare live gross margin, CAC, and sales velocity against 23 sector standards',
          icon: Scale,
          badge: 'Benchmarking',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
          score: calculateFuzzyScore(q, 'industry benchmarking gap diagnostic sector comparison action plan'),
          onSelect: () => {
            setActiveView('industry-benchmarking');
            setIsCommandPaletteOpen(false);
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
          score: calculateFuzzyScore(q, 'import data csv excel upload customers leads expenses'),
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
          score: calculateFuzzyScore(q, 'revenue leakage audit 8 stages cost leaks receivables proposals'),
          onSelect: () => {
            setActiveView('revenue-leakage');
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-price-simulation',
          category: 'actions',
          title: 'Simulate 15% Price Increase Scenario',
          subtitle: 'Test elasticity, margin expansion, and churn resistance in real time',
          icon: Sliders,
          badge: 'Simulation',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          score: calculateFuzzyScore(q, 'simulate scenario price increase margin elasticity hiring headcount'),
          onSelect: () => {
            runScenarioSimulation({
              pricingShiftPercent: 15,
              salesHeadcountDelta: 0,
              pipelineVelocityMultiplier: 1.0,
              churnReductionPercent: 0,
              costReductionPercent: 0,
            });
            setIsCommandPaletteOpen(false);
            addToast('Applied 15% Price Increase Scenario simulation', 'success');
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
          score: calculateFuzzyScore(q, 'switch currency inr usd eur gbp money format'),
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
          score: calculateFuzzyScore(q, 'switch role perspective ceo cfo sales marketing manager'),
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
        if (!q || (act.score && act.score > 20)) {
          result.push(act);
        }
      });
    }

    // Sort results by fuzzy score when a search query is active
    if (q) {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return result;
  }, [
    searchQuery,
    activeTab,
    viewsList,
    reportsList,
    benchmarkingActionItems,
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
    addToast,
    runScenarioSimulation,
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
      const tabs: TabFilter[] = ['all', 'reports', 'taxonomy', 'benchmarking', 'views', 'customers', 'leads', 'ai', 'actions'];
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
        `### STRATEGIC DIAGNOSIS & BENCHMARKING ACTION PLAN\nBased on current organization metrics for ${currentOrg.name}:\n1. **Gross Margin Gap**: Current baseline (${kpiSnapshot.grossMarginPercent}%) vs Sector average requires 3-year cloud reserve commit and vendor software consolidation.\n2. **Pipeline Velocity Acceleration**: Compress ${kpiSnapshot.salesCycleDays}-day sales cycle by pre-packaging SOC2 compliance & 14-day capped proof-of-concept gating.\n3. **Overdue Receivables**: Recover trapped working capital from overdue customer invoices to expand cash runway past ${kpiSnapshot.runwayMonths.toFixed(1)} months.\n\n*Execute via the Industry Benchmarking module to track gap-closing milestones.*`
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
    'How do I close the performance gap against top decile software margins?',
    'Which overdue receivables should we recover first?',
    'What is our largest pipeline conversion leakage point?',
    'Simulate 15% price increase impact on profit margins',
    'Compare our LTV:CAC unit economics against sector benchmark',
  ];

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="command-palette-backdrop"
        className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
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
          className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
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
                    ? 'Ask AI Advisor any executive question (e.g., "How to close margin gap?")...'
                    : 'Fuzzy search across reports, taxonomy sectors, action playbooks, customers...'
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
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Category Tabs with Comprehensive Filters */}
          <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold text-slate-600 scrollbar-none">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All Results', count: items.length },
                  { id: 'reports', label: 'Reports', icon: FileText, count: reportsList.length },
                  { id: 'taxonomy', label: 'Industry Sectors', icon: Layers, count: INDUSTRY_SECTORS.length },
                  { id: 'benchmarking', label: 'Action Plans', icon: Scale, count: benchmarkingActionItems.length },
                  { id: 'views', label: 'Views', count: viewsList.length },
                  { id: 'customers', label: 'Customers', count: customers.length },
                  { id: 'leads', label: 'Leads', count: leads.length },
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
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 shrink-0 pl-2">
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
                        className="text-left p-2.5 rounded-xl border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-300 text-xs font-semibold text-amber-950 transition-all flex items-start justify-between gap-2 group cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-amber-800 flex-shrink-0 transition-colors mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Query Input Bar */}
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
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-2xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
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
                      Synthesizing MTD Financials, Sector Benchmarks & Gap-Closing Playbooks...
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
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedAi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveView('ai-advisor');
                            setIsCommandPaletteOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 text-xs cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
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
                    className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-xs font-bold text-amber-900 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  Try searching for report titles (e.g. "Board Deck", "P&L"), industry taxonomy sectors (e.g. "Software", "Healthcare"), action playbooks (e.g. "COGS"), customers, or query the AI Advisor.
                </p>
                <button
                  onClick={() => handleRunAiAdvisor(searchQuery)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-2xs hover:bg-amber-900 transition-all cursor-pointer"
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
