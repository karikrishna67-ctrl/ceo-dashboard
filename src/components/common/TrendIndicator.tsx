import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

export interface TrendIndicatorProps {
  /** Numerical or string formatted value to display */
  value?: string | number;
  /** Numerical percentage change compared to previous period (e.g., +14.2 or -3.5) */
  change?: number;
  /** Explicit direction ('up' | 'down' | 'flat'). Inferred from `change` if omitted */
  direction?: 'up' | 'down' | 'flat';
  /**
   * Whether 'up' is considered positive/good.
   * Defaults to true (e.g., Revenue, Profit, LTV, Retention).
   * Set to false for metrics where a drop is favorable (e.g., CAC, COGS, OPEX, Burn Rate, Churn, DSO).
   */
  isPositiveGood?: boolean;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Render mode */
  variant?: 'inline-icon' | 'badge' | 'full';
  /** Optional previous period label or comparison text for tooltip */
  comparisonLabel?: string;
  /** Optional custom CSS classes */
  className?: string;
  /** Format of the change value (defaults to percentage '%') */
  changeUnit?: string;
}

/**
 * TrendIndicator: Renders clean, high-contrast trend icons (up/down arrows)
 * next to numerical values indicating period-over-period growth or decline.
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  change,
  direction,
  isPositiveGood = true,
  size = 'sm',
  variant = 'inline-icon',
  comparisonLabel = 'vs previous period',
  className = '',
  changeUnit = '%',
}) => {
  // Determine direction from change if not explicitly provided
  const resolvedDirection: 'up' | 'down' | 'flat' =
    direction ||
    (change !== undefined
      ? change > 0.05
        ? 'up'
        : change < -0.05
        ? 'down'
        : 'flat'
      : 'flat');

  // Determine if the current trend is favorable/good
  const isFavorable =
    resolvedDirection === 'flat'
      ? null
      : isPositiveGood
      ? resolvedDirection === 'up'
      : resolvedDirection === 'down';

  // Sizing definitions
  const iconSizeClass =
    size === 'xs'
      ? 'w-3 h-3'
      : size === 'md'
      ? 'w-4 h-4'
      : 'w-3.5 h-3.5';

  const textSizeClass =
    size === 'xs'
      ? 'text-[10px]'
      : size === 'md'
      ? 'text-xs'
      : 'text-[11px]';

  // Color schemas based on favorability
  const colorClasses =
    isFavorable === true
      ? {
          text: 'text-emerald-700',
          icon: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          indicator: 'text-emerald-600',
        }
      : isFavorable === false
      ? {
          text: 'text-rose-700',
          icon: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          indicator: 'text-rose-600',
        }
      : {
          text: 'text-slate-600',
          icon: 'text-slate-500',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          indicator: 'text-slate-500',
        };

  // Render Icon
  const renderIcon = () => {
    if (resolvedDirection === 'up') {
      return (
        <ArrowUpRight
          className={`${iconSizeClass} ${colorClasses.icon} shrink-0 stroke-[2.5]`}
          aria-hidden="true"
        />
      );
    }
    if (resolvedDirection === 'down') {
      return (
        <ArrowDownRight
          className={`${iconSizeClass} ${colorClasses.icon} shrink-0 stroke-[2.5]`}
          aria-hidden="true"
        />
      );
    }
    return (
      <Minus
        className={`${iconSizeClass} ${colorClasses.icon} shrink-0 stroke-[2.5]`}
        aria-hidden="true"
      />
    );
  };

  const formattedChange =
    change !== undefined
      ? `${change > 0 ? '+' : ''}${change.toFixed(1)}${changeUnit}`
      : resolvedDirection === 'up'
      ? '+Growth'
      : resolvedDirection === 'down'
      ? '-Decline'
      : 'Flat';

  const ariaDescription = `Value: ${value || ''}, Trend: ${
    resolvedDirection === 'up'
      ? 'Growth/Increase'
      : resolvedDirection === 'down'
      ? 'Decline/Decrease'
      : 'Unchanged'
  } ${formattedChange} ${comparisonLabel}`;

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono-numeric font-bold border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} ${textSizeClass} ${className}`}
        title={`${formattedChange} ${comparisonLabel}`}
        aria-label={ariaDescription}
      >
        {renderIcon()}
        <span>{formattedChange}</span>
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label={ariaDescription}
      >
        {value !== undefined && (
          <span className="font-mono-numeric font-bold text-slate-900">
            {value}
          </span>
        )}
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono-numeric font-semibold border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} ${textSizeClass}`}
          title={`${formattedChange} ${comparisonLabel}`}
        >
          {renderIcon()}
          <span>{formattedChange}</span>
        </span>
      </div>
    );
  }

  // Default 'inline-icon' variant
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono-numeric ${className}`}
      title={`${formattedChange} ${comparisonLabel}`}
      aria-label={ariaDescription}
    >
      {value !== undefined && (
        <span className="font-semibold text-slate-900">{value}</span>
      )}
      <span
        className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded font-bold ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border} border text-[10px]`}
      >
        {renderIcon()}
        {change !== undefined && <span>{formattedChange}</span>}
      </span>
    </span>
  );
};
