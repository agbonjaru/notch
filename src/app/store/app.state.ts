import { InvoiceProductStoreModel } from './storeModels/invoiceProductStore.model';
import { SubscriptionStoreModel } from './storeModels/subscriptionStore.model';
import { AllUserInfoModel } from './storeModels/user.model';

export interface AppState {
  readonly invoice: InvoiceProductStoreModel[];
  readonly subscription: SubscriptionStoreModel[];
  readonly selectedInvoice: InvoiceProductStoreModel;
  readonly userInfo: AllUserInfoModel;
}
