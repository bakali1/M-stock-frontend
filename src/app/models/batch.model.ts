import { AlertStatus } from '../utils/alerts.util';

export interface Batch {
  id: number;
  lotNumber: string;
  quantity: number;
  expirationDate: string;
  location: string;
  status: 'ACTIVE' | 'QUARANTINE' | 'RETIRED';
  productId: number;
  productName: string;
  nsnCode: string;
  daysUntilExpiration: number;
  expirationAlertLevel: AlertStatus;
  version: number;
}
