import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Bot,
  Bell,
  Menu,
  FileText,
  DollarSign,
  PieChart,
  Users,
  Megaphone,
  Receipt,
  CheckSquare,
  Sparkles,
  Sliders,
  Settings,
  X,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BottomNavigationProps {
  onOpenFullMenu?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenFullMenu }) => {
  const { activeView, setActiveView, alerts, actions } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;
  const pendingTasksCount = actions.filter((a) => a.status === 'PENDING').length;

  // Primary bottom navigation bar tabs (top 4 executive destinations + more menu)
  const primaryTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'revenue-ops',
      label: 'Revenue',
      icon: TrendingUp,
    },
    {
      id: 'ai-agents',
      label: 'AI Team',
      icon: Bot,
      badge: 'Active',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? String(unreadAlertsCount) : undefined,
      badgeColor: 'bg-rose-500',
    },
  ];

  // Secondary items available in the bottom sheet / more menu
  const secondaryNavItems = [
    { id: 'forecast', label: 'Forecast & Runway', icon: LineChart },
    { id: 'reports', label: 'Executive Reports', icon: FileText },
    { id: 'tasks', label: 'Tasks & Approvals', icon: CheckSquare, badge: pendingTasksCount > 0 ? String(pendingTasksCount) : undefined },
    { id: 'sales-pipeline', label: 'Sales Pipeline', icon: Users },
    { id: 'margins-cogs', label: 'Margins & COGS', icon: PieChart },
    { id: 'marketing-roi', label: 'Marketing ROI', icon: Megaphone },
    { id: 'scenario-planner', label: 'Scenario Planner', icon: Sliders },
    { id: 'team', label: 'Executive Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Expanded 'More' Bottom Sheet Overlay for Mobile */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="All Navigation Modules"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">All Modules & Tools</h3>
                <p className="text-xs text-slate-500">Jump directly to any executive workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Grid of Secondary Modules */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectView(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <div className="relative mb-1.5">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-600'}`} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold tracking-tight leading-tight line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Full Drawer Trigger Option */}
            {onOpenFullMenu && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenFullMenu();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Open Full Desktop-Style Drawer
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Navigation Bar (Visible only on mobile / tablet < lg) */}
      <nav
        id="mobile-bottom-navigation-bar"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden print:hidden px-2 pt-1.5 pb-safe"
        aria-label="Mobile Navigation Bar"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectView(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative group ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${tab.label}`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-slate-900 rounded-full" />
                )}

                <div className="relative my-0.5">
                  <Icon
                    className={`w-5 h-5 transition-transform group-active:scale-90 ${
                      isActive ? 'text-slate-900 stroke-[2.5]' : 'text-slate-500 stroke-[1.75]'
                    }`}
                  />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1 -right-2 px-1 py-0.2 ${tab.badgeColor} text-white text-[9px] font-black rounded-full min-w-[14px] text-center leading-tight shadow-2xs`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight whitespace-nowrap ${
                    isActive ? 'text-slate-950 font-black' : 'text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More / Menu Button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative group ${
              isMoreMenuOpen || !primaryTabs.some((t) => t.id === activeView)
                ? 'text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
            aria-label="Open More Navigation Modules"
            aria-expanded={isMoreMenuOpen}
          >
            {(!primaryTabs.some((t) => t.id === activeView)) && (
              <span className="absolute top-0 w-8 h-1 bg-slate-900 rounded-full" />
            )}
            <div className="relative my-0.5">
              <Menu
                className={`w-5 h-5 transition-transform group-active:scale-90 ${
                  isMoreMenuOpen || !primaryTabs.some((t) => t.id === activeView)
                    ? 'text-slate-900 stroke-[2.5]'
                    : 'text-slate-500 stroke-[1.75]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight whitespace-nowrap ${
                isMoreMenuOpen || !primaryTabs.some((t) => t.id === activeView)
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
