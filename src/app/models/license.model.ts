export class License {
  id?: number;
  name: string;
  descrip: string;
  maxUsers: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  annuallyPrice: number;
  maxStorage: number;
  createdDate?: number;
  active?: boolean;
  message?: string;
  activePlan?: string;
  activePrice?: number;
  toggled?: boolean;
  trialLoading?: boolean;
  liveLoading?: boolean;
}

export interface billingPayload {
  key?: string;
  email?: string;
  amount?: number;
  currency?: string;
  ref?: string;
  metadata?: object;
  license?: License;
  monthly?: boolean;
  authorization_code?: string;
}

export interface billingResponse {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string;
  receiver_bank_account_number: string;
  receiver_bank: string;
  userID: number;
  id: number;
}

export class Billing {
  amount: number;
  createdDate: string;
  currency: string;
  descrip: string;
  dueDate: string;
  startDate: string;
  id: number;
  license: string;
  licenseID: string;
  paymentMethod: string;
  quantity: number;
  status: string;
  tax: string;
  taxAmount: number;
  tenantEmail: string;
  tenantID: string;
  tenantName: string;
  totalAmount: number;
  unitPrice: number;
  type: string;
  paymentData: string;
  billingTenure: string;
  autoRenew: boolean;
  dailyAmount: number;
  prepaidBalance: number;
  prepaidDaysBalance: number;
  billingTenureInDays: number;
  exprDate: string;
  extendedDuration: number;

  constructor(
    amount?: number,
    currency?: string,
    descrip?: string,
    dueDate?: string,
    license?: string,
    licenseID?: string,
    paymentMethod?: string,
    // quantity?: number,
    status?: string,
    tax?: string,
    taxAmount?: number,
    tenantEmail?: string,
    tenantID?: string,
    tenantName?: string,
    totalAmount?: number,
    // unitPrice?: number,
    type?: string,
    paymentData?: string,
    billingTenure?: string,
    startDate?: string,
    autoRenew?: boolean,
    extendedDuration?: number
  ) {
    this.amount = amount ? amount : 0;
    this.currency = currency ? currency : "NGN";
    this.descrip = descrip ? descrip : "";
    // this.dueDate = dueDate ? dueDate : "2020-06-20T14:46:15.436Z";
    this.license = license ? license : "";
    this.licenseID = licenseID ? licenseID : "";
    this.paymentMethod = paymentMethod ? paymentMethod : "";
    // this.quantity = quantity ? quantity : 0;
    this.status = status ? status : "Auto";
    this.tax = tax ? tax : "No Tax";
    this.taxAmount = taxAmount ? taxAmount : 0;
    this.tenantEmail = tenantEmail ? tenantEmail : "";
    this.tenantID = tenantID ? tenantID : "";
    this.tenantName = tenantName ? tenantName : "";
    this.totalAmount = totalAmount ? totalAmount : 0;
    // this.unitPrice = unitPrice ? unitPrice : 0;
    this.type = type ? type : "trial";
    this.paymentData = paymentData ? paymentData : "";
    this.billingTenure = billingTenure ? billingTenure : "month";
    this.startDate = startDate ? startDate : "2020-05-20T14:46:15.436Z";
    this.autoRenew = autoRenew ? autoRenew : true;
    this.extendedDuration = extendedDuration ? extendedDuration : 0;
  }
}

export class BillingCard {
  authorizationCode?: string;
  bin?: string;
  lastFour?: string;
  expMonth?: string;
  expYear?: string;
  channel?: string;
  type?: string;
  bank?: string;
  countryCode?: string;
  brand?: string;
  reusable?: boolean;
  signature?: string;
  accountName?: string;
  receiverBankAccountNumber?: string;
  receiverBank?: string;
  userID?: number;
  orgID?: number;
  id?: number;
}

export class PaystackTransactionInitiliazationResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class PaystackCard {
  device: string;
  card: {
    charge: any;
    validateToken: any;
    validatePhone: any;
    verify3DS: any;
  };
}

export interface PaystackRefund {
  transaction: string;
  amount?: number;
  currency: string;
  customer_note?: string;
  merchant_note?: string;
}
