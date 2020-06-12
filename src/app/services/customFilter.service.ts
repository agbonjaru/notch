import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CustomFilterService {
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {}

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " Custom Filter Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createGetUpdateDeleteCustomerFilterUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.customFilter.createGetUpdateDeleteCustomFilter
    );
  }

  // Custom Filter Creation

  createCustomFilter(payload) {
    try {
      return this.http
        .post(this.createGetUpdateDeleteCustomerFilterUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getCustomFilter(userid, service) {
    try {
      return this.http
        .get(
          `${this.createGetUpdateDeleteCustomerFilterUrl}/filter?userId=${userid}&service=${service}`
        )
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateCustomFilter(payload) {
    try {
      return this.http
        .put(`${this.createGetUpdateDeleteCustomerFilterUrl}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteCustomFilter(id) {
    try {
      return this.http
        .delete(`${this.createGetUpdateDeleteCustomerFilterUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
