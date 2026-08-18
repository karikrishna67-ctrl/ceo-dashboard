import React, { useState } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  Award,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/formatters';

export const TeamView: React.FC = () => {
  const { employees, currency, kpiSnapshot } = useApp();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  const filteredEmployees = employees.filter((e) => {
    if (selectedDepartment !== 'ALL' && e.department !== selectedDepartment) return false;
    return true;
  });

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgUtilization = Math.round(
    employees.reduce((sum, e) => sum + e.capacityUtilizationPct, 0) / (employees.length || 1)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Team Productivity & Capacity Utilization
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {employees.length} Team Members
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Department headcount, quota attainment, capacity utilization, and payroll cost efficiency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Monthly Payroll:</span>
            <div className="text-lg font-black text-slate-900 font-mono-numeric">
              {formatCurrency(totalPayroll, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Capacity Utilization</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {avgUtilization}%
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-medium">Optimal operating range: 75% - 85%</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Revenue per Employee</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            {formatCurrency(Math.round(kpiSnapshot.revenueMTD / (employees.length || 1)), currency)}
          </div>
          <div className="text-xs text-amber-700 mt-1 font-medium">+18.4% above sector baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Delivery Bottleneck Risk</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numeric mt-2">
            Low
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Engineering has 18% available buffer</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-2 flex flex-wrap gap-2 shadow-xs">
        {['ALL', 'Leadership', 'Sales', 'Engineering', 'Marketing', 'Operations', 'Finance'].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedDepartment === dept
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Team Roster Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
              <th className="py-3 px-3">Team Member</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Monthly Salary</th>
              <th className="py-3 px-3">Capacity Utilization</th>
              <th className="py-3 px-3 text-right">Quota / Target Attainment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-numeric">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-3 font-sans">
                  <div className="font-bold text-slate-900">{emp.name}</div>
                  <div className="text-[11px] text-slate-500">{emp.title}</div>
                </td>
                <td className="py-3.5 px-3 font-sans text-slate-600">{emp.department}</td>
                <td className="py-3.5 px-3 text-slate-900 font-bold">
                  {formatCurrency(emp.salary, currency)}
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          emp.capacityUtilizationPct > 90
                            ? 'bg-rose-500'
                            : emp.capacityUtilizationPct >= 75
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${emp.capacityUtilizationPct}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-700">{emp.capacityUtilizationPct}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-right font-bold">
                  {emp.quotaAttainmentPct ? (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        emp.quotaAttainmentPct >= 90
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {emp.quotaAttainmentPct}% Attainment
                    </span>
                  ) : (
                    <span className="text-slate-400 font-sans text-[11px]">N/A (Fixed Role)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
