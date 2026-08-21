import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  Percent,
  Clock,
  Briefcase,
  Check,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  Download,
  ShieldCheck,
  Scale,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { INDUSTRY_SECTORS, IndustrySector } from '../../data/industrySectors';
import { SECTOR_GROUPS } from './IndustryReportsExplorer';

interface SectorComparisonViewProps {
  initialSectorA?: IndustrySector;
  initialSectorB?: IndustrySector;
  currentOrgIndustry: string;
  onSelectActiveIndustry: (sector: IndustrySector) => void;
  currency: string;
  addToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error', title?: string) => void;
}

export const SectorComparisonView: React.FC<SectorComparisonViewProps> = ({
  initialSectorA,
  initialSectorB,
  currentOrgIndustry,
  onSelectActiveIndustry,
  currency,
  addToast,
}) => {
  // Default Sector A to current org or Technology & Software
  const [sectorAId, setSectorAId] = useState<string>(() => {
    if (initialSectorA) return initialSectorA.id;
    const match = INDUSTRY_SECTORS.find((s) => s.name === currentOrgIndustry);
    return match ? match.id : INDUSTRY_SECTORS[0].id;
  });

  // Default Sector B to Healthcare & Life Sciences or another distinct sector
  const [sectorBId, setSectorBId] = useState<string>(() => {
    if (initialSectorB && initialSectorB.id !== (initialSectorA?.id || 'technology-software')) {
      return initialSectorB.id;
    }
    const defaultB = INDUSTRY_SECTORS.find((s) => s.id !== sectorAId);
    return defaultB ? defaultB.id : 'healthcare-lifesciences';
  });

  const sectorA = useMemo(() => {
    return INDUSTRY_SECTORS.find((s) => s.id === sectorAId) || INDUSTRY_SECTORS[0];
  }, [sectorAId]);

  const sectorB = useMemo(() => {
    return INDUSTRY_SECTORS.find((s) => s.id === sectorBId) || INDUSTRY_SECTORS[1] || INDUSTRY_SECTORS[0];
  }, [sectorBId]);

  // Quick swap handler
  const handleSwapSectors = () => {
    const temp = sectorAId;
    setSectorAId(sectorBId);
    setSectorBId(temp);
    addToast(`Swapped comparison: ${sectorB.name} vs ${sectorA.name}`, 'info');
  };

  // Preset comparison pairs
  const comparisonPresets = [
    { label: 'SaaS Tech vs Healthcare', idA: 'technology-software', idB: 'healthcare-lifesciences' },
    { label: 'FinTech vs Retail Commerce', idA: 'financial-services-fintech', idB: 'retail-consumer-ecommerce' },
    { label: 'Manufacturing vs CleanTech Energy', idA: 'manufacturing-industrial', idB: 'energy-utilities-cleantech' },
    { label: 'Professional Services vs EdTech', idA: 'professional-consulting-legal', idB: 'education-edtech' },
    { label: 'Media & Entertainment vs Telecom', idA: 'media-entertainment-gaming', idB: 'telecommunications-networking' },
  ];

  // Calculated KPI gaps
  const grossMarginGap = sectorB.benchmarkGrossMargin - sectorA.benchmarkGrossMargin;
  const ltvCacGap = Number((sectorB.benchmarkCACtoLTV - sectorA.benchmarkCACtoLTV).toFixed(2));
  const salesCycleGap = sectorB.typicalSalesCycleDays - sectorA.typicalSalesCycleDays;
  const subIndustriesGap = sectorB.subIndustriesCount - sectorA.subIndustriesCount;

  // Normalized Radar/Bar metrics comparison data
  const chartComparisonData = [
    {
      metric: 'Gross Margin',
      metricLabel: 'Gross Margin (%)',
      sectorAValue: sectorA.benchmarkGrossMargin,
      sectorBValue: sectorB.benchmarkGrossMargin,
      unit: '%',
      delta: grossMarginGap,
    },
    {
      metric: 'LTV : CAC Ratio',
      metricLabel: 'LTV : CAC (x10 scale)',
      sectorAValue: sectorA.benchmarkCACtoLTV * 10,
      sectorBValue: sectorB.benchmarkCACtoLTV * 10,
      rawA: `${sectorA.benchmarkCACtoLTV}x`,
      rawB: `${sectorB.benchmarkCACtoLTV}x`,
      unit: 'x',
      delta: ltvCacGap,
    },
    {
      metric: 'Sales Velocity (120-Day Inverted)',
      metricLabel: 'Sales Velocity Pacing',
      sectorAValue: Math.max(10, 120 - sectorA.typicalSalesCycleDays),
      sectorBValue: Math.max(10, 120 - sectorB.typicalSalesCycleDays),
      rawA: `${sectorA.typicalSalesCycleDays}d`,
      rawB: `${sectorB.typicalSalesCycleDays}d`,
      unit: 'd',
      delta: salesCycleGap,
    },
    {
      metric: 'Sub-Industries Count',
      metricLabel: 'Sub-Industry Breadth',
      sectorAValue: sectorA.subIndustriesCount * 10,
      sectorBValue: sectorB.subIndustriesCount * 10,
      rawA: `${sectorA.subIndustriesCount} domains`,
      rawB: `${sectorB.subIndustriesCount} domains`,
      unit: '',
      delta: subIndustriesGap,
    },
  ];

  // Export comparison data to CSV
  const handleExportComparisonCSV = () => {
    const rows = [
      ['EXECUTIVE SECTOR COMPARISON DOSSIER'],
      ['Comparison Date', new Date().toISOString().split('T')[0]],
      ['Sector A (Primary)', sectorA.name],
      ['Sector B (Comparative)', sectorB.name],
      [''],
      ['METRIC', `${sectorA.name} (A)`, `${sectorB.name} (B)`, 'DELTA (B - A)', 'STRATEGIC IMPACT'],
      [
        'Benchmark Gross Margin (%)',
        `${sectorA.benchmarkGrossMargin}%`,
        `${sectorB.benchmarkGrossMargin}%`,
        `${grossMarginGap > 0 ? '+' : ''}${grossMarginGap}%`,
        grossMarginGap > 0 ? `${sectorB.name} has higher unit economics margin` : `${sectorA.name} has higher margin resilience`,
      ],
      [
        'Benchmark CAC to LTV Ratio',
        `${sectorA.benchmarkCACtoLTV}x`,
        `${sectorB.benchmarkCACtoLTV}x`,
        `${ltvCacGap > 0 ? '+' : ''}${ltvCacGap}x`,
        ltvCacGap > 0 ? `${sectorB.name} generates more lifetime value per acquisition rupee` : `${sectorA.name} has superior acquisition leverage`,
      ],
      [
        'Typical Sales Cycle',
        `${sectorA.typicalSalesCycleDays} Days`,
        `${sectorB.typicalSalesCycleDays} Days`,
        `${salesCycleGap > 0 ? '+' : ''}${salesCycleGap} Days`,
        salesCycleGap < 0 ? `${sectorB.name} closes deals ${Math.abs(salesCycleGap)} days faster` : `${sectorA.name} closes deals ${salesCycleGap} days faster`,
      ],
      [
        'Sub-Industry Domains Count',
        `${sectorA.subIndustriesCount} domains`,
        `${sectorB.subIndustriesCount} domains`,
        `${subIndustriesGap > 0 ? '+' : ''}${subIndustriesGap}`,
        'Domain Specialization Coverage',
      ],
      [''],
      ['SECTOR A EXTRACTED SUB-INDUSTRIES', sectorA.subIndustries.join('; ')],
      ['SECTOR B EXTRACTED SUB-INDUSTRIES', sectorB.subIndustries.join('; ')],
    ];

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Sector_Comparison_${sectorA.name.replace(/\s+/g, '_')}_vs_${sectorB.name.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Downloaded Side-by-Side Comparison CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Presets */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Sector Benchmark Comparison Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                23 Master Domains Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select two industry sectors to analyze variance in sub-industry specialization breadth, gross margins, CAC efficiency, and sales velocity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportComparisonCSV}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Comparison CSV</span>
            </button>
            <button
              type="button"
              onClick={handleSwapSectors}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Swap Sector A and Sector B positions"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Swap Sectors</span>
            </button>
          </div>
        </div>

        {/* Quick Comparison Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Presets:
          </span>
          {comparisonPresets.map((preset, idx) => {
            const isCurrentPair =
              (sectorAId === preset.idA && sectorBId === preset.idB) ||
              (sectorAId === preset.idB && sectorBId === preset.idA);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSectorAId(preset.idA);
                  setSectorBId(preset.idB);
                  addToast(`Loaded preset comparison: ${preset.label}`, 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-medium border transition-all cursor-pointer ${
                  isCurrentPair
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dual Sector Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Sector A Selector Box */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Primary Sector (A)</span>
              </label>
              {sectorA.name === currentOrgIndustry && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                  Active Org Sector
                </span>
              )}
            </div>
            <select
              value={sectorAId}
              onChange={(e) => setSectorAId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.subIndustriesCount} domains • {s.benchmarkGrossMargin}% Margin)
                </option>
              ))}
            </select>
          </div>

          {/* Sector B Selector Box */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Comparative Sector (B)</span>
              </label>
              {sectorB.name === currentOrgIndustry && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                  Active Org Sector
                </span>
              )}
            </div>
            <select
              value={sectorBId}
              onChange={(e) => setSectorBId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
            >
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.subIndustriesCount} domains • {s.benchmarkGrossMargin}% Margin)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Header Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector A Overview Banner */}
        <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">
                  A
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Primary Domain
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                {sectorA.subIndustriesCount} Extracted Domains
              </span>
            </div>

            <h4 className="text-lg font-black text-slate-900 mt-2">{sectorA.name}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sectorA.description}</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Gross Margin</span>
                <span className="font-black text-slate-900 font-mono-numeric text-sm">
                  {sectorA.benchmarkGrossMargin}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">LTV:CAC</span>
                <span className="font-black text-emerald-700 font-mono-numeric text-sm">
                  {sectorA.benchmarkCACtoLTV}x
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Sales Cycle</span>
                <span className="font-black text-slate-900 font-mono-numeric text-sm">
                  {sectorA.typicalSalesCycleDays}d
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectActiveIndustry(sectorA)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sectorA.name === currentOrgIndustry
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {sectorA.name === currentOrgIndustry ? 'Current Org Calibration' : 'Set as Org Sector'}
            </button>
          </div>
        </div>

        {/* Sector B Overview Banner */}
        <div className="bg-white border-2 border-amber-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center">
                  B
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Comparative Domain
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200">
                {sectorB.subIndustriesCount} Extracted Domains
              </span>
            </div>

            <h4 className="text-lg font-black text-slate-900 mt-2">{sectorB.name}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sectorB.description}</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Gross Margin</span>
                <span className="font-black text-slate-900 font-mono-numeric text-sm">
                  {sectorB.benchmarkGrossMargin}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">LTV:CAC</span>
                <span className="font-black text-emerald-700 font-mono-numeric text-sm">
                  {sectorB.benchmarkCACtoLTV}x
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Sales Cycle</span>
                <span className="font-black text-slate-900 font-mono-numeric text-sm">
                  {sectorB.typicalSalesCycleDays}d
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectActiveIndustry(sectorB)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sectorB.name === currentOrgIndustry
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {sectorB.name === currentOrgIndustry ? 'Current Org Calibration' : 'Set as Org Sector'}
            </button>
          </div>
        </div>
      </div>

      {/* 4-KPI Gap Analysis Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Margin Gap */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-blue-600" />
              Gross Margin Delta
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                grossMarginGap > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : grossMarginGap < 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {grossMarginGap > 0 ? `+${grossMarginGap}% (B leads)` : grossMarginGap < 0 ? `${grossMarginGap}% (A leads)` : 'Parity'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector A</div>
              <div className="text-base font-black text-blue-700 font-mono-numeric">
                {sectorA.benchmarkGrossMargin}%
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300">vs</div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector B</div>
              <div className="text-base font-black text-amber-600 font-mono-numeric">
                {sectorB.benchmarkGrossMargin}%
              </div>
            </div>
          </div>

          {/* Dual bar scale */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, sectorA.benchmarkGrossMargin)}%` }}
              />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, sectorB.benchmarkGrossMargin)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: LTV : CAC Gap */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              LTV : CAC Standard
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                ltvCacGap > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : ltvCacGap < 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {ltvCacGap > 0 ? `+${ltvCacGap}x (B leads)` : ltvCacGap < 0 ? `${ltvCacGap}x (A leads)` : 'Parity'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector A</div>
              <div className="text-base font-black text-blue-700 font-mono-numeric">
                {sectorA.benchmarkCACtoLTV}x
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300">vs</div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector B</div>
              <div className="text-base font-black text-amber-600 font-mono-numeric">
                {sectorB.benchmarkCACtoLTV}x
              </div>
            </div>
          </div>

          {/* Dual bar scale */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorA.benchmarkCACtoLTV / 5) * 100)}%` }}
              />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorB.benchmarkCACtoLTV / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Sales Velocity Gap */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Sales Cycle Velocity
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                salesCycleGap < 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : salesCycleGap > 0
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {salesCycleGap < 0
                ? `${Math.abs(salesCycleGap)}d faster (B)`
                : salesCycleGap > 0
                ? `${salesCycleGap}d faster (A)`
                : 'Identical'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector A</div>
              <div className="text-base font-black text-blue-700 font-mono-numeric">
                {sectorA.typicalSalesCycleDays} Days
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300">vs</div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector B</div>
              <div className="text-base font-black text-amber-600 font-mono-numeric">
                {sectorB.typicalSalesCycleDays} Days
              </div>
            </div>
          </div>

          {/* Dual bar scale */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorA.typicalSalesCycleDays / 120) * 100)}%` }}
              />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorB.typicalSalesCycleDays / 120) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Sub-Industry Breadth Gap */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Domain Breadth
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700">
              {subIndustriesGap > 0
                ? `+${subIndustriesGap} domains (B)`
                : subIndustriesGap < 0
                ? `+${Math.abs(subIndustriesGap)} domains (A)`
                : 'Equal Breadth'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector A</div>
              <div className="text-base font-black text-blue-700 font-mono-numeric">
                {sectorA.subIndustriesCount}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300">vs</div>
            <div className="text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Sector B</div>
              <div className="text-base font-black text-amber-600 font-mono-numeric">
                {sectorB.subIndustriesCount}
              </div>
            </div>
          </div>

          {/* Dual bar scale */}
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorA.subIndustriesCount / 7) * 100)}%` }}
              />
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (sectorB.subIndustriesCount / 7) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart Comparison: Side-by-Side Normalized Recharts Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-black text-slate-900">
              Comparative Benchmark Variance Visualizer
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side metric comparison across Gross Margin, Lifetime Value leverage, Sales Cycle Velocity, and Domain Breadth.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600" />
              <span className="text-slate-800">{sectorA.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span className="text-slate-800">{sectorB.name}</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={6}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit=" pts"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs z-50">
                        <div className="font-bold text-white text-xs border-b border-slate-800 pb-1 mb-2">
                          {data.metric}
                        </div>
                        <div className="space-y-1 text-slate-300 text-[11px]">
                          <div className="flex justify-between items-center text-blue-300 font-bold">
                            <span>{sectorA.name}:</span>
                            <span>{data.rawA || `${data.sectorAValue}${data.unit}`}</span>
                          </div>
                          <div className="flex justify-between items-center text-amber-300 font-bold">
                            <span>{sectorB.name}:</span>
                            <span>{data.rawB || `${data.sectorBValue}${data.unit}`}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                            <span>Variance (B - A):</span>
                            <span className="font-mono-numeric font-bold text-white">
                              {data.delta > 0 ? `+${data.delta}` : data.delta} {data.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (value === 'sectorAValue' ? sectorA.name : sectorB.name)}
              />
              <Bar dataKey="sectorAValue" name="sectorAValue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sectorBValue" name="sectorBValue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Sub-Industry Distribution Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-slate-900">
              Sub-Industry Specialization Distribution (Side-by-Side)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct parallel listing of all extracted domain specializations across both sectors.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Unique Domains: {sectorA.subIndustriesCount + sectorB.subIndustriesCount}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector A Sub-Industries List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  A
                </span>
                <span className="text-xs font-black text-blue-950">{sectorA.name}</span>
              </div>
              <span className="text-[11px] font-bold text-blue-800">
                {sectorA.subIndustriesCount} Domains
              </span>
            </div>

            <div className="space-y-1.5">
              {sectorA.subIndustries.map((domain, idx) => (
                <div
                  key={idx}
                  className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{domain}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Domain {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector B Sub-Industries List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  B
                </span>
                <span className="text-xs font-black text-amber-950">{sectorB.name}</span>
              </div>
              <span className="text-[11px] font-bold text-amber-800">
                {sectorB.subIndustriesCount} Domains
              </span>
            </div>

            <div className="space-y-1.5">
              {sectorB.subIndustries.map((domain, idx) => (
                <div
                  key={idx}
                  className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{domain}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Domain {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Executive Takeaways & Synthesis */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-black tracking-tight text-white">
            Strategic Executive Synthesis: {sectorA.name} vs {sectorB.name}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Unit Economics Dynamics
            </div>
            <p className="leading-relaxed">
              {grossMarginGap === 0 ? (
                'Both sectors share identical benchmark gross margin requirements.'
              ) : grossMarginGap > 0 ? (
                <>
                  <strong className="text-white">{sectorB.name}</strong> operates with a{' '}
                  <strong className="text-emerald-400">+{grossMarginGap}% higher gross margin</strong> ceiling, requiring leaner COGS management than {sectorA.name}.
                </>
              ) : (
                <>
                  <strong className="text-white">{sectorA.name}</strong> maintains a{' '}
                  <strong className="text-emerald-400">+{Math.abs(grossMarginGap)}% higher gross margin</strong> buffer, providing superior operating leverage.
                </>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Conversion Pacing & Working Capital
            </div>
            <p className="leading-relaxed">
              {salesCycleGap === 0 ? (
                'Both sectors exhibit matching average deal conversion timelines.'
              ) : salesCycleGap < 0 ? (
                <>
                  <strong className="text-white">{sectorB.name}</strong> converts deals{' '}
                  <strong className="text-emerald-400">{Math.abs(salesCycleGap)} days faster</strong>, leading to faster cash flow velocity and shorter payback loops.
                </>
              ) : (
                <>
                  <strong className="text-white">{sectorA.name}</strong> converts pipeline{' '}
                  <strong className="text-blue-300">{salesCycleGap} days faster</strong>, minimizing pipeline stall risk compared to {sectorB.name}.
                </>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Cross-Sector Growth Opportunities
            </div>
            <p className="leading-relaxed">
              Cross-pollination across <strong className="text-white">{sectorA.subIndustries[0] || sectorA.name}</strong> and{' '}
              <strong className="text-white">{sectorB.subIndustries[0] || sectorB.name}</strong> unlocks hybrid business models with blended LTV:CAC of{' '}
              <strong className="text-amber-400 font-mono-numeric">
                {((sectorA.benchmarkCACtoLTV + sectorB.benchmarkCACtoLTV) / 2).toFixed(1)}x
              </strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
