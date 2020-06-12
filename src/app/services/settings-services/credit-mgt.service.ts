import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { GeneralService } from "../general.service";

@Injectable({
  providedIn: "root"
})
export class CreditMgtService {
  api = this.endpoint.salesUrl;
  orgId;
  constructor(
    private http: HttpClient,
    private endpoint: Endpoints,
    private gs: GeneralService
  ) {
    this.orgId = this.gs.orgID;
  }

  createProfile(type, payload) {
    const body = { ...payload, orgID: this.orgId };
    return this.http.post(this.api + `/${type}CreditProfile`, body);
  }
  deleteProfile(id) {
    return this.http.delete(`${this.api}/${id}/deleteCreditProfile`);
  }
  fetchProfile() {
    return this.http.get(this.api + `/${this.orgId}/getCreditProfiles`);
  }
  fetchProfileClients(id) {
    return this.http.get(`${this.api}/${id}/getCreditProfileClients`);
  }
  fetchCreditProfileForClient(orgId, clientId) {
    return this.http.get(
      `${this.api}/${orgId}/${clientId}/getClientCreditProfile`
    );
  }
  deleteProfileClient(id) {
    return this.http.delete(this.api + `/${id}/deleteCreditProfileClient`);
  }
  attactClientToProfile(payload) {
    const body = { ...payload, orgID: this.orgId };
    return this.http.post(this.api + "/attachClientToProfile", body);
  }
}
