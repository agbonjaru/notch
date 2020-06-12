import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endpoints } from 'src/app/shared/config/endpoints';

import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class DealPipelineWorkflowService {
  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {}

  // Deal PipeLine  Api Config
  private get dealPipelineWorkflowAPI() {
    const url =
      this.config.settingsUrl + this.config.dealPipeLineWorkflow.baseurl;
    return url;
  }

  /**
   * Deal Pipeline
   */

  getDealsPipelineWorkflow(): Observable<any> {
    return this.http
      .get<any>(
        this.dealPipelineWorkflowAPI +
          '/' +
          this.gs.orgID +
          this.config.dealPipeLineWorkflow.getDealsPipelineWorkflows
      )
  }

  /**
   *
   * @param DealWorkFlow
   */
  // Create =>  POST: add a new user to the server
  createDealWorkflow(dealWorkFlow): Observable<any> {
    return this.http
      .post<any>(
        this.dealPipelineWorkflowAPI +
          this.config.dealPipeLineWorkflow.newDealsPipelineWorkflow,
        dealWorkFlow
      )
  }

  // edit =>  POST: add a new user to the server
  editDealWorkflow(dealWorkFlow): Observable<any> {
    return this.http
      .post<any>(
        this.dealPipelineWorkflowAPI +
          this.config.dealPipeLineWorkflow.editDealsPipelineWorkflow,
        dealWorkFlow
      )
  }

  getDealsPipelineWorkflowById(workflowId: any): Observable<any> {
    return this.http
      .get<any>(
        this.dealPipelineWorkflowAPI +
          `/${workflowId}` +
          this.config.dealPipeLineWorkflow.getDealsPipelineWorkflowById
      )
  }

  deleteDealsPipelineWorkflow(workflowId: any) {
    const url =
      this.dealPipelineWorkflowAPI +
      `/${workflowId}` +
      this.config.dealPipeLineWorkflow.deleteDealsPipelineWorkflowById;
    return this.http.delete<any>(url) 
  }
  updateDealWorkflowStatus(id) {
    return this.http.get(this.dealPipelineWorkflowAPI+`/${id}/changeDealsPipelineWorkflowStatus`);
  }

  /**
   *
   * @param DealStage
   */

  // Create =>  POST: add a new user to the server
  createDealStage(dealStage): Observable<any> {
    return this.http
      .post<any>(
        this.dealPipelineWorkflowAPI +
          this.config.dealPipeLineWorkflow.newDealsPipelineStage,
        dealStage
      )
  }

  // edit =>  POST: add a new user to the server
  editDealStage(dealStage): Observable<any> {
    return this.http
      .post<any>(
        this.dealPipelineWorkflowAPI +
          this.config.dealPipeLineWorkflow.editDealsPipelineStages,
        dealStage
      );
  }

  getDealsPipelineWStageById(stageId: any): Observable<any> {
    return this.http
      .get<any>(
        this.dealPipelineWorkflowAPI +
          `/${stageId}` +
          this.config.dealPipeLineWorkflow.getDealsPipelineStageById
      )
  }

  getDealsPipelineStageByDealId(dealsPipelineID: any): Observable<any> {
    return this.http
      .get<any>(
        this.dealPipelineWorkflowAPI +
          `/${dealsPipelineID}` +
          this.config.dealPipeLineWorkflow.getDealsPipelineStagesByDealId
      )
  }

  deleteDealsPipelineStage(stageId: any) {
    const url =
      this.dealPipelineWorkflowAPI +
      `/${stageId}` +
      this.config.dealPipeLineWorkflow.deleteDealsPipelineStageById;
    return this.http.delete<any>(url);
  }
  fetchDealReasons() {
    return this.http.get(this.dealPipelineWorkflowAPI+`/${this.gs.orgID}/getDealsLostComments`);
  }

  createDealReason(name) {
    const body = {
      orgID: this.gs.orgID,
      value: name
    }
    return this.http.post(this.dealPipelineWorkflowAPI+ '/newDealsLostComment', body);
  }
  deleteDealReason(id) {
    return this.http.delete(this.dealPipelineWorkflowAPI+`/${id}/deleteDealsLostComment`);
  }



}
