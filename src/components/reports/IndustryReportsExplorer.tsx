import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Check,
  CheckSquare,
  Square,
  Layers,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Percent,
  Building2,
  Film,
  Zap,
  Factory,
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plane,
  Truck,
  Code,
  Sprout,
  Shirt,
  Dumbbell,
  ShieldAlert,
  Package,
  Gem,
  Home,
  Smartphone,
  Gamepad2,
  Coins,
  Rocket,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { INDUSTRY_SECTORS, IndustrySector } from '../../data/industrySectors';
import { useApp } from '../../context/AppContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Film,
  Zap,
  Factory,
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plane,
  Truck,
  Code,
  Sprout,
  Shirt,
  Dumbbell,
  ShieldAlert,
  Package,
  Gem,
  Home,
  Smartphone,
  Gamepad2,
  Coins,
  Rocket,
};

export interface SectorGroupDefinition {
  id: string;
  label: string;
  badgeClass: string;
  sectorIds: string[];
}

export const SECTOR_GROUPS: SectorGroupDefinition[] = [
  {
    id: 'tech-digital',
    label: 'Tech & Digital',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    sectorIds: ['technology-software', 'finance-fintech', 'education-edtech', 'blockchain-crypto', 'gaming-esports'],
  },
  {
    id: 'industrial-supply',
    label: 'Industrial & Supply',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    sectorIds: ['infrastructure-logistics', 'manufacturing', 'logistics-transportation', 'energy-emerging-sectors', 'printing-packaging', 'security-defense'],
  },
  {
    id: 'commerce-retail',
    label: 'Commerce & Retail',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    sectorIds: ['retail-ecommerce', 'food-beverage', 'fashion-lifestyle', 'jewelry-precious-metals', 'home-services', 'electronics-gadgets', 'travel-hospitality', 'healthcare-wellness', 'fitness-sports', 'agriculture-agritech'],
  },
  {
    id: 'emerging-frontier',
    label: 'Emerging & Frontier',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sectorIds: ['other-emerging-industries', 'blockchain-crypto', 'energy-emerging-sectors', 'gaming-esports'],
  },
  {
    id: 'media-creative',
    label: 'Media & Creative',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    sectorIds: ['media-entertainment', 'gaming-esports', 'fashion-lifestyle'],
  },
];

interface IndustryReportsExplorerProps {
  onSelectSector?: (sector: IndustrySector) => void;
}

export const IndustryReportsExplorer: React.FC<IndustryReportsExplorerProps> = ({ onSelectSector }) => {
  const { currentOrg, setCurrentOrg, addToast } = useApp();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select filters
  const [selectedSubIndustryCounts, setSelectedSubIndustryCounts] = useState<number[]>([]);
  const [selectedSectorGroups, setSelectedSectorGroups] = useState<string[]>([]);

  // Expanded card view state
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('table');

  // Sub-industry count options present in data (4, 5, 6)
  const countOptions = useMemo(() => {
    const counts = Array.from(new Set(INDUSTRY_SECTORS.map((s) => s.subIndustriesCount))).sort((a, b) => a - b);
    return counts.map((count) => ({
      count,
      totalSectors: INDUSTRY_SECTORS.filter((s) => s.subIndustriesCount === count).length,
    }));
  }, []);

  // Toggle Sub-Industry Count in multi-select
  const toggleSubIndustryCount = (count: number) => {
    setSelectedSubIndustryCounts((prev) =>
      prev.includes(count) ? prev.filter((c) => c !== count) : [...prev, count]
    );
  };

  // Toggle Sector Group in multi-select
  const toggleSectorGroup = (groupId: string) => {
    setSelectedSectorGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  // Clear all active filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedSubIndustryCounts([]);
    setSelectedSectorGroups([]);
    addToast('Cleared all industry report filters', 'info');
  };

  // Filter evaluation logic
  const filteredSectors = useMemo(() => {
    return INDUSTRY_SECTORS.filter((sector) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = sector.name.toLowerCase().includes(query);
        const matchesDesc = sector.description.toLowerCase().includes(query);
        const matchesSub = sector.subIndustries.some((sub) => sub.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesSub) return false;
      }

      // 2. Multi-select Sub-Industry Count filter
      if (selectedSubIndustryCounts.length > 0) {
        if (!selectedSubIndustryCounts.includes(sector.subIndustriesCount)) {
          return false;
        }
      }

      // 3. Multi-select Sector Groups filter
      if (selectedSectorGroups.length > 0) {
        const belongsToAnySelectedGroup = selectedSectorGroups.some((groupId) => {
          const groupDef = SECTOR_GROUPS.find((g) => g.id === groupId);
          return groupDef ? groupDef.sectorIds.includes(sector.id) : false;
        });
        if (!belongsToAnySelectedGroup) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSubIndustryCounts, selectedSectorGroups]);

  const hasActiveFilters = searchQuery !== '' || selectedSubIndustryCounts.length > 0 || selectedSectorGroups.length > 0;

  // Handle Sector Adoption
  const handleAdoptSector = (sector: IndustrySector) => {
    setCurrentOrg((prev) => ({
      ...prev,
      industry: sector.name,
    }));
    if (onSelectSector) onSelectSector(sector);
    addToast(`Calibrated organizational benchmarks to ${sector.name}`, 'success');
  };

  return (
    <div className="space-y-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-200">
              Taxonomy & Benchmarks
            </span>
            <span className="text-xs font-bold text-slate-400">
              {filteredSectors.length} of {INDUSTRY_SECTORS.length} Sectors Match
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>23-Sector Industry Intelligence Directory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter and cross-examine sector financial benchmarks, gross margin baselines, LTV:CAC expectations, and extracted sub-industries.
          </p>
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabular Matrix
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Cards
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & MULTI-SELECT FILTER CONTROLS */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-4 space-y-3.5">
        {/* 1. Real-time Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sector name, sub-industry domain, or description (e.g. 'FinTech', 'Renewable', 'Warehousing')..."
              className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* 2. Multi-Select Filter Controls */}
        <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Sub-Industry Count Multi-Select */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                <span>Sub-Industry Count Filter</span>
              </span>
              {selectedSubIndustryCounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSubIndustryCounts([])}
                  className="text-[10px] text-amber-700 hover:underline font-bold"
                >
                  Clear ({selectedSubIndustryCounts.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {countOptions.map(({ count, totalSectors }) => {
                const isSelected = selectedSubIndustryCounts.includes(count);
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => toggleSubIndustryCount(count)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Square className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{count} Sub-Industries</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {totalSectors}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sector Groups Multi-Select */}
          <div className="lg:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-slate-500" />
                <span>Sector Groups Multi-Select</span>
              </span>
              {selectedSectorGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSectorGroups([])}
                  className="text-[10px] text-amber-700 hover:underline font-bold"
                >
                  Clear ({selectedSectorGroups.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SECTOR_GROUPS.map((group) => {
                const isSelected = selectedSectorGroups.includes(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleSectorGroup(group.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Square className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{group.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {group.sectorIds.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Tags Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Active Criteria:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-amber-950">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {selectedSubIndustryCounts.map((count) => (
              <span
                key={count}
                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium flex items-center gap-1"
              >
                {count} Sub-Industries
                <button type="button" onClick={() => toggleSubIndustryCount(count)} className="hover:text-blue-950">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {selectedSectorGroups.map((groupId) => {
              const grp = SECTOR_GROUPS.find((g) => g.id === groupId);
              if (!grp) return null;
              return (
                <span
                  key={groupId}
                  className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium flex items-center gap-1"
                >
                  Group: {grp.label}
                  <button type="button" onClick={() => toggleSectorGroup(groupId)} className="hover:text-purple-950">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* RESULTS LIST: TABULAR MATRIX OR VISUAL CARDS */}
      {filteredSectors.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No industry sectors match your filter criteria</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, selecting different sub-industry counts, or toggling additional sector groups.
          </p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="mt-2 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : viewLayout === 'table' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50/90 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-3">Sub-Industries Count</th>
                <th className="py-3 px-3">Benchmark Gross Margin</th>
                <th className="py-3 px-3">Benchmark LTV : CAC</th>
                <th className="py-3 px-3">Sales Cycle</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSectors.map((sector) => {
                const isCurrentOrgIndustry = currentOrg.industry === sector.name;
                const isExpanded = expandedSectorId === sector.id;
                const IconComponent = ICON_MAP[sector.iconName] || Building2;

                return (
                  <React.Fragment key={sector.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-amber-50/30' : ''}`}>
                      {/* Sector Name & Icon */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0 border border-slate-200">
                            <IconComponent className="w-4 h-4 text-slate-800" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{sector.name}</span>
                              {isCurrentOrgIndustry && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Active Org
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {sector.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sub-Industry Count Pill */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>{sector.subIndustriesCount} Domains</span>
                        </span>
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-3 font-mono-numeric font-bold text-slate-900">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sector.benchmarkGrossMargin}%
                        </span>
                      </td>

                      {/* LTV : CAC */}
                      <td className="py-3.5 px-3 font-mono-numeric font-bold text-slate-900">
                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {sector.benchmarkCACtoLTV}x
                        </span>
                      </td>

                      {/* Typical Sales Cycle */}
                      <td className="py-3.5 px-3 font-mono-numeric text-slate-700">
                        {sector.typicalSalesCycleDays} Days
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedSectorId(isExpanded ? null : sector.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Domains'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdoptSector(sector)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isCurrentOrgIndustry
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                            }`}
                          >
                            {isCurrentOrgIndustry ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Active</span>
                              </>
                            ) : (
                              <span>Set Active</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Sub-Industries Detail Row */}
                    {isExpanded && (
                      <tr className="bg-amber-50/20 border-b border-slate-200">
                        <td colSpan={6} className="p-4">
                          <div className="bg-white rounded-xl border border-amber-200/80 p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-amber-600" />
                                <span>
                                  Extracted Sub-Industry Domains for {sector.name} ({sector.subIndustriesCount})
                                </span>
                              </h5>
                              <span className="text-[11px] text-slate-500">
                                Typical Sales Cycle: <strong>{sector.typicalSalesCycleDays} days</strong> • Target Gross Margin: <strong>{sector.benchmarkGrossMargin}%</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {sector.subIndustries.map((sub, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                                >
                                  <span className="font-semibold text-slate-800 flex items-center gap-2 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="truncate">{sub}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono shrink-0">#{idx + 1}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map((sector) => {
            const isCurrentOrgIndustry = currentOrg.industry === sector.name;
            const IconComponent = ICON_MAP[sector.iconName] || Building2;

            return (
              <div
                key={sector.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isCurrentOrgIndustry
                    ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                    : 'bg-white border-slate-200/90 hover:border-slate-400 hover:shadow-sm'
                }`}
              >
                {/* Visual Image Header */}
                <div className="relative h-24 w-full overflow-hidden bg-slate-950">
                  <img
                    src={sector.imageVisualUrl}
                    alt={sector.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-75"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-xs border border-white/20 shadow-xs flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" />
                      <span>{sector.subIndustriesCount} Sub-Industries</span>
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                      <IconComponent className="w-3.5 h-3.5 text-slate-900" />
                    </div>
                    {isCurrentOrgIndustry && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                        Active Org
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{sector.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {sector.description}
                    </p>
                  </div>

                  {/* Financial Telemetry Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    <div>
                      <div className="text-slate-400">Margin</div>
                      <div className="font-black text-slate-900 font-mono-numeric mt-0.5">
                        {sector.benchmarkGrossMargin}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">LTV:CAC</div>
                      <div className="font-black text-emerald-700 font-mono-numeric mt-0.5">
                        {sector.benchmarkCACtoLTV}x
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Sales Cycle</div>
                      <div className="font-black text-slate-900 font-mono-numeric mt-0.5">
                        {sector.typicalSalesCycleDays}d
                      </div>
                    </div>
                  </div>

                  {/* Sub-industries tags */}
                  <div className="flex flex-wrap gap-1">
                    {sector.subIndustries.slice(0, 3).map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate max-w-[140px]"
                      >
                        {sub}
                      </span>
                    ))}
                    {sector.subIndustries.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        +{sector.subIndustries.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => handleAdoptSector(sector)}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrentOrgIndustry
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                    }`}
                  >
                    {isCurrentOrgIndustry ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Org Sector</span>
                      </>
                    ) : (
                      <span>Calibrate to this Sector</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
