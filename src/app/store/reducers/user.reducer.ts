import { AllUserInfoModel } from './../storeModels/user.model';
import { Action } from '@ngrx/store';
import * as UserAction from '../actions/user.action';

const userEmptyData = {
    user: {},
    organization: {},
    token: null,
    priviledges: [],
    roleName: ''
}
const userDetail = localStorage['currentUser'] ? JSON.parse(localStorage['currentUser']) : null;
const initialState: AllUserInfoModel = userDetail || userEmptyData

export function userReducer(state: AllUserInfoModel = initialState, action: UserAction.Actions) {
    switch (action.type) {
        case UserAction.UPDATE_ALL_INFO:
            return {...state,...action.payload};
        case UserAction.UPDATE_USER:
            return {
                ...state,
                user: {...state.user, ...action.payload}
            };
        case UserAction.UPDATE_ORG:
            return {
                ...state,
                organization: {...state.organization, ...action.payload}
            }
        case UserAction.REMOVE_ALL_INFO:
            return {...userEmptyData}
        default:
            return state;
    }
}
