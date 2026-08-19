import { useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { KPIUtility, KPIVerificationReport } from '../utils/kpi';
import { KPISnapshot } from '../types';

export interface UseDashboardDataReturn {
  // Master snapshot
  kpiSnapshot: KPISnapshot;
  
  // Categorized metric slices
  revenueMetrics: {
    revenueMTD: number;
    revenueTarget: number;
    revenueGap: number;
    revenueAchievementPct: number;
    revenueGrowthMoM: number;
    mrr: number;
    arr: number;
    arpu: number;
    paidInvoicesTotal: number;
    requiredDailyRevenue: number;
    daysRemainingInMonth: number;
  };
  
  marginMetrics: {
    cogsMTD: number;
    grossProfit: number;
    grossMarginPct: number;
    operatingExpenses: number;
    ebitda: number;
    netProfit: number;
    netMarginPct: number;
  };
  
  velocityMetrics: {
    pipelineValue: number;
    qualifiedLeads: number;
    totalLeads: number;
    wonDealsCount: number;
    wonDealsValue: number;
    winRatePct: number;
    averageDealSize: number;
    salesCycleDays: number;
    requiredDealsCount: number;
    requiredLeadsCount: number;
    salesFunnel: KPISnapshot['salesFunnel'];
    biggestBottleneck: KPISnapshot['biggestBottleneck'];
  };
  
  cashMetrics: {
    cashBalance: number;
    monthlyBurnRate: number;
    cashRunwayMonths: number;
    outstandingReceivables: number;
    overdueReceivables: number;
    accountsPayable: number;
    dsoDays: number;
    dpoDays: number;
    workingCapital: number;
  };
  
  customerMetrics: {
    totalCustomers: number;
    activeCustomers: number;
    atRiskCustomersCount: number;
    churnRatePct: number;
    retentionRatePct: number;
    avgLTV: number;
  };
  
  marketingMetrics: {
    marketingSpend: number;
    marketingRevenue: number;
    blendedCAC: number;
    blendedCPL: number;
    blendedROAS: number;
    topChannel: string;
    underperformingChannel: string;
  };
  
  leakageMetrics: KPISnapshot['leakage'];
  healthScore: KPISnapshot['healthScore'];
  
  // Verification and integrity tools
  verificationReport: KPIVerificationReport;
  verifyIntegrity: () => KPIVerificationReport;
  
  // Context shortcuts
  currency: string;
  currentOrg: any;
  userRole: string;
}

/**
 * useDashboardData hook:
 * Consumes source business collections and calculates unified, zero-discrepancy KPIs
 * using the centralized KPIUtility single source of truth.
 * Automatically runs console-based verification logs on data changes.
 */
export function useDashboardData(): UseDashboardDataReturn {
  const {
    currentOrg,
    leads,
    customers,
    products,
    invoices,
    expenses,
    campaigns,
    employees,
    actions,
    currency,
    userRole,
  } = useApp();

  // Compute master KPI snapshot through KPIUtility
  const kpiSnapshot = useMemo(() => {
    return KPIUtility.computeKPISnapshot(
      currentOrg,
      leads,
      customers,
      products,
      invoices,
      expenses,
      campaigns,
      employees,
      actions
    );
  }, [
    currentOrg,
    leads,
    customers,
    products,
    invoices,
    expenses,
    campaigns,
    employees,
    actions,
  ]);

  // Run integrity verification audit and produce structured report
  const verifyIntegrity = useCallback(() => {
    return KPIUtility.verifyBusinessDataIntegrity(
      {
        invoices,
        expenses,
        leads,
        customers,
        campaigns,
        employees,
      },
      kpiSnapshot
    );
  }, [invoices, expenses, leads, customers, campaigns, employees, kpiSnapshot]);

  // Execute console audit whenever underlying business records mutate
  useEffect(() => {
    verifyIntegrity();
  }, [verifyIntegrity]);

  const verificationReport = useMemo(() => {
    return KPIUtility.verifyBusinessDataIntegrity(
      {
        invoices,
        expenses,
        leads,
        customers,
        campaigns,
        employees,
      },
      kpiSnapshot
    );
  }, [invoices, expenses, leads, customers, campaigns, employees, kpiSnapshot]);

  // Derived metric slices for ergonomic consumer component access
  const revenueMetrics = useMemo(() => {
    const paidInvoicesTotal = KPIUtility.calculatePaidInvoicesTotal(invoices);
    const arpu = KPIUtility.calculateARPU(kpiSnapshot.mrr, kpiSnapshot.activeCustomers);

    return {
      revenueMTD: kpiSnapshot.revenueMTD,
      revenueTarget: kpiSnapshot.revenueTarget,
      revenueGap: kpiSnapshot.revenueGap,
      revenueAchievementPct: kpiSnapshot.revenueAchievementPct,
      revenueGrowthMoM: kpiSnapshot.revenueGrowthMoM,
      mrr: kpiSnapshot.mrr,
      arr: kpiSnapshot.arr,
      arpu,
      paidInvoicesTotal,
      requiredDailyRevenue: kpiSnapshot.requiredDailyRevenue,
      daysRemainingInMonth: kpiSnapshot.daysRemainingInMonth,
    };
  }, [kpiSnapshot, invoices]);

  const marginMetrics = useMemo(() => {
    return {
      cogsMTD: kpiSnapshot.cogsMTD,
      grossProfit: kpiSnapshot.grossProfit,
      grossMarginPct: kpiSnapshot.grossMarginPct,
      operatingExpenses: kpiSnapshot.operatingExpenses,
      ebitda: kpiSnapshot.ebitda,
      netProfit: kpiSnapshot.netProfit,
      netMarginPct: kpiSnapshot.netMarginPct,
    };
  }, [kpiSnapshot]);

  const velocityMetrics = useMemo(() => {
    return {
      pipelineValue: kpiSnapshot.pipelineValue,
      qualifiedLeads: kpiSnapshot.qualifiedLeads,
      totalLeads: kpiSnapshot.totalLeads,
      wonDealsCount: kpiSnapshot.wonDealsCount,
      wonDealsValue: kpiSnapshot.wonDealsValue,
      winRatePct: kpiSnapshot.winRatePct,
      averageDealSize: kpiSnapshot.averageDealSize,
      salesCycleDays: kpiSnapshot.salesCycleDays,
      requiredDealsCount: kpiSnapshot.requiredDealsCount,
      requiredLeadsCount: kpiSnapshot.requiredLeadsCount,
      salesFunnel: kpiSnapshot.salesFunnel,
      biggestBottleneck: kpiSnapshot.biggestBottleneck,
    };
  }, [kpiSnapshot]);

  const cashMetrics = useMemo(() => {
    return {
      cashBalance: kpiSnapshot.cashBalance,
      monthlyBurnRate: kpiSnapshot.monthlyBurnRate,
      cashRunwayMonths: kpiSnapshot.cashRunwayMonths,
      outstandingReceivables: kpiSnapshot.outstandingReceivables,
      overdueReceivables: kpiSnapshot.overdueReceivables,
      accountsPayable: kpiSnapshot.accountsPayable,
      dsoDays: kpiSnapshot.dsoDays,
      dpoDays: kpiSnapshot.dpoDays,
      workingCapital: kpiSnapshot.workingCapital,
    };
  }, [kpiSnapshot]);

  const customerMetrics = useMemo(() => {
    return {
      totalCustomers: kpiSnapshot.totalCustomers,
      activeCustomers: kpiSnapshot.activeCustomers,
      atRiskCustomersCount: kpiSnapshot.atRiskCustomersCount,
      churnRatePct: kpiSnapshot.churnRatePct,
      retentionRatePct: kpiSnapshot.retentionRatePct,
      avgLTV: kpiSnapshot.avgLTV,
    };
  }, [kpiSnapshot]);

  const marketingMetrics = useMemo(() => {
    return {
      marketingSpend: kpiSnapshot.marketingSpend,
      marketingRevenue: kpiSnapshot.marketingRevenue,
      blendedCAC: kpiSnapshot.blendedCAC,
      blendedCPL: kpiSnapshot.blendedCPL,
      blendedROAS: kpiSnapshot.blendedROAS,
      topChannel: kpiSnapshot.topChannel,
      underperformingChannel: kpiSnapshot.underperformingChannel,
    };
  }, [kpiSnapshot]);

  return {
    kpiSnapshot,
    revenueMetrics,
    marginMetrics,
    velocityMetrics,
    cashMetrics,
    customerMetrics,
    marketingMetrics,
    leakageMetrics: kpiSnapshot.leakage,
    healthScore: kpiSnapshot.healthScore,
    verificationReport,
    verifyIntegrity,
    currency,
    currentOrg,
    userRole,
  };
}
