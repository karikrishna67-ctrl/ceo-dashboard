import React from 'react';
import { Organization } from '../../types';

interface PrintDocumentHeaderProps {
  currentOrg: Organization;
  reportType: string;
  periodLabel: string;
}

export const PrintDocumentHeader: React.FC<PrintDocumentHeaderProps> = ({
  currentOrg,
  reportType,
  periodLabel,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const reportTitle =
    reportType === 'INDUSTRY_TAXONOMY'
      ? 'Industry Benchmark & Sector Taxonomy Dossier'
      : reportType === 'P_AND_L'
      ? 'Profit & Loss Statement (P&L) & Margin Audit'
      : reportType === 'SALES_PIPELINE'
      ? 'Sales Velocity & Rep Capacity Audit'
      : reportType === 'UNIT_ECONOMICS'
      ? 'Unit Economics & CAC Payback Dossier'
      : 'Executive Business Intelligence & Board Briefing';

  return (
    <header
      id="printable-official-header"
      className="print-app-logo-header print-only-block mb-6 pb-4 border-b-2 border-slate-900 text-slate-900"
      aria-label="Official Executive Print Document Header with Monochrome Application Logo"
    >
      {/* Top Classification Banner */}
      <div className="flex items-center justify-between text-[9pt] font-mono uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-black px-1.5 py-0.5 bg-slate-900 text-white text-[8pt] rounded-xs">
            CONFIDENTIAL
          </span>
          <span className="font-bold">EXECUTIVE COMMITTEE & BOARD OF DIRECTORS</span>
        </div>
        <div className="text-right text-slate-600">
          DOCUMENT REF: <strong className="text-slate-900">DOC-AICE-2026-EXEC</strong>
        </div>
      </div>

      {/* Main Logo & Enterprise Branding Grid */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Monochrome Application Logo & System Title */}
        <div className="flex items-center gap-3.5 print-monochrome-container">
          {/* Vector High-Resolution Monochrome Application Logo */}
          <div
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-900 rounded-lg p-1.5 print-logo-box"
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full print-monochrome-svg"
              aria-label="AI CEO Command Center Logo"
            >
              {/* Outer Geometric Hexagon */}
              <path
                d="M24 4L42 14.3923V35.177L24 45.5692L6 35.177V14.3923L24 4Z"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Inner Node Lattice */}
              <circle cx="24" cy="16" r="3" fill="#ffffff" />
              <circle cx="15" cy="30" r="3" fill="#ffffff" />
              <circle cx="33" cy="30" r="3" fill="#ffffff" />
              {/* Interconnect Vectors */}
              <path
                d="M24 16L15 30M24 16L33 30M15 30H33"
                stroke="#ffffff"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              {/* Center Core Monogram */}
              <text
                x="24"
                y="27"
                textAnchor="middle"
                fontSize="6"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="sans-serif"
              >
                AI
              </text>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase font-sans print-logo-title">
                AI CEO COMMAND CENTER
              </h1>
              <span className="text-[8pt] font-black uppercase px-1.5 py-0.2 bg-slate-200 text-slate-900 rounded print-logo-pill">
                REVENUE CO-PILOT
              </span>
            </div>
            <div className="text-[8.5pt] font-bold text-slate-600 tracking-wide uppercase">
              Executive Decision Intelligence & Real-time Telemetry System
            </div>
            <div className="text-[7.5pt] text-slate-500 font-mono mt-0.5">
              Verified Ledger Synchronization • Zero-Discrepancy Audit Standard
            </div>
          </div>
        </div>

        {/* Right: Organization & Generation Metadata */}
        <div className="text-right flex flex-col items-end justify-between self-stretch">
          <div className="text-right">
            <div className="text-[10pt] font-black text-slate-900">{currentOrg.name}</div>
            <div className="text-[8pt] text-slate-600 font-medium">
              Sector: <strong>{currentOrg.industry || 'Technology & Software'}</strong>
            </div>
          </div>
          <div className="text-[8pt] font-mono text-slate-500 mt-1 text-right">
            <span>Generated: {currentDate}</span>
            <span className="mx-1.5">•</span>
            <span>Horizon: {periodLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
