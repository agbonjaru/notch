import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InvoiceService {
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
    console.log(message, " Invoice Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createInvoiceUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.createGetOneUpdateDeleteInvoice
    );
  }
  private get createPaymentUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.payment.createGetOneUpdateDeletePayment
    );
  }
  private get getAllInvoiceUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.getAllByPaginationInvoice
    );
  }
  private get getOneInvoiceUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.createGetOneUpdateDeleteInvoice
    );
  }
  private get getInvoiceByFilterUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.filterInvoice
    );
  }
  private get updateInvoiceUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.createGetOneUpdateDeleteInvoice
    );
  }
  private get deleteInvoiceUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.invoice.createGetOneUpdateDeleteInvoice
    );
  }

  // Subcription Creation

  createInvoice(payload) {
    try {
      return this.http.post(this.createInvoiceUrl, {
        ...payload,
        clientMail: "test@atbtechsoft.com",
      });
    } catch (error) {
      alert(error);
    }
  }

  createPayment(payload) {
    try {
      return this.http.post(this.createPaymentUrl, payload);
    } catch (error) {
      alert(error);
    }
  }

  getPayment() {
    try {
      return this.http.get(this.createPaymentUrl);
    } catch (error) {
      alert(error);
    }
  }

  getAllInvoice() {
    try {
      return this.http.get(this.getAllInvoiceUrl);
    } catch (error) {
      alert(error);
    }
  }

  getInvoiceByFilter(query) {
    try {
      // console.log(`${this.getInvoiceByFilterUrl}?${query}`, 'url');
      return this.http.get(`${this.getInvoiceByFilterUrl}?${query}`);
    } catch (error) {
      alert(error);
    }
  }

  getOneInvoice(id) {
    try {
      return this.http.get(`${this.getOneInvoiceUrl}/${id}`);
    } catch (error) {
      alert(error);
    }
  }

  updateInvoice(payload) {
    console.log(this.updateInvoiceUrl, "UZRL");
    try {
      return this.http.put(this.updateInvoiceUrl, payload);
    } catch (error) {
      alert(error);
    }
  }

  deleteInvoice(id) {
    try {
      return this.http.delete(`${this.deleteInvoiceUrl}/${id}`);
    } catch (error) {
      alert(error);
    }
  }

  // Client Template
  orgTemplateSetup() {
    const body = {
      invoiceTemplateId: 1,
      quotationTemplateId: 1,
    };
    const url = `${this.endpoints.fourFourSixEndpoint}/templates`;
    return this.http.post(url, body);
  }
  createTemplate(payload) {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/templates`;
      return this.http.post(url, payload);
    } catch (error) {
      alert(error);
    }
  }

  getAllTemplates() {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/templates`;
      return this.http.get(`${url}`);
    } catch (error) {
      alert(error);
    }
  }

  getClientTemplate(id) {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/templates/${id}`;
      return this.http.get(`${url}`);
    } catch (error) {
      alert(error);
    }
  }

  updateTemplate(payload) {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/templates`;
      return this.http.put(url, payload);
    } catch (error) {
      alert(error);
    }
  }

  uploadProducts(payload) {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/invoices/import`;
      return this.http.post(url, payload).pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
