import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class TicketBulkService {
  orgID;
  ticketApi = this.config.ticketUrl;
  constructor(private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService) {
      this.orgID = this.gs.orgID;
     }

  // Ticket Bulk Api Config
  private get TicketBulkAPI() {
    const url = this.config.settingsUrl + this.config.ticketBulk.baseurl;
    return url;
  }

  // CREATE =>  POST: add a new Auth to the server
  createTicketBulk(payload): Observable<any> {
    return this.http
      .post<any>(this.TicketBulkAPI + this.config.ticketBulk.save, payload);
  }

  // Update =>  POST: add a new Auth to the server
  getIntegrationsByCompany(): Observable<any> {
    return this.http
      .get<any>(this.TicketBulkAPI + '/' + this.gs.orgID + this.config.ticketBulk.byCompany);
  }
  
  saveInboundComms(payload){
    const body = {...payload, orgID : this.orgID};
    return this.http.post(this.ticketApi + '/saveInboundComms', body);
  }

  getInboundComms() {
    return this.http.get(this.ticketApi + `/1/${this.orgID}/getTicketInboundComms`)
  }

}
