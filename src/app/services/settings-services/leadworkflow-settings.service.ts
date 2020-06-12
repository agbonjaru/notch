import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';

@Injectable({
  providedIn: 'root'
})
export class LeadworkflowSettingsService {
  private api = this.endpoint.fourFourSixEndpoint + '/organisations-lead-workflow'
  constructor(
    private http: HttpClient,
    private endpoint: Endpoints) { }

  addWorkflow(payload) {
    const body = {
      category: payload.category,
      name: payload.name,
      convertsToClient: payload.convertsToClient + '',
      convertsToDeal: payload.convertsToDeal+ ''
    }
    return this.http.post(this.api , body)
  }
  updateWorkflow(payload) {
    const body = {
      ...payload,
      convertsToClient: payload.convertsToClient + '',
      convertsToDeal: payload.convertsToDeal+ ''
    }
    return this.http.put(this.api , body)
  }
  deleteWorkflow(id) { 
    return this.http.delete(this.api + `/${id}`)
  }
  fetchWorkflow() {
    return this.http.get(this.api); 
  }
}
 