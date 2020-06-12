export class SubscriptionModel {
  clientId: number;
  clientName: string;
  product: any;
  createdBy: number;
  description: string;
  frequency: string;
  totalCost: number;
  taxSelection: string;
  taxAmount: number; // 2decimal place
  createdOn: number;
  endDate: number;
  isUpfront: string;
  // isSuspended: string;
  // isActive: string;
  orgId: number;
  refNumber: string;
  periodCount: number;
}
