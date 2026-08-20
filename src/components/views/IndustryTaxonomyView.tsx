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
  FileText,
  Printer,
  BarChart3,
  ArrowUpDown,
  Palette,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { INDUSTRY_SECTORS, IndustrySector } from '../../data/industrySectors';
import { IndustryCategorySelector } from '../common/IndustryCategorySelector';
import { IndustryReportsExplorer, SECTOR_GROUPS } from '../reports/IndustryReportsExplorer';
import { generateIndustryTaxonomyPDF } from '../../utils/industryTaxonomyPdf';

export interface ChartColorTheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  standardColor: string;
  activeColor: string;
  hoverColor: string;
  referenceLineColor: string;
  swatches: string[];
  isDynamicAccent?: boolean;
}

export const CHART_COLOR_THEMES: ChartColorTheme[] = [
  {
    id: 'executive-slate',
    name: 'Executive Slate & Amber',
    shortName: 'Slate & Amber',
    description: 'High-contrast executive theme with warm gold active highlights',
    standardColor: '#334155', // slate-700
    activeColor: '#d97706', // amber-600
    hoverColor: '#0284c7', // sky-600
    referenceLineColor: '#94a3b8',
    swatches: ['#334155', '#d97706'],
  },
  {
    id: 'domain-spectrum',
    name: 'Domain Dynamic Spectrum',
    shortName: 'Category Colors',
    description: 'Each master sector renders in its native industry category accent color',
    standardColor: '#3b82f6',
    activeColor: '#f59e0b',
    hoverColor: '#f43f5e',
    referenceLineColor: '#cbd5e1',
    swatches: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    isDynamicAccent: true,
  },
  {
    id: 'emerald-growth',
    name: 'Emerald & Mint Growth',
    shortName: 'Emerald Growth',
    description: 'Prosperity emerald palette with amber active anchor',
    standardColor: '#059669', // emerald-600
    activeColor: '#d97706', // amber-600
    hoverColor: '#10b981', // emerald-500
    referenceLineColor: '#6ee7b7',
    swatches: ['#059669', '#d97706'],
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo & Pink',
    shortName: 'Royal Indigo',
    description: 'Tech SaaS aesthetic with vibrant pink active highlights',
    standardColor: '#4f46e5', // indigo-600
    activeColor: '#ec4899', // pink-500
    hoverColor: '#818cf8', // indigo-400
    referenceLineColor: '#c7d2fe',
    swatches: ['#4f46e5', '#ec4899'],
  },
  {
    id: 'ocean-sky',
    name: 'Ocean Sky & Orange',
    shortName: 'Ocean Sky',
    description: 'Clean modern blue gradient with punchy orange focus',
    standardColor: '#0284c7', // sky-600
    activeColor: '#ea580c', // orange-600
    hoverColor: '#38bdf8', // sky-400
    referenceLineColor: '#bae6fd',
    swatches: ['#0284c7', '#ea580c'],
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Rose & Gold',
    shortName: 'Crimson Rose',
    description: 'Bold luxury crimson tone with radiant gold accents',
    standardColor: '#e11d48', // rose-600
    activeColor: '#f59e0b', // amber-500
    hoverColor: '#fb7185', // rose-400
    referenceLineColor: '#fecdd3',
    swatches: ['#e11d48', '#f59e0b'],
  },
  {
    id: 'cyber-violet',
    name: 'Cyber Violet & Cyan',
    shortName: 'Violet & Cyan',
    description: 'Frontier deep violet with glowing electric cyan active bar',
    standardColor: '#7c3aed', // violet-600
    activeColor: '#06b6d4', // cyan-500
    hoverColor: '#a78bfa', // violet-400
    referenceLineColor: '#ddd6fe',
    swatches: ['#7c3aed', '#06b6d4'],
  },
  {
    id: 'monochrome',
    name: 'Monochrome Minimal',
    shortName: 'Monochrome',
    description: 'Ultra-clean graphite and neutral slate contrast',
    standardColor: '#1e293b', // slate-800
    activeColor: '#0284c7', // sky-600
    hoverColor: '#475569', // slate-600
    referenceLineColor: '#94a3b8',
    swatches: ['#1e293b', '#0284c7'],
  },
];

export const IndustryTaxonomyView: React.FC = () => {
  const {
    currentOrg,
    setCurrentOrg,
    setActiveView,
    currency,
    addToast,
    syncedTaxonomy,
    syncTaxonomyToDashboard,
    clearSyncedTaxonomy,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'VISUAL_CARDS' | 'ALL_DOMAINS'>('EXPLORER');
  const [selectedSector, setSelectedSector] = useState<IndustrySector | null>(() => {
    return INDUSTRY_SECTORS.find((s) => s.name === currentOrg.industry) || INDUSTRY_SECTORS[0];
  });
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [chartSortMode, setChartSortMode] = useState<'default' | 'count-desc' | 'margin-desc'>('default');
  const [selectedColorTheme, setSelectedColorTheme] = useState<string>('executive-slate');
  const [hoveredSectorId, setHoveredSectorId] = useState<string | null>(null);

  const activeTheme = useMemo(() => {
    return CHART_COLOR_THEMES.find((t) => t.id === selectedColorTheme) || CHART_COLOR_THEMES[0];
  }, [selectedColorTheme]);

  const totalSubIndustries = useMemo(() => {
    return INDUSTRY_SECTORS.reduce((acc, s) => acc + s.subIndustriesCount, 0);
  }, []);

  const avgSubIndustries = useMemo(() => {
    return (totalSubIndustries / (INDUSTRY_SECTORS.length || 1)).toFixed(1);
  }, [totalSubIndustries]);

  // Filtered Master Sectors based on dedicated search input
  const filteredMasterSectors = useMemo(() => {
    if (!searchQuery.trim()) return INDUSTRY_SECTORS;
    const q = searchQuery.toLowerCase().trim();
    return INDUSTRY_SECTORS.filter((sector) => {
      const matchName = sector.name.toLowerCase().includes(q);
      const matchDesc = sector.description.toLowerCase().includes(q);
      const matchSub = sector.subIndustries.some((sub) => sub.toLowerCase().includes(q));
      const matchId = sector.id.toLowerCase().includes(q);
      return matchName || matchDesc || matchSub || matchId;
    });
  }, [searchQuery]);

  // Aggregate KPI & Benchmark statistics calculated across currently filtered master sectors
  const aggregateData = useMemo(() => {
    const sectors = filteredMasterSectors.length > 0 ? filteredMasterSectors : INDUSTRY_SECTORS;
    const count = sectors.length || 1;
    const avgMargin = Math.round(sectors.reduce((sum, s) => sum + s.benchmarkGrossMargin, 0) / count);
    const avgLTV = Number((sectors.reduce((sum, s) => sum + s.benchmarkCACtoLTV, 0) / count).toFixed(1));
    const avgDays = Math.round(sectors.reduce((sum, s) => sum + s.typicalSalesCycleDays, 0) / count);
    const totalSub = sectors.reduce((sum, s) => sum + s.subIndustriesCount, 0);

    const highestMargin = [...sectors].sort((a, b) => b.benchmarkGrossMargin - a.benchmarkGrossMargin)[0] || sectors[0];
    const fastestCycle = [...sectors].sort((a, b) => a.typicalSalesCycleDays - b.typicalSalesCycleDays)[0] || sectors[0];

    return {
      avgGrossMargin: avgMargin,
      avgCACtoLTV: avgLTV,
      avgSalesCycleDays: avgDays,
      totalDomains: totalSub,
      highestMarginSector: { name: highestMargin.name, margin: highestMargin.benchmarkGrossMargin },
      fastestCycleSector: { name: fastestCycle.name, days: fastestCycle.typicalSalesCycleDays },
    };
  }, [filteredMasterSectors]);

  const isCurrentFilterSynced = useMemo(() => {
    if (!syncedTaxonomy) return false;
    return (
      syncedTaxonomy.searchQuery === searchQuery.trim() &&
      syncedTaxonomy.totalFilteredSectors === filteredMasterSectors.length
    );
  }, [syncedTaxonomy, searchQuery, filteredMasterSectors.length]);

  const handleSyncToDashboard = (navigateImmediately = false) => {
    const currentActiveSector = selectedSector || (INDUSTRY_SECTORS.find((s) => s.name === currentOrg.industry) || INDUSTRY_SECTORS[0]);
    const payload = {
      lastSyncedAt: new Date().toISOString(),
      searchQuery: searchQuery.trim(),
      selectedSectorId: currentActiveSector.id,
      selectedSectorName: currentActiveSector.name,
      totalFilteredSectors: filteredMasterSectors.length,
      totalSubIndustriesCount: aggregateData.totalDomains,
      activeColorThemeId: selectedColorTheme,
      chartSortMode,
      matchedSectorNames: filteredMasterSectors.map((s) => s.name),
      aggregateMetrics: aggregateData,
    };

    syncTaxonomyToDashboard(payload, navigateImmediately);
  };

  // Aggregate sub-industries per master domain for the Recharts visualization (reacts to search)
  const chartData = useMemo(() => {
    const sourceSectors = filteredMasterSectors.length > 0 ? filteredMasterSectors : INDUSTRY_SECTORS;
    const data = sourceSectors.map((sector) => {
      const isCurrentActive = (currentOrg.industry || '').trim().toLowerCase() === sector.name.trim().toLowerCase();
      // Form a clean short label for display on the x-axis
      let shortLabel = sector.name
        .replace('& Software', '')
        .replace('& Technology', '')
        .replace('& Services', '')
        .replace('& Logistics', '')
        .replace('& Pharmaceuticals', '')
        .replace('& Construction', '')
        .replace('& Dining', '')
        .replace('& Delivery', '')
        .replace('& Defense', '')
        .replace('& Leisure', '')
        .replace('& Utilities', '')
        .replace('& Media', '')
        .replace('& Automotive', '');

      if (shortLabel.length > 13) {
        shortLabel = shortLabel.substring(0, 11) + '..';
      }

      return {
        id: sector.id,
        name: sector.name,
        shortLabel,
        subIndustriesCount: sector.subIndustriesCount,
        benchmarkGrossMargin: sector.benchmarkGrossMargin,
        benchmarkCACtoLTV: sector.benchmarkCACtoLTV,
        typicalSalesCycleDays: sector.typicalSalesCycleDays,
        subIndustries: sector.subIndustries,
        isActive: isCurrentActive,
        accentColor: sector.accentColor || '#3b82f6',
      };
    });

    if (chartSortMode === 'count-desc') {
      return [...data].sort((a, b) => b.subIndustriesCount - a.subIndustriesCount);
    } else if (chartSortMode === 'margin-desc') {
      return [...data].sort((a, b) => b.benchmarkGrossMargin - a.benchmarkGrossMargin);
    }
    return data;
  }, [filteredMasterSectors, currentOrg.industry, chartSortMode]);

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

  const handleExportTaxonomyPDF = () => {
    setIsExportingPdf(true);
    try {
      const isFiltered = searchQuery.trim().length > 0;
      generateIndustryTaxonomyPDF({
        sectors: isFiltered ? filteredMasterSectors : INDUSTRY_SECTORS,
        org: currentOrg,
        filterSummary: isFiltered ? `Master Domain Search Query: "${searchQuery.trim()}"` : undefined,
        reportTitle: isFiltered
          ? `Industry Classification Dossier (${filteredMasterSectors.length} Filtered Sectors)`
          : 'Executive Industry Sector Taxonomy & Domain Benchmarks',
      });
      addToast(
        isFiltered
          ? `Exported ${filteredMasterSectors.length} filtered industry classifications to PDF`
          : 'Exported 23-Sector Taxonomy PDF document for offline executive review',
        'success'
      );
    } catch (error) {
      console.error('Failed to export PDF:', error);
      addToast('Failed to export PDF document. Please retry.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadTaxonomyCSV = () => {
    setIsDownloadingCSV(true);
    try {
      const escapeCSV = (str: string | number | undefined | null): string => {
        if (str === undefined || str === null) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return `"${stringified}"`;
      };

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const isFiltered = searchQuery.trim().length > 0;
      const targetSectors = isFiltered ? filteredMasterSectors : INDUSTRY_SECTORS;
      const totalFilteredSubIndustries = targetSectors.reduce((sum, s) => sum + s.subIndustriesCount, 0);

      const csvRows: string[][] = [
        ['EXECUTIVE INDUSTRY TAXONOMY & CROSS-SECTOR BENCHMARK REPORT'],
        ['Organization', currentOrg.name || 'Executive Organization'],
        ['CEO / Executive Lead', currentOrg.ceoName || 'Rajesh Sharma'],
        ['Active Enterprise Industry Calibration', currentOrg.industry || 'Technology & Software'],
        ['Report Generation Date', dateStr],
        ['Base Currency', currency],
        ['Filter Scope Criteria', isFiltered ? `Filtered by Search: "${searchQuery.trim()}"` : 'All 23 Master Domains (Unfiltered)'],
        ['Master Sectors in Scope', `${targetSectors.length} of ${INDUSTRY_SECTORS.length} Domains`],
        ['Extracted Sub-Industries in Scope', `${totalFilteredSubIndustries} of ${totalSubIndustries} Domains`],
        ['Aggregate Benchmark Gross Margin', `${aggregateData.avgGrossMargin}%`],
        ['Aggregate Benchmark LTV:CAC', `${aggregateData.avgCACtoLTV}x`],
        ['Aggregate Typical Sales Cycle', `${aggregateData.avgSalesCycleDays} Days`],
        ['Highest Margin Sector in Scope', `${aggregateData.highestMarginSector.name} (${aggregateData.highestMarginSector.margin}%)`],
        ['Fastest Sales Cycle Sector in Scope', `${aggregateData.fastestCycleSector.name} (${aggregateData.fastestCycleSector.days} Days)`],
        [''],
        ['MASTER DOMAIN TAXONOMY & CROSS-SECTOR BENCHMARKS'],
        [
          'Sector ID',
          'Industry Sector Name',
          'Status vs Active Org',
          'Sub-Industries Count',
          'Benchmark Gross Margin (%)',
          'Benchmark LTV:CAC Ratio',
          'Typical Sales Cycle (Days)',
          'Extracted Sub-Industry Domains',
          'Sector Scope & Definition',
        ],
        ...targetSectors.map((sector) => [
          sector.id,
          sector.name,
          sector.name === currentOrg.industry ? 'ACTIVE CALIBRATION' : 'Standard Domain',
          sector.subIndustriesCount.toString(),
          `${sector.benchmarkGrossMargin}%`,
          `${sector.benchmarkCACtoLTV}x`,
          `${sector.typicalSalesCycleDays} days`,
          sector.subIndustries.join('; '),
          sector.description,
        ]),
        [''],
        ['GRANULAR SUB-INDUSTRY DOMAIN REGISTRY (NORMALIZED)'],
        [
          'Master Sector Name',
          'Sub-Industry Domain Name',
          'Domain Order Index',
          'Sector Gross Margin Benchmark',
          'Sector LTV:CAC Benchmark',
          'Sector Sales Cycle Benchmark',
        ],
        ...targetSectors.flatMap((sector) =>
          sector.subIndustries.map((sub, idx) => [
            sector.name,
            sub,
            `#${idx + 1}`,
            `${sector.benchmarkGrossMargin}%`,
            `${sector.benchmarkCACtoLTV}x`,
            `${sector.typicalSalesCycleDays} days`,
          ])
        ),
      ];

      const csvContent = csvRows
        .map((row) => row.map((cell) => escapeCSV(cell)).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${(currentOrg.name || 'Executive').replace(/\s+/g, '_')}_Industry_Taxonomy_${
        isFiltered ? 'Filtered_' : '23_Domains_'
      }${dateStr}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast(
        isFiltered
          ? `Exported ${targetSectors.length} filtered master domains (${totalFilteredSubIndustries} sub-industries) to CSV`
          : `Exported full 23-Sector Industry Taxonomy (${totalSubIndustries} sub-industries) to CSV`,
        'success',
        'CSV Export Ready'
      );
    } catch (error) {
      console.error('Failed to export CSV:', error);
      addToast('Failed to export CSV dataset. Please retry.', 'error');
    } finally {
      setIsDownloadingCSV(false);
    }
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
          {/* Sync to Dashboard Button */}
          <button
            type="button"
            onClick={() => handleSyncToDashboard(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ring-1 ring-amber-400/80 hover:shadow-md active:scale-95"
            title="Save sector filters and push current taxonomy aggregates to CEO Command Center"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Sync to Dashboard</span>
          </button>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleDownloadTaxonomyCSV}
            disabled={isDownloadingCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Export filtered master domain benchmarks and extracted sub-industries dataset to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingCSV ? 'Generating CSV...' : 'Export to CSV'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportTaxonomyPDF}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Export full 23-Sector Industry Classification and Benchmarks as a PDF document for offline executive review"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('ai-advisor')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Audit with AI</span>
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

      {/* Dedicated Master Domain Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 23 master domains, sub-industries, or keywords (e.g. Fintech, AI, Solar, Healthcare, Logistics, SaaS)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                searchQuery.trim()
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {filteredMasterSectors.length} of {INDUSTRY_SECTORS.length} Master Domains
              </span>
            </span>

            {/* Quick Push Filter to Dashboard button */}
            <button
              type="button"
              onClick={() => handleSyncToDashboard(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isCurrentFilterSynced
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-900'
              }`}
              title="Push current filtered sector benchmarks and aggregates to CEO Command Center"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isCurrentFilterSynced ? 'Synced to Dashboard' : 'Push to Dashboard'}</span>
            </button>

            {/* Quick Export to CSV */}
            <button
              type="button"
              onClick={handleDownloadTaxonomyCSV}
              disabled={isDownloadingCSV}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-600/60 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Export current filtered master domain & sub-industry dataset to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export to CSV</span>
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Preset Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Quick Filters:</span>
          {[
            { label: 'All 23 Domains', query: '' },
            { label: 'Software & SaaS', query: 'software' },
            { label: 'Fintech & Banking', query: 'fintech' },
            { label: 'Healthcare & Biotech', query: 'health' },
            { label: 'Energy & CleanTech', query: 'energy' },
            { label: 'Manufacturing & Industrial', query: 'manufacturing' },
            { label: 'Logistics & Supply Chain', query: 'logistics' },
            { label: 'E-Commerce & Retail', query: 'retail' },
            { label: 'Defense & Security', query: 'defense' },
            { label: 'Crypto & Blockchain', query: 'crypto' },
          ].map((tag, idx) => {
            const isSelected =
              (tag.query === '' && searchQuery === '') ||
              (tag.query !== '' && searchQuery.toLowerCase() === tag.query.toLowerCase());
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(tag.query)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        {/* Live Matching Badges if filtered */}
        {searchQuery.trim() && filteredMasterSectors.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Matching Sectors:</span>
            {filteredMasterSectors.map((sector) => {
              const isCurrent = currentOrg.industry === sector.name;
              return (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => handleSelectIndustry(sector)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 hover:border-amber-300'
                  }`}
                  title={`Calibrate organization to ${sector.name}`}
                >
                  <span>{sector.name}</span>
                  {isCurrent ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">({sector.subIndustriesCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recharts Bar Chart Visual Summary: Sub-Industries per Master Domain */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-800" />
              <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
                Sub-Industry Distribution by Master Domain
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Mean: {avgSubIndustries} domains / sector
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-level visual summary aggregating {totalSubIndustries} extracted sub-industries across all 23 master domains. Click any bar to calibrate your organization.
            </p>
          </div>

          {/* Sort Controls & Dynamic Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mr-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
              <span
                className="inline-block w-2.5 h-2.5 rounded-xs"
                style={{ backgroundColor: activeTheme.isDynamicAccent ? '#3b82f6' : activeTheme.standardColor }}
              />
              <span>{activeTheme.isDynamicAccent ? 'Category Spectrum' : 'Standard'}</span>
              <span
                className="inline-block w-2.5 h-2.5 rounded-xs ml-1.5"
                style={{ backgroundColor: activeTheme.activeColor }}
              />
              <span className="font-bold text-slate-800">Active Sector</span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setChartSortMode('default')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartSortMode === 'default'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Default taxonomy order"
              >
                Taxonomy
              </button>
              <button
                type="button"
                onClick={() => setChartSortMode('count-desc')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartSortMode === 'count-desc'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by highest number of sub-industries"
              >
                By Domains
              </button>
              <button
                type="button"
                onClick={() => setChartSortMode('margin-desc')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartSortMode === 'margin-desc'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Sort by gross margin baseline"
              >
                By Margin
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Colour Options Palette Picker */}
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-slate-700">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-[11px]">Chart Colour Palette:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-wrap">
            {CHART_COLOR_THEMES.map((theme) => {
              const isSelected = selectedColorTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setSelectedColorTheme(theme.id);
                    addToast(`Applied chart colour theme: ${theme.name}`, 'info');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-slate-300 shadow-2xs ring-1 ring-slate-400/40 font-bold'
                      : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                  title={theme.description}
                >
                  <div className="flex items-center -space-x-0.5">
                    {theme.swatches.slice(0, 3).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-white shadow-2xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span>{theme.shortName}</span>
                  {isSelected && <Check className="w-3 h-3 text-slate-800" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredSectorId(state.activePayload[0].payload.id);
                }
              }}
              onMouseLeave={() => setHoveredSectorId(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                interval={0}
                angle={-38}
                textAnchor="end"
                height={55}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickMargin={4}
              />
              <YAxis
                domain={[0, 7]}
                ticks={[0, 2, 4, 6]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit=" dom"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs z-50">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                          <span className="font-bold text-white text-xs">{data.name}</span>
                          {data.isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              Active Sector
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 text-slate-300 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Extracted Domains:</span>
                            <span className="font-bold text-amber-400 font-mono-numeric">{data.subIndustriesCount} Sub-Industries</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gross Margin Baseline:</span>
                            <span className="font-bold text-emerald-400 font-mono-numeric">{data.benchmarkGrossMargin}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">LTV : CAC Standard:</span>
                            <span className="font-bold text-white font-mono-numeric">{data.benchmarkCACtoLTV}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sales Cycle Pacing:</span>
                            <span className="font-bold text-slate-200 font-mono-numeric">{data.typicalSalesCycleDays} Days</span>
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">Specializations: </span>
                            {data.subIndustries.slice(0, 3).join(', ')}
                            {data.subIndustries.length > 3 && ` (+${data.subIndustries.length - 3} more)`}
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-amber-400 font-semibold text-center">
                          Click bar to calibrate organization to this sector
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={Number(avgSubIndustries)}
                stroke={activeTheme.referenceLineColor || '#94a3b8'}
                strokeDasharray="4 4"
                label={{
                  value: `Mean: ${avgSubIndustries}`,
                  position: 'insideTopRight',
                  fill: '#64748b',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Bar
                dataKey="subIndustriesCount"
                radius={[4, 4, 0, 0]}
                onClick={(entry: any) => {
                  const target = INDUSTRY_SECTORS.find((s) => s.id === entry.id || s.name === entry.name);
                  if (target) {
                    handleSelectIndustry(target);
                  }
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry) => {
                  let fillColor = activeTheme.standardColor;
                  if (activeTheme.isDynamicAccent && entry.accentColor) {
                    fillColor = entry.accentColor;
                  }

                  if (entry.isActive) {
                    fillColor = activeTheme.activeColor;
                  } else if (hoveredSectorId === entry.id) {
                    fillColor = activeTheme.hoverColor;
                  }

                  return (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={fillColor}
                      stroke={entry.isActive ? '#1e293b' : 'transparent'}
                      strokeWidth={entry.isActive ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
        <IndustryReportsExplorer
          onSelectSector={handleSelectIndustry}
          externalSearchQuery={searchQuery}
        />
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
            externalSearchQuery={searchQuery}
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportTaxonomyPDF}
                disabled={isExportingPdf}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                title="Export complete 23-sector taxonomy catalog as a PDF document"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExportingPdf ? 'Exporting PDF...' : 'Export PDF Document'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTaxonomyCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMasterSectors.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 space-y-3">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No matching master domains found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No industry sector or sub-industry matches your search query "{searchQuery}". Try a different keyword or reset your search filter.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredMasterSectors.map((sector, index) => {
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
