import React, { useState } from 'react';
import {
  CheckSquare,
  Flame,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CEOActionTask } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const TasksView: React.FC = () => {
  const { actions, updateActionStatus, currency, currentUser, currentOrg } = useApp();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProblem, setNewTaskProblem] = useState('');
  const [newTaskImpact, setNewTaskImpact] = useState(150000);
  const [newTaskOwner, setNewTaskOwner] = useState(currentUser.name);
  const [newTaskPriority, setNewTaskPriority] = useState<CEOActionTask['priority']>('HIGH');
  const [newTaskCategory, setNewTaskCategory] = useState('Revenue Acceleration');

  const filteredTasks = actions.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = actions.filter((t) => t.status === 'Pending').length;
  const completedCount = actions.filter((t) => t.status === 'Completed').length;
  const totalImpact = actions
    .filter((t) => t.status === 'Pending')
    .reduce((sum, t) => sum + t.expectedImpactAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              CEO Action Tasks & Execution Matrix
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            High-leverage executive tasks with quantified financial impacts, accountability owners, and real-time execution status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400">Total Pending Upside:</span>
            <div className="text-lg font-black text-emerald-600 font-mono-numeric">
              +{formatCurrency(totalImpact, currency)}
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Action</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Execution</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {pendingCount}
          </div>
          <div className="text-xs text-amber-700 mt-1 font-medium">Critical & high priority initiatives</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed This Period</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {completedCount}
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">Execution velocity on track</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Financial Value on Line</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono-numeric mt-2">
            {formatCurrency(totalImpact, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Estimated combined revenue/savings</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Status:</span>
          {(['ALL', 'Pending', 'In Progress', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Priority:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((pr) => (
            <button
              key={pr}
              onClick={() => setFilterPriority(pr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterPriority === pr
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'Completed';
          const isCritical = task.priority === 'CRITICAL';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-xl border bg-white shadow-xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                isDone
                  ? 'opacity-60 bg-slate-50 border-slate-200'
                  : isCritical
                  ? 'border-rose-300'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">{task.category}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Owner: <strong>{task.owner}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due: {task.dueDate}
                  </span>
                </div>

                <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {task.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {task.problem}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Financial Upside:</span>
                  <span className="font-bold text-emerald-600 font-mono-numeric">
                    +{formatCurrency(task.expectedImpactAmount, currency)}
                  </span>
                  <span className="text-slate-400">• {task.expectedImpactDescription}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 md:self-center">
                <button
                  onClick={() =>
                    updateActionStatus(task.id, isDone ? 'Pending' : 'Completed')
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Mark as Pending' : 'Mark Completed'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
