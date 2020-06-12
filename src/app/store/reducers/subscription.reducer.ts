import {
  Actions,
  CREATE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
} from '../actions/subscription.actions';
import { SubscriptionStoreModel } from '../storeModels/subscriptionStore.model';

const initialState: SubscriptionStoreModel[] = [];

export function subscriptionReducer(
  state: SubscriptionStoreModel[] = initialState,
  action: Actions
) {
  switch (action.type) {
    case CREATE_SUBSCRIPTION:
      return [action.payload];

    case UPDATE_SUBSCRIPTION:
      const b = state;
      // b.forEach((part, index) =>
      //   part.id === action.id ? (state[index] = action.payload) : state[index]
      // );

      return b;

    case DELETE_SUBSCRIPTION:
      return state;

    default:
      return state;
  }
}
