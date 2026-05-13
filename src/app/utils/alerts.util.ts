export type AlertStatus = 'EXPIRED' | 'CRITICAL' | 'ATTENTION' | 'NORMAL';

export function getAlertStatus(expirationDate: string): AlertStatus {
  const daysLeft = daysUntilExpiry(expirationDate);
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft < 7) return 'CRITICAL';
  if (daysLeft <= 30) return 'ATTENTION';
  return 'NORMAL';
}

export function getAlertColor(status: AlertStatus): string {
  const colors: Record<AlertStatus, string> = {
    EXPIRED: 'bg-[var(--app-neutral-muted)] border-[var(--app-border-strong)] text-[var(--app-text-primary)]',
    CRITICAL: 'bg-[var(--app-danger-muted)] border-[var(--app-border-strong)] text-[var(--app-danger-strong)]',
    ATTENTION: 'bg-[var(--app-warning-muted)] border-[var(--app-border-strong)] text-[var(--app-warning-strong)]',
    NORMAL: 'bg-[var(--app-success-muted)] border-[var(--app-border-strong)] text-[var(--app-success-strong)]'
  };
  return colors[status];
}

export function getAlertBadgeColor(status: AlertStatus): string {
  const colors: Record<AlertStatus, string> = {
    EXPIRED: 'bg-[var(--app-neutral-strong)] text-[var(--app-surface)]',
    CRITICAL: 'bg-[var(--app-danger)] text-white',
    ATTENTION: 'bg-[var(--app-warning-strong)] text-[var(--app-surface)]',
    NORMAL: 'bg-[var(--app-success-strong)] text-[var(--app-surface)]'
  };
  return colors[status];
}

export function daysUntilExpiry(expirationDate: string): number {
  const expiry = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ms = expiry.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatExpiryStatus(expirationDate: string): string {
  const days = daysUntilExpiry(expirationDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}
