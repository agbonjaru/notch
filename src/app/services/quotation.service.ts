import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
import { Observable, of } from "rxjs";
import { QuotationModel } from "../models/quotation.model";

@Injectable({
  providedIn: "root",
})
  
export class QuotationService {
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
    console.log(message, " Quotation Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.createQuotations
    );
  }
  
  private get getAllQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.getQuotations
    );
  }

  private get getOneQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.getOneQuotation
    );
  }

  private get updateQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.updateQuotation
    );
  }

  private get filterQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.filterQuotation
    );
  }

  private get deleteQuotationUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.quotations.deleteQuotation
    );
  }

  // Subcription Creation

  createQuotation(payload: QuotationModel) {
    try {
      return this.http
        .post(this.createQuotationUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getAllQuotation() {
    try {
      return this.http
        .get(this.getAllQuotationUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneQuotation(id) {
    try {
      return this.http
        .get(`${this.getOneQuotationUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateQuotation(payload) {
    try {
      return this.http
        .put(`${this.updateQuotationUrl}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getInvoiceByQuotation(filterParams) {
    try {
      return this.http
        .get(`${this.filterQuotationUrl}?${filterParams}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getQuotationByFilter(query) {
    try {
      return this.http
        .get(`${this.filterQuotationUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteQuotation(id) {
    try {
      return this.http
        .delete(`${this.deleteQuotationUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
