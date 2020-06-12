import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { UserModel, AllUserInfoModel, OrgModel } from '../storeModels/user.model';


export const UPDATE_ALL_INFO = '[ALL] Update';
export const UPDATE_USER = '[USER] Update';
export const UPDATE_ORG = '[ORG] Update';

export const REMOVE_ALL_INFO = '[ALL] Remove';

export class UpdateUser implements Action {
    readonly type = UPDATE_USER;
    constructor(public payload: UserModel) {}
}
export class UpdateOrg implements Action {
    readonly type = UPDATE_ORG;
    constructor(public payload: OrgModel) {}
}
export class UpdateAllInfo implements Action {
    readonly type = UPDATE_ALL_INFO;
    constructor(public payload: AllUserInfoModel) {}
}
export class RemoveAllInfo implements Action {
    readonly type = REMOVE_ALL_INFO;
}


export type Actions = 
    UpdateUser 
  | UpdateAllInfo
  | RemoveAllInfo
  | UpdateOrg
