import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Sparkles,
  Building2,
  SlidersHorizontal,
  TrendingUp,
  Percent,
  Clock,
  Briefcase,
  Eye,
  Check,
  X,
  RefreshCw,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INDUSTRY_SECTORS, IndustrySector } from '../../data/industrySectors';
import { IndustryCategorySelector } from '../common/IndustryCategorySelector';
import { IndustryReportsExplorer, SECTOR_GROUPS } from '../reports/IndustryReportsExplorer';

export const IndustryTaxonomyView: React.FC = () => {
  const { currentOrg, setCurrentOrg, setActiveView, currency, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'VISUAL_CARDS' | 'ALL_DOMAINS'>('EXPLORER');
  const [selectedSector, setSelectedSector] = useState<IndustrySector | null>(() => {
    return INDUSTRY_SECTORS.find((s) => s.name === currentOrg.industry) || INDUSTRY_SECTORS[0];
  });

  const totalSubIndustries = useMemo(() => {
    return INDUSTRY_SECTORS.reduce((acc, s) => acc + s.subIndustriesCount, 0);
  }, []);

  const currentSectorData = useMemo(() => {
    return INDUSTRY_SECTORS.find((s) => s.name === (currentOrg.industry || 'Technology & Software')) || INDUSTRY_SECTORS[0];
  }, [currentOrg.industry]);

  const handleSelectIndustry = (sector: IndustrySector) => {
    setSelectedSector(sector);
    setCurrentOrg((prev) => ({
      ...prev,
      industry: sector.name,
    }));
    addToast(`Calibrated enterprise benchmarks to ${sector.name}`, 'success');
  };

  const handleDownloadTaxonomyCSV = () => {
    const headers = [
      'Industry Sector',
      'Sub-Industries Count',
      'Benchmark Gross Margin (%)',
      'Benchmark CAC to LTV',
      'Typical Sales Cycle (Days)',
      'Extracted Sub-Industry Domains',
      'Description',
    ];

    const rows = INDUSTRY_SECTORS.map((s) => [
      `"${s.name}"`,
      s.subIndustriesCount,
      `${s.benchmarkGrossMargin}%`,
      `${s.benchmarkCACtoLTV}x`,
      `${s.typicalSalesCycleDays} days`,
      `"${s.subIndustries.join('; ')}"`,
      `"${s.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Industry_Sector_Taxonomy_23_Domains.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Downloaded 23-Sector Taxonomy CSV Report', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-600" />
              <span>Industry Sector Taxonomy</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              23 Master Domains
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Enterprise sector classification, {totalSubIndustries} extracted sub-industry domains, gross margin baselines, and LTV:CAC efficiency standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTaxonomyCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Taxonomy (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('ai-advisor')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit with AI Advisor</span>
          </button>
        </div>
      </div>

      {/* Sector Summary & Active Org Calibration Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Master Sectors</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1 flex items-center justify-between">
            <span>23 Sectors</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-sans font-bold border border-blue-200">
              Complete
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Covering tech, industrial, commerce & emerging</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Extracted Domains</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1 flex items-center justify-between">
            <span>{totalSubIndustries} Sub-Industries</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-sans font-bold border border-emerald-200">
              4-6 per sector
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Granular specialization mappings</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Org Sector</span>
          <div className="text-base font-bold text-slate-900 mt-1 truncate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{currentOrg.industry || 'Technology & Software'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Target Gross Margin: <strong>{currentSectorData.benchmarkGrossMargin}%</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LTV:CAC & Sales Cycle</span>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-1 flex items-center justify-between">
            <span>{currentSectorData.benchmarkCACtoLTV}x</span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {currentSectorData.typicalSalesCycleDays}d Cycle
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Sector baseline efficiency standard</div>
        </div>
      </div>

      {/* Navigation View Mode Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('EXPLORER')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'EXPLORER'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Interactive Directory & Multi-Select Filters</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VISUAL_CARDS')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'VISUAL_CARDS'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Visual Category Cards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALL_DOMAINS')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ALL_DOMAINS'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>All {totalSubIndustries} Extracted Sub-Industries</span>
        </button>
      </div>

      {/* Tab 1: Interactive Directory with Search & Multi-Select Filter Controls */}
      {activeTab === 'EXPLORER' && (
        <IndustryReportsExplorer onSelectSector={handleSelectIndustry} />
      )}

      {/* Tab 2: Visual Category Cards & Inspector */}
      {activeTab === 'VISUAL_CARDS' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Visual Industry Category Cards (23 Master Domains)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click "Select Category" on any sector to set active operational benchmark metrics.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-600">
              Active: <span className="text-amber-800 font-black">{currentOrg.industry}</span>
            </div>
          </div>

          <IndustryCategorySelector
            selectedIndustry={currentOrg.industry}
            onSelectIndustry={handleSelectIndustry}
            layout="grid"
            showDetailsModal={true}
          />
        </div>
      )}

      {/* Tab 3: Complete Domain-by-Domain Comprehensive Breakdown */}
      {activeTab === 'ALL_DOMAINS' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                All 23 Sectors & {totalSubIndustries} Extracted Sub-Industry Domains
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full catalog of every industry domain specialization with sector targets.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTaxonomyCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Complete Catalog</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INDUSTRY_SECTORS.map((sector, index) => {
              const isCurrent = currentOrg.industry === sector.name;
              return (
                <div
                  key={sector.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-black text-slate-900">{sector.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-slate-700 border border-slate-200">
                        {sector.subIndustriesCount} Domains
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {sector.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                    <div>
                      Gross Margin: <strong className="text-slate-900 font-mono-numeric">{sector.benchmarkGrossMargin}%</strong>
                    </div>
                    <div>
                      LTV:CAC: <strong className="text-emerald-700 font-mono-numeric">{sector.benchmarkCACtoLTV}x</strong>
                    </div>
                    <div>
                      Sales Cycle: <strong className="text-slate-900 font-mono-numeric">{sector.typicalSalesCycleDays}d</strong>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {sector.subIndustries.map((sub, i) => (
                      <div
                        key={i}
                        className="p-1.5 px-2 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-800 flex items-center justify-between"
                      >
                        <span className="font-medium flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          {sub}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Domain {i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectIndustry(sector)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 hover:bg-slate-900 hover:text-white text-slate-800'
                      }`}
                    >
                      {isCurrent ? <Check className="w-3 h-3" /> : null}
                      <span>{isCurrent ? 'Calibrated Active Sector' : 'Set as Active Sector'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
