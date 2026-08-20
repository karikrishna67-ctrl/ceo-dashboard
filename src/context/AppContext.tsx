import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Organization,
  User,
  UserRole,
  Lead,
  Customer,
  ProductService,
  Invoice,
  Expense,
  MarketingCampaign,
  Employee,
  CEOActionTask,
  AIAlert,
  OpportunityItem,
  FilterState,
  DateFilterOption,
  CurrencyCode,
  ToastMessage,
  SyncedTaxonomyState,
} from '../types';
import {
  DEMO_ORG,
  DEMO_USERS,
  DEMO_LEADS,
  DEMO_CUSTOMERS,
  DEMO_PRODUCTS,
  DEMO_INVOICES,
  DEMO_EXPENSES,
  DEMO_CAMPAIGNS,
  DEMO_EMPLOYEES,
  DEMO_ACTIONS,
  DEMO_ALERTS,
  DEMO_OPPORTUNITIES,
} from '../data/demoData';
import { computeKPISnapshot, KPISnapshot } from '../lib/kpiEngine';

interface AppContextType {
  // User & Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentOrg: Organization;
  setCurrentOrg: React.Dispatch<React.SetStateAction<Organization>>;
  updateOrgSettings: (settings: Partial<Organization['settings']>) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;

  // Navigation
  activeView: string;
  setActiveView: (view: string) => void;

  // Filter & Currency
  filters: FilterState;
  setDateRange: (range: DateFilterOption) => void;
  setSearchQuery: (query: string) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  // Synced Sector Taxonomy & Aggregates
  syncedTaxonomy: SyncedTaxonomyState | null;
  syncTaxonomyToDashboard: (state: SyncedTaxonomyState, navigateImmediately?: boolean) => void;
  clearSyncedTaxonomy: () => void;

  // Data Collections
  leads: Lead[];
  customers: Customer[];
  products: ProductService[];
  invoices: Invoice[];
  expenses: Expense[];
  campaigns: MarketingCampaign[];
  employees: Employee[];
  actions: CEOActionTask[];
  alerts: AIAlert[];
  opportunities: OpportunityItem[];

  // Mutations
  addLead: (lead: Omit<Lead, 'id' | 'organizationId' | 'createdDate'>) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'organizationId'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'organizationId'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'organizationId'>) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  addActionTask: (task: Omit<CEOActionTask, 'id' | 'organizationId' | 'createdAt'>) => void;
  updateActionStatus: (actionId: string, status: CEOActionTask['status']) => void;
  deleteActionTask: (taskId: string) => void;
  addCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'organizationId'>) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'organizationId'>) => void;
  convertOpportunityToTask: (oppId: string) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type'], title?: string, duration?: number) => void;
  removeToast: (id: string) => void;

  // Import & Reset
  importData: (type: 'leads' | 'customers' | 'expenses' | 'invoices', records: any[]) => { success: number; errors: number };
  toggleDemoMode: () => void;
  resetDemoData: () => void;
  clearToEmptyState: () => void;

  // Computed Snapshot
  kpiSnapshot: KPISnapshot;

  // Modal Triggers
  isBriefingOpen: boolean;
  setIsBriefingOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isDataImportOpen: boolean;
  setIsDataImportOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  openCommandPalette: (tab?: string, initialQuery?: string) => void;
  commandPaletteInitialTab: string;
  commandPaletteInitialQuery: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // Rajesh Sharma (CEO)
  const [currentOrg, setCurrentOrg] = useState<Organization>(DEMO_ORG);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<string>('command-center');

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    message: string,
    type: ToastMessage['type'] = 'success',
    title?: string,
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, message, type, title, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'this_month',
    searchQuery: '',
  });

  // Synced Industry Sector & Taxonomy State
  const [syncedTaxonomy, setSyncedTaxonomy] = useState<SyncedTaxonomyState | null>(null);

  const syncTaxonomyToDashboard = (state: SyncedTaxonomyState, navigateImmediately: boolean = false) => {
    setSyncedTaxonomy(state);
    // Also calibrate organization industry if a sector was selected
    if (state.selectedSectorName && state.selectedSectorName !== currentOrg.industry) {
      setCurrentOrg((prev) => ({
        ...prev,
        industry: state.selectedSectorName,
      }));
    }
    addToast(
      `Sector benchmarks & aggregate data (${state.totalFilteredSectors} sectors, ${state.totalSubIndustriesCount} domains) synchronized to CEO Command Center.`,
      'success',
      'Taxonomy Synced'
    );
    if (navigateImmediately) {
      setActiveView('command-center');
    }
  };

  const clearSyncedTaxonomy = () => {
    setSyncedTaxonomy(null);
    addToast('Sector benchmark override cleared from CEO Command Center.', 'info');
  };

  // Modals
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDataImportOpen, setIsDataImportOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [commandPaletteInitialTab, setCommandPaletteInitialTab] = useState<string>('all');
  const [commandPaletteInitialQuery, setCommandPaletteInitialQuery] = useState<string>('');

  const openCommandPalette = (tab: string = 'all', initialQuery: string = '') => {
    setCommandPaletteInitialTab(tab);
    setCommandPaletteInitialQuery(initialQuery);
    setIsCommandPaletteOpen(true);
  };

  // Business Data Collections
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [products, setProducts] = useState<ProductService[]>(DEMO_PRODUCTS);
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(DEMO_CAMPAIGNS);
  const [employees, setEmployees] = useState<Employee[]>(DEMO_EMPLOYEES);
  const [actions, setActions] = useState<CEOActionTask[]>(DEMO_ACTIONS);
  const [alerts, setAlerts] = useState<AIAlert[]>(DEMO_ALERTS);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(DEMO_OPPORTUNITIES);

  const currency = currentOrg.settings.currency;

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrentOrg((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        currency: newCurrency,
      },
    }));
    addToast(`Currency updated to ${newCurrency}`, 'info');
  };

  const updateOrgSettings = (settings: Partial<Organization['settings']>) => {
    setCurrentOrg((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
    addToast('Organization settings updated successfully.', 'success');
  };

  const userRole = currentUser.role;

  const setUserRole = (role: UserRole) => {
    const matchingUser = DEMO_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUser(matchingUser);
    addToast(`Switched active view role to ${role}`, 'info');
  };

  const login = (email: string, role: UserRole = UserRole.CEO) => {
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      organizationId: currentOrg.id,
      title: role.replace('_', ' '),
      department: 'Leadership',
    };
    setCurrentUser(matched);
    setIsAuthenticated(true);
    addToast(`Welcome back, ${matched.name}!`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('Logged out securely.', 'info');
  };

  const setDateRange = (dateRange: DateFilterOption) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  // Data Mutations
  const addLead = (newLeadData: Omit<Lead, 'id' | 'organizationId' | 'createdDate'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      organizationId: currentOrg.id,
      createdDate: new Date().toISOString().split('T')[0],
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowupDate: newLeadData.nextFollowupDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      activities: [],
    };
    setLeads((prev) => [newLead, ...prev]);

    // Add alert
    const newAlert: AIAlert = {
      id: `alt-${Date.now()}`,
      organizationId: currentOrg.id,
      title: `New High-Value Lead Added: ${newLead.company}`,
      message: `${newLead.name} added with estimated value of ₹${(((newLead.estimatedValue || 0) / 100000) || 0).toFixed(1)}L.`,
      severity: newLead.leadScore >= 80 ? 'HIGH' : 'INFO',
      category: 'SALES',
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    addToast(`Lead "${newLead.name}" added to pipeline!`, 'success');
  };

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status,
              dealProbability: status === 'Won' ? 100 : status === 'Lost' ? 0 : status === 'Negotiation' ? 80 : l.dealProbability,
              lastContactDate: new Date().toISOString().split('T')[0],
            }
          : l
      )
    );
    addToast(`Lead status moved to ${status}`, 'info');
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
    );
    addToast('Lead details saved.', 'success');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'organizationId'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addToast(`Customer "${newCustomer.name}" added!`, 'success');
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'organizationId'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addToast(`Expense entry recorded successfully.`, 'success');
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'organizationId'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    addToast(`Invoice ${newInvoice.invoiceNumber} created!`, 'success');
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paidDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : inv
      )
    );
    addToast(`Invoice status marked as ${status}.`, 'success');
  };

  const addActionTask = (taskData: Omit<CEOActionTask, 'id' | 'organizationId' | 'createdAt'>) => {
    const newTask: CEOActionTask = {
      ...taskData,
      id: `act-${Date.now()}`,
      organizationId: currentOrg.id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setActions((prev) => [newTask, ...prev]);
    addToast(`Action task "${newTask.title}" added to board!`, 'success');
  };

  const updateActionStatus = (actionId: string, status: CEOActionTask['status']) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? {
              ...a,
              status,
              completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
            }
          : a
      )
    );
    addToast(`Task marked as ${status}.`, 'info');
  };

  const deleteActionTask = (taskId: string) => {
    setActions((prev) => prev.filter((a) => a.id !== taskId));
    addToast('Action task removed.', 'info');
  };

  const addCampaign = (campaignData: Omit<MarketingCampaign, 'id' | 'organizationId'>) => {
    const newCampaign: MarketingCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    addToast(`Campaign "${newCampaign.name}" launched!`, 'success');
  };

  const addEmployee = (employeeData: Omit<Employee, 'id' | 'organizationId'>) => {
    const newEmp: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      organizationId: currentOrg.id,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addToast(`Team member "${newEmp.name}" added!`, 'success');
  };

  const convertOpportunityToTask = (oppId: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    const newTask: CEOActionTask = {
      id: `act-${Date.now()}`,
      organizationId: currentOrg.id,
      title: opp.title,
      problem: opp.description,
      recommendedAction: opp.recommendedAction,
      expectedImpactAmount: opp.potentialRevenue,
      expectedImpactDescription: `Revenue capture opportunity of ₹${(((opp.potentialRevenue || 0) / 100000) || 0).toFixed(1)}L`,
      owner: currentUser.name,
      priority: opp.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      category: 'Sales Acceleration',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setActions((prev) => [newTask, ...prev]);
    addToast(`Playbook "${opp.title}" queued into CEO Action board!`, 'success');
    setActiveView('tasks');
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    addToast('All alerts marked as read.', 'info');
  };

  const importData = (type: 'leads' | 'customers' | 'expenses' | 'invoices', records: any[]) => {
    let successCount = 0;
    if (type === 'leads') {
      const formatted: Lead[] = records.map((r, i) => ({
        id: `lead-imp-${Date.now()}-${i}`,
        organizationId: currentOrg.id,
        name: r.name || 'Prospect Contact',
        company: r.company || 'Enterprise Account',
        phone: r.phone || '',
        email: r.email || 'contact@example.com',
        source: r.source || 'Inbound Upload',
        industry: r.industry || 'Technology',
        location: r.location || 'India',
        leadScore: Number(r.leadScore) || 60,
        temperature: (Number(r.leadScore) || 60) >= 80 ? 'hot' : (Number(r.leadScore) || 60) >= 50 ? 'warm' : 'cold',
        status: (r.status as Lead['status']) || 'New',
        assignedSalesperson: r.assignedSalesperson || 'Vikram Mehta',
        createdDate: new Date().toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
        nextFollowupDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        estimatedValue: Number(r.estimatedValue) || 150000,
        dealProbability: 35,
        activities: [],
      }));
      setLeads((prev) => [...formatted, ...prev]);
      successCount = formatted.length;
    } else if (type === 'customers') {
      const formatted: Customer[] = records.map((r, i) => ({
        id: `cust-imp-${Date.now()}-${i}`,
        organizationId: currentOrg.id,
        name: r.name || 'Account Executive',
        company: r.company || 'Corporate Client',
        phone: r.phone || '',
        email: r.email || 'account@example.com',
        industry: r.industry || 'Services',
        location: r.location || 'India',
        productsPurchased: r.productsPurchased ? [r.productsPurchased] : ['Enterprise Growth Engine'],
        totalRevenue: Number(r.totalRevenue) || 500000,
        monthlyRecurring: Number(r.monthlyRecurring) || 45000,
        firstPurchaseDate: new Date().toISOString().split('T')[0],
        lastPurchaseDate: new Date().toISOString().split('T')[0],
        nextPurchaseProbability: 60,
        lifetimeValue: Number(r.lifetimeValue) || 1200000,
        status: 'Active',
        segment: 'Regular',
        churnRiskScore: 15,
        unpaidBalance: 0,
        assignedAccountManager: 'Vikram Mehta',
      }));
      setCustomers((prev) => [...formatted, ...prev]);
      successCount = formatted.length;
    }
    addToast(`Successfully imported ${successCount} records!`, 'success');
    return { success: successCount, errors: 0 };
  };

  const toggleDemoMode = () => {
    setCurrentOrg((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        isDemoMode: !prev.settings.isDemoMode,
      },
    }));
    addToast('Demo Mode toggled.', 'info');
  };

  const resetDemoData = () => {
    setLeads(DEMO_LEADS);
    setCustomers(DEMO_CUSTOMERS);
    setProducts(DEMO_PRODUCTS);
    setInvoices(DEMO_INVOICES);
    setExpenses(DEMO_EXPENSES);
    setCampaigns(DEMO_CAMPAIGNS);
    setEmployees(DEMO_EMPLOYEES);
    setActions(DEMO_ACTIONS);
    setAlerts(DEMO_ALERTS);
    setOpportunities(DEMO_OPPORTUNITIES);
    setCurrentOrg(DEMO_ORG);
    addToast('Enterprise demo dataset restored!', 'success');
  };

  const clearToEmptyState = () => {
    setLeads([]);
    setCustomers([]);
    setInvoices([]);
    setExpenses([]);
    setCampaigns([]);
    setActions([]);
    setAlerts([]);
    setOpportunities([]);
    setCurrentOrg((prev) => ({
      ...prev,
      settings: { ...prev.settings, isDemoMode: false },
    }));
    addToast('Workspace reset to empty state.', 'info');
  };

  // Compute live KPI snapshot whenever data changes
  const kpiSnapshot = useMemo(() => {
    return computeKPISnapshot(
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
  }, [currentOrg, leads, customers, products, invoices, expenses, campaigns, employees, actions]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentOrg,
        setCurrentOrg,
        updateOrgSettings,
        userRole,
        setUserRole,
        isAuthenticated,
        login,
        logout,
        activeView,
        setActiveView,
        filters,
        setDateRange,
        setSearchQuery,
        currency,
        setCurrency,
        syncedTaxonomy,
        syncTaxonomyToDashboard,
        clearSyncedTaxonomy,
        leads,
        customers,
        products,
        invoices,
        expenses,
        campaigns,
        employees,
        actions,
        alerts,
        opportunities,
        addLead,
        updateLeadStatus,
        updateLead,
        addCustomer,
        addExpense,
        addInvoice,
        updateInvoiceStatus,
        addActionTask,
        updateActionStatus,
        deleteActionTask,
        addCampaign,
        addEmployee,
        convertOpportunityToTask,
        markAlertRead,
        markAllAlertsRead,
        toasts,
        addToast,
        removeToast,
        importData,
        toggleDemoMode,
        resetDemoData,
        clearToEmptyState,
        kpiSnapshot,
        isBriefingOpen,
        setIsBriefingOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isDataImportOpen,
        setIsDataImportOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        openCommandPalette,
        commandPaletteInitialTab,
        commandPaletteInitialQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
