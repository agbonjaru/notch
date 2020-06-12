import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})

export class LeadsCustomersService {
  private server_uri = this.config.fourFourSixEndpoint;
  private lead_source_uri = `${this.server_uri}/lead-sources`;
  private org_lead_source_uri = `${this.server_uri}/organisation-lead-sources`;

  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private general_service: GeneralService
  ) { }

  // Leads Customers Api Config
  private get LeadsCustomersAPI() {
    const url = this.config.settingsUrl + this.config.leadsCustomers.baseurl;
    return url;
  }

  // PULL => GET : GET LeadsCustomers
  getLeadsCustomers(sourceName: any): Observable<any> {
    return this.http
      .get<any>(this.LeadsCustomersAPI + '/' + this.general_service.orgID + `/${sourceName}` + this.config.leadsCustomers.get)
      .pipe(catchError(this.general_service.handleError));
  }

  /** LEAD SOURCES */

  // FETCH all supported lead sources
  fetch_lead_sources() {
    return this.http.get(this.lead_source_uri);
  }

  fetch_organisation_lead_sources() {
    return this.http.get(this.org_lead_source_uri);
  }

  // CREATE Lead Source for this organisation.
  create_organisation_lead_source({ name }) {
    return this.http.post(this.org_lead_source_uri, { name });
  }

  // REMOVE Lead Source from this organisation.
  delete_organisation_lead_source(id) {
    return this.http.delete(`${this.org_lead_source_uri}/${id}`);
  }


  /**
   * 
   */
  createCustomers(payload) {
    return this.http
      .post<any>(this.LeadsCustomersAPI + this.config.leadsCustomers.new, payload)
  }

  // UPDATE => PUT: update the LeadsCustomers on the server
  updateLeadsCustomers(source): Observable<any> {
    return this.http.post(this.LeadsCustomersAPI + this.config.leadsCustomers.edit, source)
      .pipe(catchError(this.general_service.handleError));
  }

  // DELETE => delete the LeadsCustomers from the server
  deleteLeadsCustomers(sourceId: number): Observable<any> {
    const url = this.LeadsCustomersAPI + `/${sourceId}` + this.config.leadsCustomers.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.general_service.handleError));
  }


}
