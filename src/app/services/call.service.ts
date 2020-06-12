import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CallService {
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
    console.log(message, " Call Service Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get getPhoneNumberMerger() {
    return (
      this.endpoints.organizationEndpoint + this.endpoints.phoneCall.getNumber
    );
  }

  private get addPhoneNumberMerger() {
    return (
      this.endpoints.organizationEndpoint + this.endpoints.phoneCall.addNumber
    );
  }

  private get updatePhoneNumberMerger() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.phoneCall.updateNumber
    );
  }

  private get deletePhoneNumberMerger() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.phoneCall.deleteNumber
    );
  }

  private get makeCallPhoneNumberMerger() {
    return (
      this.endpoints.organizationEndpoint + this.endpoints.phoneCall.makeACall
    );
  }

  // Phone Number Creation

  getPhoneNumber(clientId) {
    try {
      return this.http
        .get(`${this.getPhoneNumberMerger}${clientId}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  addPhoneNumber(payload) {
    try {
      return this.http
        .post(this.addPhoneNumberMerger, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updatePhoneNumber(id, payload) {
    try {
      return this.http
        .put(`${this.updatePhoneNumberMerger}${id}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deletePhoneNumber(id) {
    try {
      return this.http
        .delete(`${this.deletePhoneNumberMerger}${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  makeACallPhoneNumber(payload) {
    try {
      return this.http
        .post(`${this.makeCallPhoneNumberMerger}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
