import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
}) 
export class LeadWorkflowService {
  //
  private _host : string;
  private _baseUrl : string;
  private _filterUrl : string;
  private _testPort = 3200;


  private isStarted: boolean = false;
  private workflows: any = {};
 
  testUrl: string;
  //
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this._host = `${this.endpoints.fourFourSixEndpoint}`;
    this._baseUrl = `${this._host}/lead-workflow`;
    this._filterUrl = `${this._baseUrl}/filter`;
    this.testUrl = `${this.endpoints.clientsAndSalesServiceLocalUrl}/lead-workflow`;
  }

  private paginateurl(url, page = 0, population = 20) {
    return `${url}?page=${page}&population=${population}`;
  }


  /** */

  setWorkflows(workflows : object): void {
    this.workflows = {...workflows};
  }

  setWorkflowStat(id, stat): void {
    this.workflows[id].stat = stat;
  }

  setIsStarted(): void{
    this.isStarted = true;
  }
  
  getIsStarted(): boolean {
    return this.isStarted;
  }

  getWorkflowItem(id) : any {
    return this.workflows[id].body;
  }

  getNextItemForGivenWorkflow(id) : any {
    return this.workflows[id].next;
  }

  getPreviousItemForGivenWorkflow (id) : any {
    return this.workflows[id].prev;
  }

  updateWorkflow(id, data): void {
    this.workflows[id].body = {...data};
  }


  checkIfItemIsDone(type, id): boolean {
    if (type && id === undefined) {
      return false;
    }

    if (!type && id === null) {
      return true;
    }
    return this.workflows[id].stat;
  }

  /** REQUESTS */
  fetchLeadWorkflows(id) {
    try {
      return this.http.get(`${this._filterUrl}?leadId=${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  updateLeadWorkflow(payload) {
    try {
      this.genServ.httpStatus.next('formDataType');
      return this.http.put(this._baseUrl, payload)
      .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }



  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    console.log(error, "er");
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " Lead Error Message");
    return of(null);
  }
}
