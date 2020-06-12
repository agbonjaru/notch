import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Endpoints } from "src/app/shared/config/endpoints";

import { GeneralService } from "../general.service";

@Injectable({
  providedIn: "root",
})
export class TopUpService {
  // Top - Up Api Config
  private get topUpAPI() {
    const url = this.config.topUp + this.config.topUp.baseUrl;
    return url;
  }

  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {}

  // PAYMENT =>  POST: add a new SMS TOP UP to the server
  topUp(payload): Observable<any> {
    console.log(this.config.settingsUrl, this.config.topUp.buyUnits);
    return this.http
      .post<any>(
        this.config.settingsUrl +
          "/settingsservice" +
          this.config.topUp.buyUnits,
        payload
      )
      .pipe(catchError(this.gs.handleError));
  }

  // PULL PAYMENT => GET : GET SMS TOP UP
  getTopUpDetails(reference: any): Observable<any> {
    return this.http
      .get<any>(
        this.topUpAPI +
          this.config.topUp.verify +
          `/${reference}` +
          "/" +
          this.gs.orgID
      )
      .pipe(catchError(this.gs.handleError));
  }

  // ACTIVATE PAYMENT =>  POST: add a new SMS TOP UP to the server
  activateTopUp(active): Observable<any> {
    console.log(this.topUpAPI + this.config.topUp.activate);
    return this.http
      .post<any>(
        this.topUpAPI +
          this.config.topUp.activate +
          this.gs.orgID +
          "/" +
          this.gs.organisationName,
        active
      )
      .pipe(catchError(this.gs.handleError));
  }
}
