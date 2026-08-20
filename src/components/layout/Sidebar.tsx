import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  UserCheck,
  Megaphone,
  Receipt,
  Wallet,
  Bot,
  LineChart,
  Lightbulb,
  Bell,
  FileText,
  CheckSquare,
  Building2,
  Layers,
  Settings,
  Sparkles,
  ChevronRight,
  Shield,
  Briefcase,
  X,
  Sliders,
  Flame,
  Command,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    rolesAllowed?: UserRole[];
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    userRole,
    alerts,
    actions,
    opportunities,
    currentOrg,
    setIsBriefingOpen,
    openCommandPalette,
  } = useApp();

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;
  const pendingActionsCount = actions.filter((a) => a.status === 'Pending').length;

  const navSections: NavSection[] = [
    {
      title: 'COMMAND CENTER',
      items: [
        {
          id: 'command-center',
          label: 'CEO Overview',
          icon: LayoutDashboard,
          badge: 'Core',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        },
        {
          id: 'business-overview',
          label: 'Business Pulse & Health',
          icon: Building2,
        },
        {
          id: 'revenue',
          label: 'Revenue & Growth',
          icon: DollarSign,
        },
        {
          id: 'sales-crm',
          label: 'Sales Pipeline',
          icon: Briefcase,
        },
        {
          id: 'customers',
          label: 'Customers & LTV',
          icon: UserCheck,
        },
        {
          id: 'marketing',
          label: 'Marketing & ROI',
          icon: Megaphone,
        },
        {
          id: 'finance',
          label: 'Finance & P&L',
          icon: PieChart,
          rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.CFO],
        },
      ],
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        {
          id: 'ai-advisor',
          label: 'AI CEO Advisor',
          icon: Bot,
          badge: 'Gemini',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
        },
        {
          id: 'revenue-leakage',
          label: 'Revenue Leakage',
          icon: Flame,
          badge: 'Leaked ₹',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        },
        {
          id: 'opportunities',
          label: 'Revenue Opportunities',
          icon: Lightbulb,
          badge: `${opportunities.length}`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          id: 'forecasting',
          label: 'Predictive Forecasting',
          icon: LineChart,
        },
        {
          id: 'ai-agents',
          label: 'AI Recommendations',
          icon: Sparkles,
          badge: '8 Agents',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          id: 'scenario-planner',
          label: 'Growth Simulator',
          icon: Sliders,
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'leads',
          label: 'Lead Scoring',
          icon: Users,
        },
        {
          id: 'follow-ups',
          label: 'Follow-up Recovery',
          icon: RotateCcw,
          badge: 'Action',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
        },
        {
          id: 'team',
          label: 'Sales Team',
          icon: Building2,
          rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.OPERATIONS_MANAGER, UserRole.SALES_MANAGER],
        },
        {
          id: 'tasks',
          label: 'CEO Action Tasks',
          icon: CheckSquare,
          badge: pendingActionsCount > 0 ? `${pendingActionsCount}` : undefined,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          id: 'alerts',
          label: 'Smart Alerts',
          icon: Bell,
          badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined,
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        },
      ],
    },
    {
      title: 'REPORTS & BENCHMARKS',
      items: [
        {
          id: 'reports',
          label: 'Executive Reports & Export',
          icon: FileText,
        },
        {
          id: 'industry-taxonomy',
          label: 'Industry Sector Taxonomy',
          icon: Layers,
          badge: '23 Domains',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        {
          id: 'settings',
          label: 'Business Profile & Goals',
          icon: Settings,
        },
        {
          id: 'integrations',
          label: 'Integrations & Sync',
          icon: Layers,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs font-black text-xs tracking-wider">
              CEO
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                AI COMMAND <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">CENTER</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold tracking-wider">
                REVENUE CO-PILOT
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action CTAs: Daily Briefing & Command Palette */}
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => setIsBriefingOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-50/90 border border-amber-200 hover:bg-amber-100/80 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <div>
                <div className="text-xs font-black text-amber-950 group-hover:text-black">
                  Daily CEO Briefing
                </div>
                <div className="text-[10px] text-amber-800">
                  Morning Pulse & Top 5 Actions
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => openCommandPalette('all', '')}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-800" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                Command Palette
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation List grouped by Executive Sections */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (!item.rolesAllowed) return true;
              return item.rolesAllowed.includes(userRole) || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.CEO;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black tracking-wider uppercase text-slate-400 font-mono">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-amber-400' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                              isActive
                                ? 'bg-slate-800 text-amber-300 border-slate-700'
                                : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Organization / Role Footer */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-black tracking-wider uppercase text-slate-500">
              Active Enterprise
            </div>
            {currentOrg.settings.isDemoMode && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                LIVE DEMO
              </span>
            )}
          </div>
          <div className="text-xs font-black text-slate-900 truncate">
            {currentOrg.name}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Role: <span className="text-slate-800 font-bold">{userRole.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
