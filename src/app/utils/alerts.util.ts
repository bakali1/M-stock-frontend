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
    EXPIRED: 'bg-gray-100 border-gray-300 text-gray-900',
    CRITICAL: 'bg-red-100 border-red-300 text-red-900',
    ATTENTION: 'bg-orange-100 border-orange-300 text-orange-900',
    NORMAL: 'bg-green-100 border-green-300 text-green-900'
  };
  return colors[status];
}

export function getAlertBadgeColor(status: AlertStatus): string {
  const colors: Record<AlertStatus, string> = {
    EXPIRED: 'bg-gray-500 text-white',
    CRITICAL: 'bg-red-500 text-white',
    ATTENTION: 'bg-orange-500 text-white',
    NORMAL: 'bg-green-500 text-white'
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
