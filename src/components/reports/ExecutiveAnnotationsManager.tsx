import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Shield,
  Tag,
  Save,
  X,
  FileSignature,
} from 'lucide-react';

export interface ReportAnnotation {
  id: string;
  section: string;
  author: string;
  role: string;
  priority: 'HIGH' | 'MEDIUM' | 'INFO';
  content: string;
  timestamp: string;
}

interface ExecutiveAnnotationsManagerProps {
  annotations: ReportAnnotation[];
  onAddAnnotation: (annotation: Omit<ReportAnnotation, 'id' | 'timestamp'>) => void;
  onUpdateAnnotation: (id: string, updates: Partial<ReportAnnotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  defaultAuthorName?: string;
  defaultRole?: string;
}

export const SECTION_TARGET_OPTIONS = [
  '1. Executive Macro Strategy & P&L Performance',
  '2. Revenue Leakage & Overdue Collections Recovery',
  '3. Sales Pipeline Velocity & Account Expansion',
  '4. Unit Economics, CAC Payback & Margin Targets',
  '5. Board Governance & Strategic Investor Sign-off',
  'General Strategic Observation',
];

export const ExecutiveAnnotationsManager: React.FC<ExecutiveAnnotationsManagerProps> = ({
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  defaultAuthorName = 'Rajesh Sharma',
  defaultRole = 'CEO',
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [section, setSection] = useState(SECTION_TARGET_OPTIONS[0]);
  const [author, setAuthor] = useState(defaultAuthorName);
  const [role, setRole] = useState(defaultRole);
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'INFO'>('HIGH');
  const [content, setContent] = useState('');

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddAnnotation({
      section,
      author: author.trim() || defaultAuthorName,
      role: role.trim() || defaultRole,
      priority,
      content: content.trim(),
    });

    setContent('');
    setIsAddingNew(false);
  };

  const handleStartEdit = (ann: ReportAnnotation) => {
    setEditingId(ann.id);
    setSection(ann.section);
    setAuthor(ann.author);
    setRole(ann.role);
    setPriority(ann.priority);
    setContent(ann.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!content.trim()) return;
    onUpdateAnnotation(id, {
      section,
      author,
      role,
      priority,
      content,
    });
    setEditingId(null);
    setContent('');
  };

  return (
    <section
      id="executive-annotations-section"
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs"
      aria-labelledby="annotations-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-900 flex items-center justify-center font-bold">
              <FileSignature className="w-4 h-4 text-amber-800" aria-hidden="true" />
            </div>
            <h3 id="annotations-heading" className="text-base font-bold text-slate-900">
              Executive Annotations & Strategic Sign-off Commentary
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
              {annotations.length} Notes Included
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Attach executive commentary directly onto sections. These annotations are embedded into all PDF exports and CSV summaries.
          </p>
        </div>

        {!isAddingNew && (
          <button
            type="button"
            id="btn-add-executive-annotation"
            onClick={() => {
              setIsAddingNew(true);
              setEditingId(null);
              setContent('');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto print:hidden"
            aria-label="Add new custom executive annotation to report"
          >
            <Plus className="w-4 h-4" />
            <span>Add Executive Note</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form (Hidden in print) */}
      {(isAddingNew || editingId) && (
        <form
          onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleSaveNew}
          className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4 animate-in fade-in duration-150 print:hidden"
          aria-label="Executive annotation editor"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-800" />
              <span>{editingId ? 'Edit Executive Note' : 'Draft New Executive Annotation'}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingId(null);
                setContent('');
              }}
              className="text-amber-800 hover:text-amber-950 p-1"
              aria-label="Cancel annotation editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target Section */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Target Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {SECTION_TARGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Name & Role */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Author & Executive Role
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full p-2 rounded-xl bg-white border border-amber-200 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Role (e.g. CEO)"
                  className="w-full p-2 rounded-xl bg-white border border-amber-200 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Priority / Tone */}
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Priority Tier
              </label>
              <div className="flex gap-2">
                {(['HIGH', 'MEDIUM', 'INFO'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      priority === p
                        ? p === 'HIGH'
                          ? 'bg-rose-600 text-white border-rose-700'
                          : p === 'MEDIUM'
                          ? 'bg-amber-600 text-white border-amber-700'
                          : 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note Textarea */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Executive Commentary & Strategic Guidance
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E.g., Board directive: Focus on recovering the ₹3.8L trapped in overdue invoices before committing to expansion hiring in Q3."
              className="w-full p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingId(null);
                setContent('');
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-amber-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingId ? 'Update Note' : 'Attach Note to Report'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Annotations Cards List */}
      <div className="space-y-3">
        {annotations.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No custom annotations added yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Add Executive Note&quot; to attach commentary before printing or exporting.
            </p>
          </div>
        ) : (
          annotations.map((ann) => {
            const badgeColor =
              ann.priority === 'HIGH'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : ann.priority === 'MEDIUM'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200';

            return (
              <div
                key={ann.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
                      {ann.priority} PRIORITY
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {ann.section}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700">{ann.author}</span>
                      <span className="text-slate-400 font-normal">({ann.role})</span>
                      <span className="text-slate-300">•</span>
                      <span>{ann.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(ann)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label={`Edit annotation for ${ann.section}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAnnotation(ann.id)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label={`Delete annotation for ${ann.section}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {ann.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
