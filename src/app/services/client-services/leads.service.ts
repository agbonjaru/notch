import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { BehaviorSubject } from 'rxjs';
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
import DateUtils from 'src/app/utils/date';

// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LeadService { 
  //
  private _host: string;
  private _baseUrl: string;
  private _filterUrl: string;
  private _testUrl: string;
  private _testPort: 3200;
  private dateHandler = new DateUtils;
  private teamId;
  canBeConvertedToClient: boolean = false;
  hasBeenConvertedToClient: boolean = false;

  /** BEHAVIOR SUBJECT */
  lead_info_from_server: any = new BehaviorSubject<any>({});
  local_lead_info: any = new BehaviorSubject<any>({});
  new_lead: any = new BehaviorSubject<any>({});
  salespersons: any = new BehaviorSubject<any>([]);
  teams: any = new BehaviorSubject<any>([]);
  selected_lead_to_assign: any = new BehaviorSubject<any>({});

  //
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this.teamId = this.genServ.user.teamID;
    this._host = `${this.endpoints.fourFourSixEndpoint}`;
    this._baseUrl = `${this._host}/leads`;
    this._filterUrl = `${this._baseUrl}/filter`;
    this._testUrl = `${this.endpoints.clientsAndSalesServiceLocalUrl}/leads`;
  }

  private paginateurl(url, page = 0, population = 20) {
    return `${url}?page=${page}&population=${population}`;
  }

  fetchLeads() {
    try {
      return this.http.get(this._baseUrl)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  fetchLead(id) {
    try {
      return this.http.get(`${this._baseUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  filterLead(query) {
    try {
      return this.http.get(`${this._filterUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  createLead(payload) {
    try {
      return this.http
        .post(this._baseUrl, { ...payload, teamId: this.teamId })
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  captureLead(payload) {
    try {
      return this.http
        .post(this._baseUrl + '/new', {
          ...payload,
          teamId: this.teamId,
        }).pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  createContact(payload) {
    try {
      const processedInfo = this.processLeadInfo({ ...payload });
      delete processedInfo.id;
      return this.http
        .post(`${this._host}/contacts`, processedInfo)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  createCompany(payload) {
    try {

      const processedInfo = this.processLeadInfo({ ...payload });
      delete processedInfo.id;

      return this.http
        .post(`${this._host}/companies`, processedInfo)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  updateLead(payload) {
    try {
      const processedInfo = this.processLeadInfo({ ...payload });
      this.genServ.httpStatus.next('formDataType');
      return this.http
        .put(this._baseUrl, processedInfo)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  deleteLead(id) {
    try {
      this.genServ.httpStatus.next('formDataType');
      return this.http
        .delete(`${this._baseUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }


  /** */
  getLeadInfo() {
    return this.local_lead_info.value;
  }

  processLeadInfo(payload) {
    return {
      ...payload,
      id: payload.id || this.lead_info_from_server.value.id,
      dateOfBirth: payload['dateOfBirth'] && payload['dateOfBirth'].length > 0 ? this.dateHandler.convertDateToTimestamp(payload['dateOfBirth']) : null,
      regDate: payload['regDate'] && payload['regDate'].length > 0 ? this.dateHandler.convertDateToTimestamp(payload['regDate']) : null,
      staffStrength: payload['staffStrength'] && payload['staffStrength'].length > 0 ? payload['staffStrength'] : null,
      yearOfEstablishment: payload['yearOfEstablishment'] && payload['yearOfEstablishment'].length > 0 ? payload['yearOfEstablishment'] : null,
      yearOfIncorporation: payload['yearOfIncorporation'] && payload['yearOfIncorporation'].length > 0 ? payload['yearOfIncorporation'] : null
    }
  }
  checkIfLeadHasBeenConvertedToClient() {
    return this.local_lead_info.value.clientId;
  }

  markLeadAsConvertible(isDone): void {
    this.canBeConvertedToClient = isDone;
  }

  canLeadBeConvertedToDeal(): boolean {
    return (this.local_lead_info.clientType && this.local_lead_info.clientType.length > 1);
  }

  /**
   * 
   */
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
