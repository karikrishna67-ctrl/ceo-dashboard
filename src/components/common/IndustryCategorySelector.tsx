import React, { useState } from 'react';
import {
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
  Check,
  ChevronRight,
  Search,
  Layers,
  Sparkles,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { INDUSTRY_SECTORS, IndustrySector } from '../../data/industrySectors';

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

interface IndustryCategorySelectorProps {
  selectedIndustry?: string;
  onSelectIndustry: (sector: IndustrySector) => void;
  layout?: 'grid' | 'compact' | 'carousel';
  showDetailsModal?: boolean;
}

export const IndustryCategorySelector: React.FC<IndustryCategorySelectorProps> = ({
  selectedIndustry,
  onSelectIndustry,
  layout = 'grid',
  showDetailsModal = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'TECH' | 'INDUSTRIAL' | 'COMMERCE' | 'EMERGING'>('ALL');
  const [inspectingSector, setInspectingSector] = useState<IndustrySector | null>(null);

  const filterSector = (sector: IndustrySector) => {
    const matchesSearch =
      sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.subIndustries.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sector.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategoryFilter === 'ALL') return true;
    if (activeCategoryFilter === 'TECH' && ['technology-software', 'finance-fintech', 'education-edtech', 'blockchain-crypto', 'gaming-esports'].includes(sector.id)) return true;
    if (activeCategoryFilter === 'INDUSTRIAL' && ['infrastructure-logistics', 'manufacturing', 'logistics-transportation', 'energy-emerging-sectors', 'printing-packaging', 'security-defense'].includes(sector.id)) return true;
    if (activeCategoryFilter === 'COMMERCE' && ['retail-ecommerce', 'food-beverage', 'fashion-lifestyle', 'jewelry-precious-metals', 'home-services', 'electronics-gadgets', 'travel-hospitality', 'healthcare-wellness', 'fitness-sports', 'agriculture-agritech'].includes(sector.id)) return true;
    if (activeCategoryFilter === 'EMERGING' && ['other-emerging-industries', 'blockchain-crypto', 'energy-emerging-sectors', 'gaming-esports'].includes(sector.id)) return true;

    return false;
  };

  const filteredSectors = INDUSTRY_SECTORS.filter(filterSector);

  return (
    <div className="space-y-4">
      {/* Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: `All 23 Sectors` },
            { id: 'TECH', label: 'Tech & Digital' },
            { id: 'INDUSTRIAL', label: 'Industrial & Supply' },
            { id: 'COMMERCE', label: 'Commerce & Services' },
            { id: 'EMERGING', label: 'Emerging Frontier' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sectors & sub-industries..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Category Buttons Grid */}
      <div
        className={
          layout === 'compact'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5'
        }
      >
        {filteredSectors.map((sector) => {
          const isSelected = selectedIndustry === sector.name || selectedIndustry === sector.id;
          const IconComponent = ICON_MAP[sector.iconName] || Building2;

          return (
            <div
              key={sector.id}
              className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between text-left ${
                isSelected
                  ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white border-slate-200/90 hover:border-slate-400 hover:shadow-sm'
              }`}
            >
              {/* Visual Image Header with Gradient Overlay */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                <img
                  src={sector.imageVisualUrl}
                  alt={sector.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Sub-industry Count Pill */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-xs border border-white/20 shadow-xs flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    <span>{sector.subIndustriesCount} Sub-Industries</span>
                  </span>
                </div>

                {/* Icon Badge */}
                <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/90 text-slate-900 flex items-center justify-center shadow-xs backdrop-blur-xs">
                    <IconComponent className="w-4 h-4 text-slate-900" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                    {sector.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sector.description}
                  </p>
                </div>

                {/* Extracted Sub-Industry Preview Badges */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1">
                  {sector.subIndustries.slice(0, 2).map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate max-w-[130px]"
                      title={sub}
                    >
                      {sub}
                    </span>
                  ))}
                  {sector.subIndustries.length > 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200/60">
                      +{sector.subIndustries.length - 2} more
                    </span>
                  )}
                </div>

                {/* Action Buttons: Select Category Button & Inspect Details */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectIndustry(sector)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800'
                    }`}
                  >
                    <span>{isSelected ? 'Selected Category' : 'Select Category'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {showDetailsModal && (
                    <button
                      type="button"
                      onClick={() => setInspectingSector(sector)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Inspect extracted sub-industries and benchmarks"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSectors.length === 0 && (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
          <Search className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700">No industry sectors matched your search</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Try searching for different keywords or clear filters.</p>
        </div>
      )}

      {/* Sub-Industries Deep Inspection Modal */}
      {inspectingSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Image Banner */}
            <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
              <img
                src={inspectingSector.imageVisualUrl}
                alt={inspectingSector.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                type="button"
                onClick={() => setInspectingSector(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    {inspectingSector.subIndustriesCount} Extracted Sub-Industries
                  </span>
                  <h3 className="text-base font-black text-white mt-1">
                    {inspectingSector.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {inspectingSector.description}
              </p>

              {/* Sub-Industries Extracted List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Extracted Sub-Industry Domains ({inspectingSector.subIndustriesCount})</span>
                </h4>
                <div className="space-y-1.5">
                  {inspectingSector.subIndustries.map((sub, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {sub}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Domain {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Financial Benchmarks */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2">
                  Executive Sector Telemetry & Benchmarks
                </h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <div className="text-[10px] text-slate-500">Gross Margin</div>
                    <div className="text-xs font-black text-slate-900 font-mono-numeric mt-0.5">
                      {inspectingSector.benchmarkGrossMargin}%
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <div className="text-[10px] text-slate-500">LTV : CAC</div>
                    <div className="text-xs font-black text-emerald-700 font-mono-numeric mt-0.5">
                      {inspectingSector.benchmarkCACtoLTV}x
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <div className="text-[10px] text-slate-500">Sales Cycle</div>
                    <div className="text-xs font-black text-slate-900 font-mono-numeric mt-0.5">
                      {inspectingSector.typicalSalesCycleDays}d
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingSector(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectIndustry(inspectingSector);
                    setInspectingSector(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set as Active Sector</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
