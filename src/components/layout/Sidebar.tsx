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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  rolesAllowed?: UserRole[];
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

  const navItems: NavItem[] = [
    {
      id: 'command-center',
      label: 'CEO Command Center',
      icon: LayoutDashboard,
      badge: 'Core',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'business-overview',
      label: 'Business Overview',
      icon: TrendingUp,
    },
    {
      id: 'revenue',
      label: 'Revenue & Growth',
      icon: DollarSign,
    },
    {
      id: 'finance',
      label: 'Finance & P&L',
      icon: PieChart,
      rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.CFO],
    },
    {
      id: 'sales-crm',
      label: 'Sales & Pipeline',
      icon: Briefcase,
    },
    {
      id: 'leads',
      label: 'Leads Engine',
      icon: Users,
    },
    {
      id: 'customers',
      label: 'Customer Retention',
      icon: UserCheck,
    },
    {
      id: 'marketing',
      label: 'Marketing & CAC',
      icon: Megaphone,
    },
    {
      id: 'expenses',
      label: 'Expense Leaks',
      icon: Receipt,
      rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.CFO, UserRole.OPERATIONS_MANAGER],
    },
    {
      id: 'cash-flow',
      label: 'Cash Runway',
      icon: Wallet,
      rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.CFO],
    },
    {
      id: 'revenue-leakage',
      label: 'Revenue Leakage',
      icon: Flame,
      badge: 'Find Leaks',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    },
    {
      id: 'ai-advisor',
      label: 'AI CEO Advisor',
      icon: Bot,
      badge: 'Gemini',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'ai-agents',
      label: 'Specialized AI Agents',
      icon: Sparkles,
      badge: '8 Agents',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'forecasting',
      label: 'Predict & Forecast',
      icon: LineChart,
    },
    {
      id: 'opportunities',
      label: 'Opportunities Center',
      icon: Lightbulb,
      badge: `${opportunities.length}`,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'scenario-planner',
      label: 'Scenario Simulator',
      icon: Sliders,
    },
    {
      id: 'alerts',
      label: 'Critical Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    },
    {
      id: 'tasks',
      label: 'CEO Action Tasks',
      icon: CheckSquare,
      badge: pendingActionsCount > 0 ? `${pendingActionsCount}` : undefined,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: FileText,
    },
    {
      id: 'team',
      label: 'Team & Productivity',
      icon: Building2,
      rolesAllowed: [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.OPERATIONS_MANAGER, UserRole.SALES_MANAGER],
    },
    {
      id: 'integrations',
      label: 'Integrations Hub',
      icon: Layers,
    },
    {
      id: 'settings',
      label: 'Settings & Roles',
      icon: Settings,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.rolesAllowed) return true;
    return item.rolesAllowed.includes(userRole) || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.CEO;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
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
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs font-black text-sm">
              CEO
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                AI COMMAND <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">OS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                EXECUTIVE DECISION CENTER
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
            className="w-full py-2.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200/90 hover:bg-amber-100/70 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <div>
                <div className="text-xs font-bold text-amber-900 group-hover:text-amber-950">
                  Daily CEO Briefing
                </div>
                <div className="text-[10px] text-amber-700">
                  Morning Pulse & Top 3 Actions
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => openCommandPalette('all', '')}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 flex items-center justify-between text-left group transition-all cursor-pointer shadow-2xs"
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

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
          {filteredNavItems.map((item) => {
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
        </nav>

        {/* Organization / Role Footer */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Active Enterprise
            </div>
            {currentOrg.settings.isDemoMode && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                DEMO MODE
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {currentOrg.name}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Role: <span className="text-slate-800 font-semibold">{userRole.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
