import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
import { SubscriptionModel } from "../models/subscription.model";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SubscriptionService {
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) { }

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
    console.log(message, " Subscription Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.createGetOneUpdateDeleteSubscriptions
    );
  }
  private get getAllSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.createGetOneUpdateDeleteSubscriptions
    );
  }
  private get getOneSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.createGetOneUpdateDeleteSubscriptions
    );
  }
  private get updateSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.createGetOneUpdateDeleteSubscriptions
    );
  }

  private get filterSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.subscriptionFilter
    );
  }
  private get deleteSubscriptionUrl() {
    return (
      this.endpoints.subscriptionQuotationInvoiceEndpoint +
      this.endpoints.subscriptions.createGetOneUpdateDeleteSubscriptions
    );
  }

  // Subscription Creation

  registerSubscription(payload: SubscriptionModel) {
    try {
      return this.http
        .post(this.createSubscriptionUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getAllSubscription() {
    try {
      return this.http
        .get(this.getAllSubscriptionUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneSubscription(id) {
    try {
      return this.http
        .get(`${this.getOneSubscriptionUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getSubscriptionByFilter(query) {
    try {
      return this.http
        .get(`${this.filterSubscriptionUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateSubscription(payload) {
    try {
      return this.http
        .put(this.updateSubscriptionUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteSubscription(id) {
    try {
      return this.http
        .delete(`${this.deleteSubscriptionUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
