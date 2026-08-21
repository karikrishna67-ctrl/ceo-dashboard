import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomNavigation } from './components/layout/BottomNavigation';

// Views
import { CEOCommandCenterView } from './components/views/CEOCommandCenterView';
import { BusinessOverviewView } from './components/views/BusinessOverviewView';
import { RevenueView } from './components/views/RevenueView';
import { FinanceView } from './components/views/FinanceView';
import { SalesCRMView } from './components/views/SalesCRMView';
import { LeadsView } from './components/views/LeadsView';
import { CustomersView } from './components/views/CustomersView';
import { MarketingView } from './components/views/MarketingView';
import { ExpensesView } from './components/views/ExpensesView';
import { CashFlowView } from './components/views/CashFlowView';
import { RevenueLeakageView } from './components/views/RevenueLeakageView';
import { AIAdvisorView } from './components/views/AIAdvisorView';
import { AIAgentsView } from './components/views/AIAgentsView';
import { ForecastingView } from './components/views/ForecastingView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
import { ScenarioPlannerView } from './components/views/ScenarioPlannerView';
import { AlertsView } from './components/views/AlertsView';
import { TasksView } from './components/views/TasksView';
import { ReportsView } from './components/views/ReportsView';
import { IndustryTaxonomyView } from './components/views/IndustryTaxonomyView';
import { GamificationDashboardView } from './components/views/GamificationDashboardView';
import { TeamView } from './components/views/TeamView';
import { FollowUpRecoveryView } from './components/views/FollowUpRecoveryView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { DailyBriefingModal } from './components/modals/DailyBriefingModal';
import { OnboardingWizardModal } from './components/modals/OnboardingWizardModal';
import { DataImportModal } from './components/modals/DataImportModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { ToastContainer } from './components/common/ToastContainer';

function MainAppLayout() {

  const { activeView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'command-center':
        return <CEOCommandCenterView />;
      case 'business-overview':
        return <BusinessOverviewView />;
      case 'revenue':
        return <RevenueView />;
      case 'finance':
        return <FinanceView />;
      case 'sales-crm':
        return <SalesCRMView />;
      case 'leads':
        return <LeadsView />;
      case 'follow-ups':
        return <FollowUpRecoveryView />;
      case 'customers':
        return <CustomersView />;
      case 'marketing':
        return <MarketingView />;
      case 'expenses':
        return <ExpensesView />;
      case 'cash-flow':
        return <CashFlowView />;
      case 'revenue-leakage':
        return <RevenueLeakageView />;
      case 'ai-advisor':
        return <AIAdvisorView />;
      case 'ai-agents':
        return <AIAgentsView />;
      case 'forecasting':
        return <ForecastingView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'scenario-planner':
        return <ScenarioPlannerView />;
      case 'alerts':
        return <AlertsView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <ReportsView />;
      case 'industry-taxonomy':
      case 'industry-sectors':
        return <IndustryTaxonomyView />;
      case 'gamification':
        return <GamificationDashboardView />;
      case 'team':
        return <TeamView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CEOCommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] print:bg-white text-slate-900 font-sans flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900 print:min-h-0 print:h-auto">
      {/* Fixed Sidebar */}
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-72 print:pl-0 flex flex-col min-h-screen print:min-h-0 print:h-auto">
        {/* Sticky Top Header */}
        <div className="print:hidden">
          <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} />
        </div>

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 print:p-0 overflow-y-auto print:overflow-visible">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNavigation onOpenFullMenu={() => setIsSidebarOpen(true)} />

      {/* Global Modals */}
      <div className="print:hidden">
        <CommandPaletteModal />
        <DailyBriefingModal />
        <OnboardingWizardModal />
        <DataImportModal />
        <ToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
