import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
};

/**
 * Formats a numeric currency amount into executive readable format.
 * For INR: uses Lakhs (L) and Crores (Cr)
 * For others: uses K, M, B
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: CurrencyCode = 'INR',
  compact: boolean = true
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || '₹'}0`;
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  if (!compact) {
    if (currency === 'INR') {
      return `${isNegative ? '-' : ''}${symbol}${absVal.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
      })}`;
    }
    return `${isNegative ? '-' : ''}${symbol}${absVal.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    })}`;
  }

  // Compact formats
  if (currency === 'INR') {
    if (absVal >= 10000000) {
      const cr = absVal / 10000000;
      return `${isNegative ? '-' : ''}${symbol}${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
    }
    if (absVal >= 100000) {
      const l = absVal / 100000;
      return `${isNegative ? '-' : ''}${symbol}${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
    }
    if (absVal >= 1000) {
      const k = absVal / 1000;
      return `${isNegative ? '-' : ''}${symbol}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
    return `${isNegative ? '-' : ''}${symbol}${absVal.toLocaleString('en-IN')}`;
  } else {
    if (absVal >= 1000000000) {
      const b = absVal / 1000000000;
      return `${isNegative ? '-' : ''}${symbol}${b.toFixed(1)}B`;
    }
    if (absVal >= 1000000) {
      const m = absVal / 1000000;
      return `${isNegative ? '-' : ''}${symbol}${m.toFixed(1)}M`;
    }
    if (absVal >= 1000) {
      const k = absVal / 1000;
      return `${isNegative ? '-' : ''}${symbol}${k.toFixed(1)}K`;
    }
    return `${isNegative ? '-' : ''}${symbol}${absVal.toLocaleString('en-US')}`;
  }
}

export function formatPercent(value: number | undefined | null, includeSign: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
