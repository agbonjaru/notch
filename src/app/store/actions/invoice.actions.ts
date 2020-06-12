import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { InvoiceProductStoreModel } from '../storeModels/invoiceProductStore.model';

export const CREATE_INVOICE = 'Invoice_Create';
export const SELECT_INVOICE = 'Invoice_Select';
export const UPDATE_INVOICE = 'Invoice_Update';
export const DELETE_INVOICE = 'Invoice_Delete';

export class CreateInvoice implements Action {
  readonly type = CREATE_INVOICE;

  constructor(public payload: InvoiceProductStoreModel) {}
}

export class SelectInvoice implements Action {
  readonly type = SELECT_INVOICE;

  constructor(public payload: InvoiceProductStoreModel) {}
}

export class UpdateInvoice implements Action {
  readonly type = UPDATE_INVOICE;

  constructor(public id: number, public payload: InvoiceProductStoreModel) {}
}

export class DeleteInvoice implements Action {
  readonly type = DELETE_INVOICE;

  constructor(public id: number) {}
}

export type Actions =
  | CreateInvoice
  | SelectInvoice
  | UpdateInvoice
  | DeleteInvoice;
