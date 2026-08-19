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
  const { actions, updateActionStatus, addActionTask, currency, currentUser, currentOrg } = useApp();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProblem, setNewTaskProblem] = useState('');
  const [newTaskImpact, setNewTaskImpact] = useState(150000);
  const [newTaskOwner, setNewTaskOwner] = useState(currentUser.name);
  const [newTaskPriority, setNewTaskPriority] = useState<CEOActionTask['priority']>('HIGH');
  const [newTaskCategory, setNewTaskCategory] = useState('Revenue Acceleration');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addActionTask({
      title: newTaskTitle,
      problem: newTaskProblem || 'Operational revenue enhancement initiative.',
      recommendedAction: 'Execute milestone checkpoints with assigned owner.',
      expectedImpactAmount: Number(newTaskImpact) || 0,
      expectedImpactDescription: `Projected financial upside of ₹${(((Number(newTaskImpact) || 0) / 100000) || 0).toFixed(1)}L`,
      owner: newTaskOwner || currentUser.name,
      priority: newTaskPriority,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      category: newTaskCategory,
    });

    setNewTaskTitle('');
    setNewTaskProblem('');
    setIsCreateModalOpen(false);
  };

  const filteredTasks = actions.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = actions.filter((t) => t.status === 'Pending').length;
  const completedCount = actions.filter((t) => t.status === 'Completed').length;
  const totalImpact = actions
    .filter((t) => t.status === 'Pending')
    .reduce((sum, t) => sum + (t.expectedImpactAmount || 0), 0);

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
            id="btn-open-create-task"
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
              id={`filter-task-status-${st}`}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
              id={`filter-task-priority-${pr}`}
              onClick={() => setFilterPriority(pr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-slate-500 text-sm">
            No tasks match the active filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';
            const isCritical = task.priority === 'CRITICAL';

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
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
                      +{formatCurrency(task.expectedImpactAmount || 0, currency)}
                    </span>
                    <span className="text-slate-400">• {task.expectedImpactDescription}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 md:self-center">
                  <button
                    id={`btn-toggle-task-${task.id}`}
                    onClick={() =>
                      updateActionStatus(task.id, isDone ? 'Pending' : 'Completed')
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
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
          })
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create CEO Action Task</h2>
            <p className="text-xs text-slate-500 mb-4">Add a high-leverage initiative to track accountability and revenue impact.</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action Title</label>
                <input
                  id="input-task-title"
                  type="text"
                  required
                  placeholder="e.g. Renegotiate Cloud Provider Contract"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem & Context</label>
                <textarea
                  id="input-task-problem"
                  rows={2}
                  placeholder="Briefly describe what needs to be solved..."
                  value={newTaskProblem}
                  onChange={(e) => setNewTaskProblem(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Financial Upside (₹)</label>
                  <input
                    id="input-task-impact"
                    type="number"
                    value={newTaskImpact}
                    onChange={(e) => setNewTaskImpact(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900 font-mono-numeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    id="select-task-priority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner</label>
                  <input
                    id="input-task-owner"
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    id="select-task-category"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="Revenue Acceleration">Revenue Acceleration</option>
                    <option value="Cost Optimization">Cost Optimization</option>
                    <option value="Cash Flow Recovery">Cash Flow Recovery</option>
                    <option value="Customer Retention">Customer Retention</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-task"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
