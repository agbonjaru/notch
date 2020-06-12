import { Injectable } from '@angular/core';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root'
})
export class TicketSettingsService {
  readonly api = this.endpoint.settingsApi
  private orgId
  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService) {
      this.orgId = this.gs.orgID
     }
  
  newTicketResTime(payload) { 
    const body = {
      ...payload,
      orgID: this.orgId
    }
    return this.http.post(this.api + '/newTicketResponseTime', body)
  }
  editTicketResTime(payload) { 
    const body = {
      ...payload,
      orgID: this.orgId
    }
    return this.http.post(this.api + '/editTicketResponseTime', body)
  }
  fetchAutomaticTime() {
    return this.http.get(this.api + `/${this.orgId}/getAutomaticTime`)
  }
  newResSla(payload) {
    const body = {
      ...payload,
      orgID: this.orgId,
      clientName: payload.clientName.name,
      clientID: payload.clientName.id
    }
    return this.http.post(this.api + '/newResolutionSLA', body)
  }
  fetchSLAs() {
    return this.http.get(this.api + `/${this.orgId}/getSLAs`);
  }
  deleteSLA(id) {
    return this.http.delete(this.api + `/${id}/deleteResolutionSLA` )
  }
}
