export class InvoiceModel {
  clientId: number;
  clientName: string;
  products: string;
  taxAmount: number;
  subtotalCost: number;
  createdBy: number;
  frequency: string;
  totalCost: number;
  createdOn: number;
  endDate: number;
  refNumber: string;
  periodCount: string;
  isUpfront: string;
  paymentDueDate: number;
  currency: string;
  isRecurring: string;
  salesOrderId: string;
  dealId: string;
  teamId: number;
  sendDaysAllowance: number;
  sendDayType: string;
  organisation: any;

  // paymentHistory: any;
}
