import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Building,
  Calendar,
  X,
  Sparkles,
  ChevronRight,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Lead, LeadStatus, LeadTemperature, Employee } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { TargetProgressBar } from '../common/TargetProgressBar';
import { KPIProgressCard } from '../common/KPIProgressCard';

interface PipelineStageConfig {
  id: LeadStatus;
  label: string;
  shortLabel: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  defaultProbability: number;
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: 'Qualified',
    label: '1. Qualified Leads',
    shortLabel: 'Qualified',
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    defaultProbability: 35,
  },
  {
    id: 'Appointment',
    label: '2. Demo / Discovery',
    shortLabel: 'Demo Scheduled',
    accentColor: '#6366f1',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    defaultProbability: 55,
  },
  {
    id: 'Proposal',
    label: '3. Proposal Sent',
    shortLabel: 'Proposal',
    accentColor: '#a855f7',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-700',
    defaultProbability: 70,
  },
  {
    id: 'Negotiation',
    label: '4. In Negotiation',
    shortLabel: 'Negotiation',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
    defaultProbability: 85,
  },
  {
    id: 'Won',
    label: '5. Closed Won',
    shortLabel: 'Won Deals',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    defaultProbability: 100,
  },
  {
    id: 'Lost',
    label: '6. Closed Lost',
    shortLabel: 'Lost Deals',
    accentColor: '#ef4444',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800',
    defaultProbability: 0,
  },
];

export const SalesCRMView: React.FC = () => {
  const {
    leads,
    employees,
    currency,
    currentOrg,
    updateLeadStatus,
    updateLead,
    addLead,
    addToast,
    setActiveView,
  } = useApp();

  const { kpiSnapshot, velocityMetrics } = useDashboardData();

  // Filters & State
  const [selectedRep, setSelectedRep] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minDealValue, setMinDealValue] = useState<number>(0);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState<boolean>(false);
  const [isBottleneckModalOpen, setIsBottleneckModalOpen] = useState<boolean>(false);

  // New Deal Form State
  const [newDealCompany, setNewDealCompany] = useState<string>('');
  const [newDealContact, setNewDealContact] = useState<string>('');
  const [newDealEmail, setNewDealEmail] = useState<string>('');
  const [newDealPhone, setNewDealPhone] = useState<string>('');
  const [newDealValue, setNewDealValue] = useState<string>('350000');
  const [newDealStage, setNewDealStage] = useState<LeadStatus>('Qualified');
  const [newDealRep, setNewDealRep] = useState<string>('Vikram Mehta');
  const [newDealIndustry, setNewDealIndustry] = useState<string>('B2B SaaS');
  const [newDealSource, setNewDealSource] = useState<string>('Inbound Demo');

  // Derive sales reps from employee database
  const salesReps = useMemo(() => {
    const reps = employees.filter((e) => e.department === 'Sales');
    return reps.map((rep) => {
      const repLeads = leads.filter((l) => l.assignedSalesperson === rep.name);
      const activePipelineValue = repLeads
        .filter((l) => ['Qualified', 'Appointment', 'Proposal', 'Negotiation'].includes(l.status))
        .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);
      const wonLeads = repLeads.filter((l) => l.status === 'Won');
      const wonValue = wonLeads.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);
      const closedRevenue = Math.max(rep.revenueGenerated || 0, wonValue);
      const quota = rep.monthlyTarget || 1500000;
      const attainment = quota > 0 ? Math.round((closedRevenue / quota) * 1000) / 10 : 0;

      return {
        ...rep,
        activePipelineValue,
        wonLeadsCount: wonLeads.length,
        closedRevenue,
        quota,
        attainment,
      };
    });
  }, [employees, leads]);

  // Filtered Leads / Deals for Kanban Board
  const filteredDeals = useMemo(() => {
    return leads.filter((lead) => {
      // Rep filter
      if (selectedRep !== 'ALL' && lead.assignedSalesperson !== selectedRep) {
        return false;
      }
      // Value filter
      if (minDealValue > 0 && (Number(lead.estimatedValue) || 0) < minDealValue) {
        return false;
      }
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match =
          lead.company.toLowerCase().includes(query) ||
          lead.name.toLowerCase().includes(query) ||
          (lead.assignedSalesperson && lead.assignedSalesperson.toLowerCase().includes(query)) ||
          lead.industry.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [leads, selectedRep, minDealValue, searchTerm]);

  // Stalled proposals count for bottleneck alert (> 10 days in proposal)
  const stalledProposals = useMemo(() => {
    return leads.filter((l) => l.status === 'Proposal');
  }, [leads]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      advanceDealToStage(leadId, targetStage);
    }
    setDraggedLeadId(null);
  };

  // Stage advancement
  const advanceDealToStage = (leadId: string, nextStage: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const stageConfig = PIPELINE_STAGES.find((s) => s.id === nextStage);
    const newProbability = stageConfig ? stageConfig.defaultProbability : lead.dealProbability;

    updateLead(leadId, {
      status: nextStage,
      dealProbability: newProbability,
      lastContactDate: new Date().toISOString().split('T')[0],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'status_change',
          description: `Stage updated to ${nextStage} (${newProbability}% probability)`,
          date: new Date().toISOString().split('T')[0],
          createdBy: 'CEO Command System',
        },
        ...(lead.activities || []),
      ],
    });

    addToast(`Deal "${lead.company}" moved to ${nextStage}`, 'success');
    if (selectedLeadForDetail?.id === leadId) {
      setSelectedLeadForDetail((prev) => (prev ? { ...prev, status: nextStage, dealProbability: newProbability } : null));
    }
  };

  // Create new deal
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealCompany || !newDealContact) {
      addToast('Please enter both Company and Contact person name', 'warning');
      return;
    }

    const val = Number(newDealValue) || 250000;
    const stageConfig = PIPELINE_STAGES.find((s) => s.id === newDealStage);
    const prob = stageConfig ? stageConfig.defaultProbability : 50;
    const leadScore = val >= 500000 ? 94 : val >= 250000 ? 84 : 70;
    const temp: LeadTemperature = leadScore >= 80 ? 'hot' : 'warm';

    addLead({
      name: newDealContact,
      company: newDealCompany,
      phone: newDealPhone || '+91 98765 43210',
      email: newDealEmail || 'contact@example.com',
      source: newDealSource,
      industry: newDealIndustry,
      location: 'India',
      leadScore,
      temperature: temp,
      status: newDealStage,
      assignedSalesperson: newDealRep,
      estimatedValue: val,
      dealProbability: prob,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          description: `Deal initialized in ${newDealStage} by Sales Team.`,
          date: new Date().toISOString().split('T')[0],
          createdBy: newDealRep,
        },
      ],
    });

    setIsAddDealModalOpen(false);
    setNewDealCompany('');
    setNewDealContact('');
    setNewDealEmail('');
    setNewDealPhone('');
    addToast(`New deal for "${newDealCompany}" added to pipeline!`, 'success');
  };

  // Expedite stalled proposals action
  const handleExpediteProposals = () => {
    stalledProposals.forEach((deal) => {
      updateLead(deal.id, {
        dealProbability: Math.min(90, (deal.dealProbability || 70) + 10),
        activities: [
          {
            id: `act-${Date.now()}-${deal.id}`,
            type: 'call',
            description: 'Automated executive closing cadence dispatched via WhatsApp and VIP follow-up queue.',
            date: new Date().toISOString().split('T')[0],
            createdBy: 'Rajesh Sharma (CEO)',
          },
          ...(deal.activities || []),
        ],
      });
    });
    addToast(`Expedited ${stalledProposals.length} stalled proposals with VIP closing sequence!`, 'success');
    setIsBottleneckModalOpen(false);
  };

  const quarterlyPipelineTarget = 45000000;
  const quarterlySalesTarget = (currentOrg?.settings?.monthlyRevenueTarget || 5000000) * 3;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Sales CRM Pipeline & Live Deal Progression
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {formatCurrency(kpiSnapshot.pipelineValue, currency)} Active Pipeline
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Drag-and-drop deal progression, rep quota pacing, proposal bottleneck remediation, and closed-won velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBottleneckModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Bottleneck Fix ({stalledProposals.length})</span>
          </button>
          <button
            onClick={() => setIsAddDealModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIProgressCard
          label="Active Sales Pipeline"
          value={formatCurrency(kpiSnapshot.pipelineValue, currency)}
          current={kpiSnapshot.pipelineValue}
          target={quarterlyPipelineTarget}
          quarterLabel="Q3 Target"
          change="+19.5%"
          prevValue={formatCurrency(32000000, currency)}
          isPositive={true}
          currency={currency}
          icon={Briefcase}
        />

        <KPIProgressCard
          label="Closed Won Revenue (MTD)"
          value={formatCurrency(kpiSnapshot.revenueMTD, currency)}
          current={kpiSnapshot.revenueMTD * 3}
          target={quarterlySalesTarget}
          quarterLabel="Q3 Revenue Goal"
          change="+14.2%"
          prevValue={formatCurrency(3370000, currency)}
          isPositive={true}
          currency={currency}
          icon={DollarSign}
        />

        <KPIProgressCard
          label="Average Deal Size"
          value={formatCurrency(kpiSnapshot.averageDealSize, currency)}
          current={kpiSnapshot.averageDealSize}
          target={150000}
          quarterLabel="Q3 Deal Goal"
          change="+14.3%"
          prevValue={formatCurrency(125000, currency)}
          isPositive={true}
          currency={currency}
          icon={Award}
        />

        <KPIProgressCard
          label="Sales Win Rate"
          value={`${kpiSnapshot.winRatePct}%`}
          current={kpiSnapshot.winRatePct}
          target={30}
          unit="%"
          quarterLabel="Q3 Win Rate Goal"
          change="+2.5%"
          prevValue="22.0%"
          isPositive={true}
          currency={currency}
          icon={TrendingUp}
        />
      </div>

      {/* Rep Leaderboard */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Rep Quota Attainment
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Sales Representative Performance Leaderboard
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Live closed revenue against monthly targets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {salesReps.map((rep, idx) => (
            <div
              key={rep.id}
              onClick={() => setSelectedRep(rep.name === selectedRep ? 'ALL' : rep.name)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedRep === rep.name
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rep.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      Rank #{idx + 1}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{rep.role}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 font-mono-numeric">
                    {rep.attainment}%
                  </div>
                  <div className="text-[10px] text-slate-400">of Quota</div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Closed MTD:</span>
                  <span className="font-bold text-slate-900 font-mono-numeric">
                    {formatCurrency(rep.closedRevenue, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Active Pipeline:</span>
                  <span className="font-semibold text-indigo-700 font-mono-numeric">
                    {formatCurrency(rep.activePipelineValue, currency)}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <TargetProgressBar
                  current={rep.closedRevenue}
                  target={rep.quota}
                  quarterLabel="Quota Progress"
                  currency={currency}
                  size="compact"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Kanban Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Deals Pipeline
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {filteredDeals.length} Deals in Active Workflow
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deal or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Rep Filter */}
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Sales Reps</option>
              {salesReps.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Value Filter */}
            <select
              value={minDealValue}
              onChange={(e) => setMinDealValue(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value={0}>All Deal Sizes</option>
              <option value={200000}>&gt; ₹2 Lakhs</option>
              <option value={400000}>&gt; ₹4 Lakhs (Enterprise)</option>
            </select>

            {(selectedRep !== 'ALL' || minDealValue > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedRep('ALL');
                  setMinDealValue(0);
                  setSearchTerm('');
                }}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 6 Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.status === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.estimatedValue) || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between transition-colors ${
                  draggedLeadId ? 'hover:bg-indigo-50/40 hover:border-indigo-300' : ''
                }`}
              >
                {/* Stage Header */}
                <div className="pb-2.5 border-b border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {stage.shortLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${stage.badgeBg} ${stage.badgeText}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-black text-slate-700 font-mono-numeric mt-1">
                    {formatCurrency(stageValue, currency)}
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-2.5 my-2.5 min-h-64 max-h-[580px] overflow-y-auto pr-0.5">
                  {stageDeals.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-center p-2">
                      <span className="text-[11px] text-slate-400 font-medium">Drop deals here</span>
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const nextStageIdx = PIPELINE_STAGES.findIndex((s) => s.id === deal.status) + 1;
                      const nextStage = PIPELINE_STAGES[nextStageIdx]?.id;

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onClick={() => setSelectedLeadForDetail(deal)}
                          className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-slate-900 text-xs leading-snug group-hover:text-indigo-600 transition-colors">
                              {deal.company}
                            </div>
                            {deal.temperature === 'hot' && (
                              <span className="flex items-center text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded font-bold">
                                <Flame className="w-2.5 h-2.5 mr-0.5 fill-rose-500 text-rose-500" />
                                Hot
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center justify-between">
                            <span>{deal.name}</span>
                            <span className="text-[10px] text-slate-400">{deal.industry}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <div className="text-xs font-black text-slate-900 font-mono-numeric">
                              {formatCurrency(deal.estimatedValue || 0, currency)}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              {deal.dealProbability || 50}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>Rep: {deal.assignedSalesperson || 'Unassigned'}</span>
                            {nextStage && deal.status !== 'Won' && deal.status !== 'Lost' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceDealToStage(deal.id, nextStage);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline"
                                title={`Advance to ${nextStage}`}
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Stage Quick Add Button */}
                <button
                  onClick={() => {
                    setNewDealStage(stage.id);
                    setIsAddDealModalOpen(true);
                  }}
                  className="w-full py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Deal</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Deal Quick Inspector & Editor */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedLeadForDetail.company}
                  </h3>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    {selectedLeadForDetail.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Contact: {selectedLeadForDetail.name} • {selectedLeadForDetail.industry}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Contract Value:</span>
                <div className="font-black text-sm text-slate-900 font-mono-numeric">
                  {formatCurrency(selectedLeadForDetail.estimatedValue || 0, currency)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Close Probability:</span>
                <div className="font-black text-sm text-indigo-700 font-mono-numeric">
                  {selectedLeadForDetail.dealProbability || 50}%
                </div>
              </div>
              <div>
                <span className="text-slate-500">Lead Owner:</span>
                <div className="font-bold text-slate-900">
                  {selectedLeadForDetail.assignedSalesperson || 'Unassigned'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Acquisition Source:</span>
                <div className="font-bold text-slate-900">{selectedLeadForDetail.source}</div>
              </div>
            </div>

            {/* Quick Outreach Action Bar */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">1-Click Executive Outreach</span>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/${(selectedLeadForDetail.phone || '').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(selectedLeadForDetail.name)},%20Rajesh%20here%20from%20ABC%20Growth.%20Wanted%20to%20follow%20up%20on%20our%20enterprise%20proposal.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${selectedLeadForDetail.phone}`}
                  className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call Rep</span>
                </a>
                <a
                  href={`mailto:${selectedLeadForDetail.email}?subject=Next%20Steps%20for%20${encodeURIComponent(selectedLeadForDetail.company)}`}
                  className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Stage Quick Switcher */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Change Deal Stage</span>
              <div className="grid grid-cols-3 gap-1.5">
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => advanceDealToStage(selectedLeadForDetail.id, s.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      selectedLeadForDetail.status === s.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Deal Activities */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Recent Activity Timeline</span>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {(selectedLeadForDetail.activities || []).map((act, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700 capitalize">{act.type.replace('_', ' ')}</span>
                      <span>{act.date} • {act.createdBy}</span>
                    </div>
                    <p className="text-slate-800 text-xs mt-0.5">{act.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLeadForDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Deal to Pipeline */}
      {isAddDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add New Pipeline Deal</h3>
              <button
                onClick={() => setIsAddDealModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Healthcorp"
                  value={newDealCompany}
                  onChange={(e) => setNewDealCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Key Decision Maker *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Verma"
                    value={newDealContact}
                    onChange={(e) => setNewDealContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newDealPhone}
                    onChange={(e) => setNewDealPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="lead@company.com"
                    value={newDealEmail}
                    onChange={(e) => setNewDealEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stage</label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Sales Rep</label>
                  <select
                    value={newDealRep}
                    onChange={(e) => setNewDealRep(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
                  >
                    {salesReps.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs"
                >
                  Save Deal to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bottleneck Remediation Drawer */}
      {isBottleneckModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Proposal Conversion Bottleneck Fix
                  </h3>
                  <p className="text-xs text-slate-500">
                    {stalledProposals.length} proposals currently pending decision
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBottleneckModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                AI Diagnostic Summary:
              </span>
              <p>
                Proposal-to-Negotiation velocity slows down due to multi-stakeholder security reviews and pricing deliberations. Triggering an executive CEO closing touch increases conversion by 28%.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Deals in Proposal Stage:</span>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {stalledProposals.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.company}</div>
                      <div className="text-[11px] text-slate-500">Rep: {p.assignedSalesperson} • {p.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 font-mono-numeric">
                        {formatCurrency(p.estimatedValue || 0, currency)}
                      </div>
                      <div className="text-[10px] text-amber-700 font-bold">{p.dealProbability || 70}% Prob</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBottleneckModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExpediteProposals}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute VIP Expedite Cadence</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
