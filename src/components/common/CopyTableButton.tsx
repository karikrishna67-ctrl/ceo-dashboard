import React, { useState } from 'react';
import { Copy, Check, Mail, ChevronDown } from 'lucide-react';
import { copyTableToClipboard, CopyTableOptions } from '../../utils/clipboardUtils';

interface CopyTableButtonProps {
  /** Options for generating the formatted email table */
  options: CopyTableOptions;
  /** Label for the button */
  label?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Optional extra classes */
  className?: string;
  /** Optional callback after successful copy */
  onCopySuccess?: () => void;
  /** Optional element ID for testing / accessibility */
  id?: string;
}

export const CopyTableButton: React.FC<CopyTableButtonProps> = ({
  options,
  label = 'Copy for Email',
  size = 'sm',
  className = '',
  onCopySuccess,
  id = 'copy-table-to-clipboard-btn',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTableToClipboard(options);
    if (success) {
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-1 text-[10px] gap-1'
      : size === 'md'
      ? 'px-3.5 py-2 text-xs gap-2'
      : 'px-2.5 py-1.5 text-xs gap-1.5';

  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="relative inline-flex items-center">
      <button
        id={id}
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={copied ? 'Table copied to clipboard for email' : 'Copy formatted table data to clipboard for email'}
        title="Copy filtered table as formatted text & HTML ready to paste into Gmail, Outlook, or Slack"
        className={`inline-flex items-center font-bold rounded-lg border transition-all cursor-pointer shadow-2xs select-none ${sizeClasses} ${
          copied
            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
            : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className={`${iconSize} stroke-[2.5] text-white animate-in zoom-in-75 duration-200`} aria-hidden="true" />
            <span>Copied for Email!</span>
          </>
        ) : (
          <>
            <Copy className={`${iconSize} text-slate-500 group-hover:text-slate-700`} aria-hidden="true" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Screen reader live announcement */}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Filtered table copied to clipboard in rich format for email' : ''}
      </span>
    </div>
  );
};
