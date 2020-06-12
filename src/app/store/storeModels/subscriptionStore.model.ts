import { InvoiceProductStoreModel } from './invoiceProductStore.model';

export class SubscriptionStoreModel {
  clientId: number;
  createdAt: string;
  createdBy: number;
  createdOn: number;
  description: string;
  dueDate: number;
  frequency: string;
  id: string;
  isActive: string;
  isSuspended: string;
  isTerminated: string;
  isUpfront: string;
  orgId: number;
  orgTrackingId: number;
  periodCount: number;
  product: InvoiceProductStoreModel;
  refNumber: string;
  request: { any };
  taxAmount: number;
  taxSelection: string;
  totalCost: number;
}
