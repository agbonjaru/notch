import { Injectable } from "@angular/core";
import { Endpoints } from "../shared/config/endpoints";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { retry, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PasswordSettingService {
  url: string;

  constructor(private endpoints: Endpoints, private http: HttpClient) {}

  private get(url: string) {
    return this.http.get(`${url}`);
  }

  private post(url: string, payLoad: any) {
    return this.http.post(`${url}`, payLoad);
  }

  private put(url: string, payLoad: any) {
    return this.http.put(`${url}`, payLoad);
  }

  private delete(url: string) {
    return this.http.delete(`${url}`);
  }

  // Handle API errors
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError("Something bad happened; please try again later.");
  }

  forgotPassword(email: string) {
    this.url = `${this.endpoints.signUpEndpoint}/${email}/passwordReset/`;
    return this.get(this.url);
  }

  resetPassword(payload: any) {
    this.url = `${this.endpoints.signUpEndpoint}/completeReset/`;
    // return this.post(this.url, payload);
    return this.post(this.url, payload);
  }
}
