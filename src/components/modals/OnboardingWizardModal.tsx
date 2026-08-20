import React, { useState } from 'react';
import {
  X,
  Building,
  Target,
  DollarSign,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';
import { IndustryCategorySelector } from '../common/IndustryCategorySelector';
import { IndustrySector, INDUSTRY_SECTORS } from '../../data/industrySectors';

export const OnboardingWizardModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, currentOrg, setCurrentOrg, setCurrency } = useApp();
  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState(currentOrg.name);
  const [ceoName, setCeoName] = useState(currentOrg.ceoName || 'Rajesh Sharma');
  const [industry, setIndustry] = useState(currentOrg.industry || 'Technology & Software');
  const [businessModel, setBusinessModel] = useState<'B2B' | 'B2C' | 'D2C' | 'SaaS'>('B2B');
  const [revenueTarget, setRevenueTarget] = useState(5000000);
  const [chosenCurrency, setChosenCurrency] = useState<CurrencyCode>('INR');

  if (!isOnboardingOpen) return null;

  const handleFinish = () => {
    setCurrentOrg((prev) => ({
      ...prev,
      name: companyName,
      ceoName: ceoName,
      industry: industry,
      settings: {
        ...prev.settings,
        monthlyRevenueTarget: Number(revenueTarget),
        currency: chosenCurrency,
      },
    }));
    setCurrency(chosenCurrency);
    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
              CEO
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Executive Setup Wizard</h2>
              <p className="text-xs text-slate-500">Step {step} of 3 • Customizing intelligence parameters & industry taxonomy</p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Enterprise Identity & Industry Sector</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Executive (CEO Name)</label>
                  <input
                    type="text"
                    value={ceoName}
                    onChange={(e) => setCeoName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Industry Sector (23 Master Domains)
                  </label>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Selected: {industry}
                  </span>
                </div>

                {/* 23 Visual Category Buttons Selector */}
                <IndustryCategorySelector
                  selectedIndustry={industry}
                  onSelectIndustry={(sector) => setIndustry(sector.name)}
                  layout="compact"
                  showDetailsModal={false}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">2. Business Model & Currency</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Primary Business Model</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['B2B', 'SaaS', 'D2C', 'B2C'] as const).map((bm) => (
                    <button
                      key={bm}
                      type="button"
                      onClick={() => setBusinessModel(bm)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        businessModel === bm
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bm} Model
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Reporting Currency</label>
                <select
                  value={chosenCurrency}
                  onChange={(e) => setChosenCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED (AED) — UAE Dirham</option>
                  <option value="SGD">SGD (S$) — Singapore Dollar</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">3. Monthly Revenue Targets & Run-Rate</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Target Revenue ({chosenCurrency})
                </label>
                <input
                  type="number"
                  value={revenueTarget}
                  onChange={(e) => setRevenueTarget(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono-numeric focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold">AI Command Center is Ready:</div>
                <p>Telemetry, leak algorithms, and AI CEO advisors will initialize with these target thresholds calibrated for <strong>{industry}</strong>.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Command Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
