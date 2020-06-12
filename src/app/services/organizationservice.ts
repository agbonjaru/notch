import { OrgModel } from "src/app/store/storeModels/user.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";

// import { OrganizationModel } from '../models/Organization.model';
@Injectable({
  providedIn: "root"
})
export class OrganizationService {
  private url = this.endpoints.signUpEndpoint;
  private salesClientApi = this.endpoints.leadsCompaniesContactClientsEndpoint;
  private org: OrgModel;
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this.org = this.genServ.org;
  }

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
    console.log(message, " Organization Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createOrganizationUrl() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.organization.createOrg
    );
  }
  private get getAllOrganizationUrl() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.organization.getAllOrg
    );
  }

  private get getOrganizationUsersUrl() {
    return (
      this.endpoints.organizationEndpoint +
      "/" +
      this.genServ.orgID +
      this.endpoints.organization.getUerByOrg
    );
  }

  // private get getOneOrganizationUrl() {
  //   return (
  //     this.endpoints.organizationEndpoint +
  //     this.endpoints.organization.getOneSubscription
  //   );
  // }
  // private get updateOrganizationUrl() {
  //   return (
  //     this.endpoints.organizationEndpoint +
  //     this.endpoints.organization.updateSubscription
  //   );
  // }
  private get deleteOrganizationUrl() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.organization.deleteOrg
    );
  }

  // Organization Creation
  // OrganizationModel
  registerOrganization(payload) {
    const body = {
      ...payload
    };
    return this.http.post(this.url + "/newOrganization", body);
  }

  addSalesStat() {
    return this.http.post(this.salesClientApi + "/sales-stats", {});
  }

  createDefaultClientTemplates() {
    const data = {
      invoiceTemplateId: 2,
      quotationTemplateId: 1
    }
    return this.http.post(`${this.salesClientApi}/templates`, data);
  }

  getAllOrganization() {
    try {
      return this.http
        .get(this.getAllOrganizationUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  // getOneOrganization(id) {
  //   try {
  //     return this.http
  //       .get(`${this.getOneOrganizationUrl}/${id}`)
  //       .pipe(catchError(this.handleError));
  //   } catch (error) {
  //     alert(error);
  //   }
  // }

  // updateOrganization(payload) {
  //   try {
  //     return this.http
  //       .put(this.updateOrganizationUrl, payload)
  //       .pipe(catchError(this.handleError));
  //   } catch (error) {
  //     alert(error);
  //   }
  // }

  deleteOrganization(id) {
    try {
      return this.http
        .delete(`${this.deleteOrganizationUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getUsersInOrganization() {
    return this.http.get(this.url + `/getUsersInOrganization/${this.org.id}`);
  }

  getPendingUsersInOrganization() {
    return this.http.get(
      this.url + `/getPendingUsersInOrganization/${this.org.id}`
    );
  }

  getUserById(id) {
    return this.http.get(this.url + `/getUser/${id}`);
  }

  getCurrency() {
    return this.http.get(this.url + `/getCurrencies`);
  }

  newOrgCurrency(payload) {
    try {
      return this.http
        .post(this.url + `/newOrgCurrency`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOrgCurrencies() {
    return this.http.get(
      this.url + `/${this.org.id}/getOrgCurrencies/`
    );
  }

  getOrgOtherCurrencies() {
    return this.http.get(
      this.url + `/${this.org.id}/getOrgOtherCurrencies`
    );
  }
}
