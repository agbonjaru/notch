import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endpoints } from 'src/app/shared/config/endpoints';

import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class SalesOrderWorkflowService {
  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {}

  // Sales Order Api Config
  private get salesOrderWorkflowAPI() {
    const url =
      this.config.settingsUrl + this.config.salesOrderWorkflow.baseurl;
    return url;
  }

  /**
   * Sales Stage
   */
  createSalesStages(salesStage): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI + this.config.salesOrderWorkflow.newStage,
        salesStage
      )
      
  }

  // edit =>  POST: add a new user to the server
  editSlaesStage(salesStage): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI + this.config.salesOrderWorkflow.editStage,
        salesStage
      )
      .pipe(catchError(this.gs.handleError));
  }

  // PULL => GET : GET Sales Stage By OrgId
  getStagesByOrgId(): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          '/' +
          this.gs.orgID +
          this.config.salesOrderWorkflow.getStagesById
      )
      .pipe(catchError(this.gs.handleError));
  }

  getSalesStagesById(stageId: any): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          `/${stageId}` +
          this.config.salesOrderWorkflow.getStages
      )
      .pipe(catchError(this.gs.handleError));
  }

  deleteSalesStage(stageId: any) {
    const url =
      this.salesOrderWorkflowAPI +
      `/${stageId}` +
      this.config.salesOrderWorkflow.deleteStagesById;
    return this.http.delete<any>(url)
  }

  /**
   * Sales WorkFlow
   */ 
 
  // Create =>  POST: add a new user to the server
  createSalesWorkflow(salesWorkflow): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI + this.config.salesOrderWorkflow.newWorkflow,
        salesWorkflow
      )
      
  }

  // edit =>  POST: add a new user to the server
  editSalesWorkflow(saleWorkFlow): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI +
          this.config.salesOrderWorkflow.editWorkflow,
        saleWorkFlow
      )
      
  }

  // PULL => GET : GET Sales WorkFlow By OrgId
  getWorkflowByOrgId(): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          '/' +
          this.gs.orgID +
          this.config.salesOrderWorkflow.getWorkflows
      )
      .pipe(catchError(this.gs.handleError));
  }

  getSalesWorkFlowsById(workflowId: any): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          `/${workflowId}` +
          this.config.salesOrderWorkflow.getWorkflowsById
      )
      .pipe(catchError(this.gs.handleError));
  }

  deleteSalesWorkFlow(workflowId: any) {
    const url =    
      this.salesOrderWorkflowAPI +
      `/${workflowId}` +
      this.config.salesOrderWorkflow.deleteWorkflowsById;        
    return this.http.delete<any>(url);
  }

  /**
   *
   * Sales Transitions
   */

  // Create =>  POST: add a new user to the server
  createSalesTransitions(salesTransitions): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI +
          this.config.salesOrderWorkflow.newTransition,
        salesTransitions
      )
      .pipe(catchError(this.gs.handleError));
  }

  // edit =>  POST: add a new user to the server
  editSalesTransition(salesTransitions): Observable<any> {
    return this.http
      .post<any>(
        this.salesOrderWorkflowAPI +
          this.config.salesOrderWorkflow.editTransition,
        salesTransitions
      )
      
  }

  // PULL => GET : GET Roles By Name
  getTransitionBysalesOrderId(salesOrderId: any): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          '/' +
          this.gs.orgID +
          `/${salesOrderId}` +
          this.config.salesOrderWorkflow.getTransitionsById
      )
      .pipe(catchError(this.gs.handleError));
  }

  getSalesTransition(transitionId: any): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          `/${transitionId}` +
          this.config.salesOrderWorkflow.getTransitions
      )
      .pipe(catchError(this.gs.handleError));
  }

  getCurrTransitionStages(
    salesOrderID: any,
    StartStageID: any
  ): Observable<any> {
    return this.http
      .get<any>(
        this.salesOrderWorkflowAPI +
          `/${salesOrderID}` +
          `/${StartStageID}` +
          this.config.salesOrderWorkflow.getCurrTransitionStages
      )
      
  }

  deleteSalesTransition(transitionId: any) {
    const url =
      this.salesOrderWorkflowAPI +
      `/${transitionId}` +
      this.config.salesOrderWorkflow.deleteTransitionsById;
    return this.http.delete<any>(url);
  }
}
