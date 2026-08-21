import React from 'react';
import { Organization } from '../../types';

interface PrintDocumentFooterProps {
  currentOrg: Organization;
  reportType?: string;
  periodLabel?: string;
}

export const PrintDocumentFooter: React.FC<PrintDocumentFooterProps> = ({
  currentOrg,
  reportType,
  periodLabel,
}) => {
  return (
    <footer
      id="printable-official-footer"
      className="print-document-footer hidden print:flex"
      aria-label="Official Executive Print Document Footer with Company Context and Page Numbering"
    >
      {/* Left: Organization & Governance Context */}
      <div className="flex items-center gap-2 print-footer-left">
        <span className="font-bold text-slate-900">{currentOrg.name}</span>
        <span className="text-slate-400">•</span>
        <span>Sector: {currentOrg.industry || 'Technology & Software'}</span>
        <span className="text-slate-400">•</span>
        <span>CEO: {currentOrg.ceoName || 'Executive Office'}</span>
      </div>

      {/* Center: Classification Notice */}
      <div className="text-center font-mono uppercase tracking-wider text-[7.5pt] text-slate-500 print-footer-center">
        STRICTLY CONFIDENTIAL • BOARD OF DIRECTORS
      </div>

      {/* Right: Dynamic Page Numbering via CSS Counters */}
      <div className="flex items-center gap-2 font-mono text-slate-700 print-footer-right">
        {periodLabel && (
          <>
            <span className="text-[7.5pt] text-slate-500">{periodLabel}</span>
            <span className="text-slate-400">•</span>
          </>
        )}
        <span
          className="print-page-counter font-bold text-slate-900"
          data-page-counter="true"
        />
      </div>
    </footer>
  );
};
