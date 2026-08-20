import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  User,
  Shield,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Globe,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, UserRole } from '../../types';
import { IndustryCategorySelector } from '../common/IndustryCategorySelector';
import { IndustrySector } from '../../data/industrySectors';

export const SettingsView: React.FC = () => {
  const {
    currentOrg,
    setCurrentOrg,
    currentUser,
    userRole,
    setUserRole,
    currency,
    setCurrency,
    resetDemoData,
    clearToEmptyState,
    setIsOnboardingOpen,
    setIsDataImportOpen,
    addToast,
  } = useApp();

  const [orgName, setOrgName] = useState(currentOrg.name);
  const [ceoName, setCeoName] = useState(currentOrg.ceoName || 'Rajesh Sharma');
  const [industry, setIndustry] = useState(currentOrg.industry || 'Technology & Software');
  const [revenueTarget, setRevenueTarget] = useState(currentOrg.settings.monthlyRevenueTarget);
  const [targetMargin, setTargetMargin] = useState(currentOrg.settings.targetNetMarginPct);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', label: 'Euro (€)', symbol: '€' },
    { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { code: 'AED', label: 'UAE Dirham (AED)', symbol: 'AED' },
    { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  ];

  const handleSaveSettings = () => {
    setCurrentOrg((prev) => ({
      ...prev,
      name: orgName,
      ceoName: ceoName,
      industry: industry,
      settings: {
        ...prev.settings,
        monthlyRevenueTarget: Number(revenueTarget),
        targetNetMarginPct: Number(targetMargin),
      },
    }));
    setSavedSuccess(true);
    addToast('Organization settings updated successfully', 'success');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectIndustry = (sector: IndustrySector) => {
    setIndustry(sector.name);
    setCurrentOrg((prev) => ({
      ...prev,
      industry: sector.name,
    }));
    addToast(`Selected industry: ${sector.name} (${sector.subIndustriesCount} sub-industries)`, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Settings & Organization Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Admin
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure enterprise parameters, default currency, targets, and 23-sector industry taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Organization & Financial Target Settings */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-600" />
          Enterprise Profile & Targets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chief Executive Officer (CEO Name)
            </label>
            <input
              type="text"
              value={ceoName}
              onChange={(e) => setCeoName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Revenue Target ({currency})
            </label>
            <input
              type="number"
              value={revenueTarget}
              onChange={(e) => setRevenueTarget(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono-numeric"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Net Profit Margin (%)
            </label>
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono-numeric"
            />
          </div>
        </div>
      </div>

      {/* Industry Category Selector Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              Industry Sector Taxonomy (23 Master Domains)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your organization's industry category to calibrate benchmark gross margins, sales cycles, and LTV expectations.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            Current: {industry}
          </span>
        </div>

        <IndustryCategorySelector
          selectedIndustry={industry}
          onSelectIndustry={handleSelectIndustry}
          layout="grid"
          showDetailsModal={true}
        />
      </div>

      {/* Currency Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              Primary Reporting Currency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All financial snapshots, leak calculations, and board exports adapt dynamically.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            Active: {currency}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                currency === c.code
                  ? 'bg-amber-50 border-amber-300 shadow-xs ring-2 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="text-base font-black text-slate-900">{c.symbol}</div>
              <div className="text-xs font-bold text-slate-700 mt-1">{c.code}</div>
              <div className="text-[10px] text-slate-500">{c.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* System Actions & Data Management */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-600" />
          Data Controls & Wizards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900">Re-run Onboarding Wizard</div>
            <div className="text-[11px] text-slate-500 mt-1">Re-evaluate business model & sector parameters</div>
          </button>

          <button
            onClick={() => setIsDataImportOpen(true)}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900">Import CSV Data</div>
            <div className="text-[11px] text-slate-500 mt-1">Bulk upload leads, customers, or expenses</div>
          </button>

          <button
            onClick={resetDemoData}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900">Reset Demo Dataset</div>
            <div className="text-[11px] text-slate-500 mt-1">Restore default Indian B2B demo dataset</div>
          </button>
        </div>
      </div>
    </div>
  );
};
