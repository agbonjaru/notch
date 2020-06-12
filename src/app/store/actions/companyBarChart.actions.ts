import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export const CREATE_CHART = 'Chart_Create';
export const SELECT_CHART = 'Chart_Select';
export const UPDATE_CHART = 'Chart_Update';
export const DELETE_CHART = 'Chart_Delete';

export class CreateChart implements Action {
  readonly type = CREATE_CHART;

  constructor(public payload) {}
}

export class SelectChart implements Action {
  readonly type = SELECT_CHART;

  constructor(public payload) {}
}

export class UpdateChart implements Action {
  readonly type = UPDATE_CHART;

  constructor(public id: number, public payload) {}
}

export class DeleteChart implements Action {
  readonly type = DELETE_CHART;

  constructor(public id: number) {}
}

export type Actions = CreateChart | SelectChart | UpdateChart | DeleteChart;
