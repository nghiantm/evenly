import { GroupRole } from '@/types';

/** Format a number as currency. Falls back gracefully if Intl is unavailable. */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Format an ISO date string to a readable date (e.g. "Mar 15, 2024"). */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Format an ISO datetime string to a readable datetime. */
export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/** Return today's date as YYYY-MM-DD (used as form defaults). */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Check if a role has at least ADMIN-level permissions. */
export function isAtLeastAdmin(role: GroupRole): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

/** Check if a role is the group OWNER. */
export function isOwner(role: GroupRole): boolean {
  return role === 'OWNER';
}

/** Get initials from a display name for avatar fallback. */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Round a number to 2 decimal places. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'CHF',
  'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'MXN', 'INR', 'BRL',
  'KRW', 'VND', 'THB', 'IDR',
];

export { SUPPORTED_CURRENCIES };
