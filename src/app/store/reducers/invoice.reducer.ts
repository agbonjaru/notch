import {
  Actions,
  CREATE_INVOICE,
  SELECT_INVOICE,
  UPDATE_INVOICE,
  DELETE_INVOICE,
} from '../actions/invoice.actions';
import { InvoiceProductStoreModel } from '../storeModels/invoiceProductStore.model';

const initialState: InvoiceProductStoreModel[] = [];

const initialStateSelectedInvoice: InvoiceProductStoreModel = {
  name: '',
  costPrice: 0,
  sellingPrice: 0,
  markup: 0,
  markupType: '',
  quantity: 0,
  taxSelection: '',
  taxAmount: 0,
  subTotal: 0,
  description: '',
};

export function invoiceReducer(
  state: InvoiceProductStoreModel[] = initialState,
  action: Actions
) {
  switch (action.type) {
    case CREATE_INVOICE:
      return [action.payload];

    case UPDATE_INVOICE:
      const b = state;
      // b.forEach((part, index) =>
      //   part.id === action.id ? (state[index] = action.payload) : state[index]
      // );

      return b;

    case DELETE_INVOICE:
      return state.filter(({ name }) => name !== 'action.id');

    default:
      return state;
  }
}

export function invoiceSelectedReducer(
  state: InvoiceProductStoreModel = initialStateSelectedInvoice,
  action: Actions
) {
  switch (action.type) {
    case SELECT_INVOICE:
      return action.payload;

    default:
      return state;
  }
}
