import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
import { Observable, of } from "rxjs";


@Injectable({
  providedIn: 'root'
})
  
export class LeadSourceService {

  private _host: string;
  private _baseUrl: string;
  private _filterUrl: string;
  private _filterLeadsUrl: string
  testUrl: string;

  //
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this._host = `${this.endpoints.fourFourSixEndpoint}`;
    this._baseUrl = `${this._host}/${this.endpoints.leadSources.baseUrl}`;
    this._filterUrl = `${this._host}/${this.endpoints.leadSources.filterUrl}`;
    this._filterLeadsUrl = `${this._host}/${this.endpoints.leadSources.filterLeadUrl}`;
    this.testUrl = `${this.endpoints.clientsAndSalesServiceLocalUrl}/organisation-lead-sources`;
  }

  private paginateurl(url, page = 0, population = 20) {
    return `${url}?page=${page}&population=${population}`;
  }

  fetchLeadSources() {
    try {
      return this.http.get(this._baseUrl)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  filterLeadSources(query) {    
    try {
      return this.http.get(`${this._filterUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  filterLead(query) {
    try {
      return this.http.get(`${this._filterLeadsUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  createLeadSource(payload) {
    try {
      return this.http
        .post(this._baseUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  updateLeadSource(payload) {
    try {
      this.genServ.httpStatus.next('formDataType');
      return this.http
        .put(this._baseUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  deleteLeadSource(id) {
    try {
      this.genServ.httpStatus.next('formDataType');
      return this.http
        .delete(`${this._baseUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
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
    console.log(message, " LeadSource Error Message");
    return of(null);
  }
}
