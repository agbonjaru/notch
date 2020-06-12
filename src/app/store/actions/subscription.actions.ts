import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { SubscriptionStoreModel } from '../storeModels/subscriptionStore.model';

export const CREATE_SUBSCRIPTION = 'Subscription_Create';
export const SELECT_SUBSCRIPTION = 'Subscription_Select';
export const UPDATE_SUBSCRIPTION = 'Subscription_Update';
export const DELETE_SUBSCRIPTION = 'Subscription_Delete';

export class CreateSubscription implements Action {
  readonly type = CREATE_SUBSCRIPTION;

  constructor(public payload: SubscriptionStoreModel) {}
}

export class SelectSubscription implements Action {
  readonly type = SELECT_SUBSCRIPTION;

  constructor(public payload: SubscriptionStoreModel) {}
}

export class UpdateSubscription implements Action {
  readonly type = UPDATE_SUBSCRIPTION;

  constructor(public id: number, public payload: SubscriptionStoreModel) {}
}

export class DeleteSubscription implements Action {
  readonly type = DELETE_SUBSCRIPTION;

  constructor(public id: number) {}
}

export type Actions =
  | CreateSubscription
  | SelectSubscription
  | UpdateSubscription
  | DeleteSubscription;
