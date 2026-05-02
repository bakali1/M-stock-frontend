export interface Transaction {
  id: number;
  type: 'IN' | 'OUT' | 'RETURN';
  quantity: number;
  reason?: string;
  createdAt: string;
  userId: number;
  userName: string;
  productId: number;
  productName: string;
  batchId: number;
  lotNumber: string;
}
