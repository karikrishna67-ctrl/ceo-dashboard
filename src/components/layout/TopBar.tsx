import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Bot,
  User,
  Check,
  ChevronDown,
  Sparkles,
  Upload,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Building,
  Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateFilterOption, UserRole } from '../../types';

interface TopBarProps {
  onOpenSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar }) => {
  const {
    currentUser,
    userRole,
    setUserRole,
    currentOrg,
    filters,
    setDateRange,
    setSearchQuery,
    alerts,
    markAlertRead,
    markAllAlertsRead,
    setActiveView,
    setIsBriefingOpen,
    setIsOnboardingOpen,
    setIsDataImportOpen,
    setIsCommandPaletteOpen,
    openCommandPalette,
    resetDemoData,
    toggleDemoMode,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const dateOptions: { id: DateFilterOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month (MTD)' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter (Q3)' },
    { id: 'this_year', label: 'This Year (FY26)' },
  ];

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: UserRole.CEO, title: 'CEO', desc: 'Full business dashboard & strategic actions' },
    { role: UserRole.CFO, title: 'CFO', desc: 'Financials, cash flow, P&L, receivables' },
    { role: UserRole.SALES_MANAGER, title: 'Sales Manager', desc: 'Pipeline, deals, conversions, reps' },
    { role: UserRole.MARKETING_MANAGER, title: 'Marketing Manager', desc: 'Campaigns, CAC, ROAS, channels' },
    { role: UserRole.OPERATIONS_MANAGER, title: 'Operations Manager', desc: 'Tasks, productivity, costs' },
    { role: UserRole.SUPER_ADMIN, title: 'Super Admin', desc: 'Organization controls & integrations' },
    { role: UserRole.VIEWER, title: 'Viewer', desc: 'Read-only business metrics' },
  ];

  const currentDateLabel = dateOptions.find((d) => d.id === filters.dateRange)?.label || 'This Month';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => openCommandPalette('all', '')}
          className="relative w-full hidden sm:flex items-center justify-between bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-all text-left shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-amber-700 transition-colors" />
          <span className="truncate">Search customers, views, leads, or ask AI...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => openCommandPalette('all', '')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 sm:hidden"
          title="Open Command Palette (Cmd+K)"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Center/Right: Date Selector, AI Advisor, Alerts, Roles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">{currentDateLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Time Horizon
              </div>
              {dateOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDateRange(opt.id);
                    setIsDateMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    filters.dateRange === opt.id ? 'text-amber-800 font-bold bg-amber-50' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                  {filters.dateRange === opt.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Quick Advisor Button */}
        <button
          onClick={() => setActiveView('ai-advisor')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-2xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span className="hidden sm:inline">Ask AI Advisor</span>
        </button>

        {/* Data Import Button */}
        <button
          onClick={() => setIsDataImportOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 hidden md:flex items-center gap-1.5 text-xs font-semibold"
          title="Import CSV/Excel Business Data"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Import Data</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative border border-slate-200 transition-colors"
            title="Real-time Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Business Alerts</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    {unreadAlerts.length} New
                  </span>
                </div>
                {unreadAlerts.length > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="text-[11px] text-amber-700 hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No active alerts.</div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        markAlertRead(alert.id);
                        if (alert.actionRoute) setActiveView(alert.actionRoute);
                        setIsNotificationsOpen(false);
                      }}
                      className={`p-3.5 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                        !alert.isRead ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : alert.severity === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{alert.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{alert.message}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => {
                    setActiveView('alerts');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-[11px] text-slate-700 hover:text-amber-800 font-bold"
                >
                  View All Alerts Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persona / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Switch Persona / Role for Permission Testing"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-amber-700 font-medium">{userRole.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                <div className="text-[10px] text-amber-700 font-bold mt-0.5">Org: {currentOrg.name}</div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate Persona / Role:
              </div>

              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setUserRole(r.role);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    userRole === r.role ? 'text-amber-900 font-bold bg-amber-50' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">{r.title}</div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </div>
                  {userRole === r.role && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              ))}

              <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                <button
                  onClick={() => {
                    setIsOnboardingOpen(true);
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Re-run CEO Onboarding</span>
                </button>

                <button
                  onClick={() => {
                    resetDemoData();
                    setIsRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Demo Dataset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
