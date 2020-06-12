import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { GeneralService } from "../general.service";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankPaymentsService {
  org_id: any;
  user_id: any;

  server_uri: string;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private general_service: GeneralService
  ) {
    this.org_id = this.general_service.org.id;
    this.user_id = this.general_service.user.id;
    this.server_uri = `${this.endpoints.fourFourSixEndpoint}/payments`;
  }

  /** */

  fetch_organisation_payments(): Observable<any> {
    return this.http.get(this.server_uri);
  }

  filter_organisation_payments(query_string): Observable<any> {
    return this.http.get(`${this.server_uri}/filter?${query_string}`);
  }
}
