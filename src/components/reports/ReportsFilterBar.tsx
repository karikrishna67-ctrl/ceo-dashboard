import React from 'react';
import {
  Filter,
  Calendar,
  Building2,
  PieChart,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

export type ReportPeriod = 'ALL' | 'MTD' | 'QTD' | 'YTD' | 'T12M';
export type ReportDepartment = 'ALL' | 'SALES' | 'ENGINEERING' | 'MARKETING' | 'FINANCE' | 'EXECUTIVE';
export type ReportRevenueCategory = 'ALL' | 'ENTERPRISE_ARR' | 'MID_MARKET' | 'EXPANSION' | 'SERVICES' | 'LEAKAGE';

export interface ReportsFilterState {
  period: ReportPeriod;
  department: ReportDepartment;
  revenueCategory: ReportRevenueCategory;
  searchQuery: string;
}

interface ReportsFilterBarProps {
  filters: ReportsFilterState;
  onFilterChange: (updates: Partial<ReportsFilterState>) => void;
  onResetFilters: () => void;
  totalFilteredItemsCount?: number;
}

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  ALL: 'All Time (Full Horizon)',
  MTD: 'Current Month (MTD - Aug 2026)',
  QTD: 'Current Quarter (QTD - Q2 FY26)',
  YTD: 'Year to Date (YTD - FY26)',
  T12M: 'Trailing 12 Months (T12M)',
};

export const DEPARTMENT_LABELS: Record<ReportDepartment, string> = {
  ALL: 'All Departments',
  SALES: 'Sales & Commercial',
  MARKETING: 'Marketing & Growth',
  ENGINEERING: 'Engineering & Product',
  FINANCE: 'Finance & Operations',
  EXECUTIVE: 'Executive Leadership',
};

export const REVENUE_CATEGORY_LABELS: Record<ReportRevenueCategory, string> = {
  ALL: 'All Revenue Streams',
  ENTERPRISE_ARR: 'Enterprise Recurring ARR',
  MID_MARKET: 'Mid-Market Subscriptions',
  EXPANSION: 'Account Expansion & Add-ons',
  SERVICES: 'Professional Services & Advisory',
  LEAKAGE: 'Recoverable Trapped Leakage',
};

export const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredItemsCount,
}) => {
  const isFiltered =
    filters.period !== 'ALL' ||
    filters.department !== 'ALL' ||
    filters.revenueCategory !== 'ALL' ||
    filters.searchQuery.trim() !== '';

  const activeFiltersCount =
    (filters.period !== 'ALL' ? 1 : 0) +
    (filters.department !== 'ALL' ? 1 : 0) +
    (filters.revenueCategory !== 'ALL' ? 1 : 0) +
    (filters.searchQuery.trim() !== '' ? 1 : 0);

  return (
    <div
      id="reports-filter-bar"
      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5"
      role="search"
      aria-label="Executive Reports Filter & Scope Bar"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Report Scope & Granular Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {activeFiltersCount} Active
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500">
              Filter telemetry across fiscal cycles, operational units, and revenue streams for decision clarity.
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            id="btn-clear-report-filters"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            aria-label="Reset all active report filters to default"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Query Input */}
        <div className="relative">
          <label htmlFor="filter-search-input" className="sr-only">
            Search metrics, initiatives, or owners
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <input
            id="filter-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search metrics, owners, tags..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            aria-label="Filter report items by text search"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Period Dropdown */}
        <div>
          <label htmlFor="filter-period-select" className="sr-only">
            Fiscal Period
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </div>
            <select
              id="filter-period-select"
              value={filters.period}
              onChange={(e) => onFilterChange({ period: e.target.value as ReportPeriod })}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              aria-label="Filter by fiscal period"
            >
              {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((pKey) => (
                <option key={pKey} value={pKey}>
                  {PERIOD_LABELS[pKey]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Dropdown */}
        <div>
          <label htmlFor="filter-department-select" className="sr-only">
            Department Scope
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </div>
            <select
              id="filter-department-select"
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value as ReportDepartment })}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              aria-label="Filter by department"
            >
              {(Object.keys(DEPARTMENT_LABELS) as ReportDepartment[]).map((dKey) => (
                <option key={dKey} value={dKey}>
                  {DEPARTMENT_LABELS[dKey]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Revenue Stream Dropdown */}
        <div>
          <label htmlFor="filter-revenue-category-select" className="sr-only">
            Revenue Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PieChart className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </div>
            <select
              id="filter-revenue-category-select"
              value={filters.revenueCategory}
              onChange={(e) => onFilterChange({ revenueCategory: e.target.value as ReportRevenueCategory })}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              aria-label="Filter by revenue category"
            >
              {(Object.keys(REVENUE_CATEGORY_LABELS) as ReportRevenueCategory[]).map((rKey) => (
                <option key={rKey} value={rKey}>
                  {REVENUE_CATEGORY_LABELS[rKey]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges Pills */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-500 font-medium mr-1">Active Scope:</span>

          {filters.period !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              <span>{PERIOD_LABELS[filters.period]}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ period: 'ALL' })}
                className="hover:text-indigo-900 cursor-pointer ml-0.5"
                aria-label="Remove period filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.department !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <span>{DEPARTMENT_LABELS[filters.department]}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ department: 'ALL' })}
                className="hover:text-emerald-900 cursor-pointer ml-0.5"
                aria-label="Remove department filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.revenueCategory !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
              <span>{REVENUE_CATEGORY_LABELS[filters.revenueCategory]}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ revenueCategory: 'ALL' })}
                className="hover:text-amber-950 cursor-pointer ml-0.5"
                aria-label="Remove revenue category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery.trim() !== '' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
              <span>"{filters.searchQuery}"</span>
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="hover:text-slate-900 cursor-pointer ml-0.5"
                aria-label="Remove search query filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
