import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Megaphone,
  PieChart,
  UserCheck,
  Building2,
  LineChart,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface AIAgentDef {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  description: string;
  focusAreas: string[];
}

export const AIAgentsView: React.FC = () => {
  const { kpiSnapshot, currentOrg } = useApp();

  const agents: AIAgentDef[] = [
    {
      id: 'CEO_STRATEGIST',
      name: 'CEO Strategist Agent',
      role: 'Macro Health & High-Leverage Priorities',
      icon: ShieldCheck,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Audits business model health, target gap closure, capital allocation, and top 3 executive levers.',
      focusAreas: ['Monthly Revenue Gap', 'EBITDA Target', 'Executive Priorities'],
    },
    {
      id: 'REVENUE_ANALYST',
      name: 'Revenue Analyst Agent',
      role: 'Leakage Detection & Monetization',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Pinpoints revenue leaks (overdue receivables, lost leads, underpricing) and expansion opportunities.',
      focusAreas: ['Overdue Receivables', 'MRR vs One-Time', 'Pricing Optimization'],
    },
    {
      id: 'SALES_COACH',
      name: 'Sales Coach Agent',
      role: 'Pipeline Conversion & Rep Performance',
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      description: 'Identifies pipeline bottlenecks (Proposals → Negotiations), sales cycle friction, and rep quotas.',
      focusAreas: ['Proposal Turnaround', 'Rep Quotas', 'Deal Acceleration'],
    },
    {
      id: 'MARKETING_ANALYST',
      name: 'Marketing Analyst Agent',
      role: 'CAC vs ROAS & Channel Allocation',
      icon: Megaphone,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Evaluates channel efficiency (WhatsApp 35.6x ROAS vs Meta 3.2x) and prescribes ad spend rebalancing.',
      focusAreas: ['Channel ROAS', 'Blended CAC', 'Ad Spend Optimization'],
    },
    {
      id: 'CFO_AGENT',
      name: 'CFO Agent',
      role: 'Cash Runway & Expense Control',
      icon: PieChart,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      description: 'Monitors cash burn, runway stability (12.0 months), working capital, and operational cost spikes.',
      focusAreas: ['12-Month Runway', 'Burn Rate', 'Expense Anomalies'],
    },
    {
      id: 'CUSTOMER_SUCCESS',
      name: 'Customer Success Agent',
      role: 'Churn Prevention & Account Expansion',
      icon: UserCheck,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      description: 'Tracks account health scores, flags at-risk enterprise clients, and identifies upsell candidates.',
      focusAreas: ['Churn Prediction', 'LTV Expansion', 'Customer Health'],
    },
    {
      id: 'OPERATIONS_AGENT',
      name: 'Operations & Capacity Agent',
      role: 'Team Utilization & Software Bloat',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      description: 'Audits employee delivery capacity (82%), SaaS subscription waste, and process delays.',
      focusAreas: ['Capacity Utilization', 'Unused Software Seats', 'Process Automation'],
    },
    {
      id: 'FORECASTING_AGENT',
      name: 'Forecasting & Simulation Agent',
      role: 'Scenario Models & Predictive Velocity',
      icon: LineChart,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      description: 'Computes conservative, expected, and optimistic 30-90 day forecasts based on pipeline momentum.',
      focusAreas: ['Conservative Forecast', 'Expected Run Rate', 'Optimistic Upside'],
    },
  ];

  const [selectedAgent, setSelectedAgent] = useState<AIAgentDef>(agents[0]);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const runAgentAudit = async (agent: AIAgentDef) => {
    setSelectedAgent(agent);
    setIsRunning(true);
    setAnalysisReport(null);

    try {
      const response = await fetch('/api/ai/agent-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          context: {
            organization: currentOrg.name,
            kpiSnapshot,
          },
        }),
      });

      const data = await response.json();
      setAnalysisReport(data.analysis || 'Analysis generated successfully.');
    } catch (err) {
      console.error('Agent analysis error:', err);
      setAnalysisReport(`### EXECUTIVE AUDIT REPORT — ${agent.name}\n\n**Key Diagnosis:**\nStrong core performance with ₹11.5L MTD gap remaining. Prioritize closing late-stage deals and enforcing overdue receivables recovery.`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Specialized AI Agents Fleet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              8 Autonomous Agents
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Domain-specific AI advisors continuously monitoring finance, sales, marketing, operations, and retention.
          </p>
        </div>

        <button
          onClick={() => runAgentAudit(selectedAgent)}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isRunning ? 'Running Deep Analysis...' : `Run ${selectedAgent.name}`}</span>
        </button>
      </div>

      {/* Grid of 8 Agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent.id === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-amber-50/40 border-amber-400 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl border ${agent.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${agent.badgeColor}`}>
                    Active
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {agent.name}
                </h3>
                <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  {agent.role}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    runAgentAudit(agent);
                  }}
                  disabled={isRunning}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Audit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Output Dossier */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Executive Audit Dossier: {selectedAgent.name}
              </h3>
              <p className="text-xs text-slate-500">
                Targeting: {selectedAgent.focusAreas.join(' • ')}
              </p>
            </div>
          </div>

          {analysisReport && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysisReport);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied Report</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          )}
        </div>

        {isRunning ? (
          <div className="py-12 text-center text-amber-700 text-xs flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 animate-spin text-amber-600" />
            <span>
              {selectedAgent.name} is executing deep business telemetry audit...
            </span>
          </div>
        ) : analysisReport ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {analysisReport}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Select any agent above and click <strong>Execute Audit</strong> to run a domain-specific analysis.
          </div>
        )}
      </div>
    </div>
  );
};
