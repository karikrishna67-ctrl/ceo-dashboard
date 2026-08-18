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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode } from '../../types';

export const OnboardingWizardModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, currentOrg, setCurrentOrg, setCurrency } = useApp();
  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState(currentOrg.name);
  const [ceoName, setCeoName] = useState(currentOrg.ceoName || 'Rajesh Sharma');
  const [industry, setIndustry] = useState('B2B Tech & Services');
  const [businessModel, setBusinessModel] = useState<'B2B' | 'B2C' | 'D2C' | 'SaaS'>('B2B');
  const [revenueTarget, setRevenueTarget] = useState(5000000);
  const [chosenCurrency, setChosenCurrency] = useState<CurrencyCode>('INR');

  if (!isOnboardingOpen) return null;

  const handleFinish = () => {
    setCurrentOrg((prev) => ({
      ...prev,
      name: companyName,
      ceoName: ceoName,
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
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs">
              CEO
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Executive Setup Wizard</h2>
              <p className="text-xs text-slate-500">Step {step} of 3 • Customizing intelligence parameters</p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Enterprise Identity & Leadership</h3>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Vertical</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="B2B Tech & Services">B2B Tech & Enterprise Services</option>
                  <option value="SaaS & Cloud Software">SaaS & Cloud Software</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                  <option value="D2C & Retail">D2C & E-Commerce Retail</option>
                </select>
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
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        businessModel === bm
                          ? 'bg-slate-900 text-white border-slate-900'
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
                <p>Telemetry, leak algorithms, and AI CEO advisors will initialize with these target thresholds.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
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
