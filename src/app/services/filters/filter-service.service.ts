import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private _host: string;
  private _baseUrl: string;
  private _filterUrl: string;
  private _testPort = 3200;
  testUrl: string;

  //
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this._host = `${this.endpoints.fourFourSixEndpoint}`;
    this._baseUrl = `${this._host}/${this.endpoints.filters.baseUrl}`;
    this._filterUrl = `${this._host}/${this.endpoints.filters.filterUrl}`;
    this.testUrl = `${this.endpoints.clientsAndSalesServiceLocalUrl}/filters`;
  }

  private paginateurl(url, page = 0, population = 20) {
    return `${url}?page=${page}&population=${population}`;
  }

  fetchFilters() {
    try {
      return this.http.get(this._baseUrl)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  fetchFilter(id) {
    try {
      return this.http.get(`${this._baseUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  filterFilter(query) {
    try {
      return this.http.get(`${this._baseUrl}/filter?${query}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  createFilter(payload) {
    try {
      return this.http
        .post(this._baseUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  updateFilter(payload) {
    try {
      this.genServ.httpStatus.next('formDataType');
      return this.http
        .put(this._baseUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  deleteFilter(id) {
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
    console.log(message, " Filter Error Message");
    return of(null);
  }
}
