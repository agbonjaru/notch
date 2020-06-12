import { UserModel } from "./../../store/storeModels/user.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CompaniesService {
  private user: UserModel;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private gs: GeneralService
  ) {
    this.user = this.gs.user;
  }

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    console.log(error, "er");
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " Company Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get createCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.createGetOneUpdateDeleteCompanies
    );
  }

  private get getAllCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.createGetOneUpdateDeleteCompanies
    );
  }

  private get getSalespersonTeamsUrl() {
    return (
      this.endpoints.signUpEndpoint +
      this.endpoints.companies.getSalespersonTeams +
      "/" +
      this.gs.orgID +
      "/" +
      this.user.id
    );
  }

  private get getSupervisorTeamsUrl() {
    return (
      this.endpoints.signUpEndpoint +
      this.endpoints.companies.getSupervisorTeams +
      "/" +
      this.gs.orgID +
      "/" +
      this.user.email
    );
  }

  private get getCountTeamsSalesPersonUrl() {
    return (
      this.endpoints.signUpEndpoint +
      this.endpoints.companies.countTeamsSalesperson
    );
  }

  private get getOneCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.createGetOneUpdateDeleteCompanies
    );
  }
  private get getCompaniesByFilterUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.filterCompanies
    );
  }
  private get updateCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.createGetOneUpdateDeleteCompanies
    );
  }
  private get deleteCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.createGetOneUpdateDeleteCompanies
    );
  }

  private get getContactToCompanyUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.addContactToCompany
    );
  }

  private get getWildCardCompaniesUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.companies.wildCardCompanies
    );
  }

  // Company Creation

  createCompanies(payload) {
    const body = {
      ...payload,
      createdBy: this.user.id,
    };
    try {
      return this.http
        .post(this.createCompaniesUrl, body)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getAllCompanies() {
    try {
      return this.http
        .get(this.getAllCompaniesUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getSalespersonTeams() {
    try {
      return this.http
        .get(this.getSalespersonTeamsUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getSupervisorTeams() {
    try {
      return this.http
        .get(this.getSupervisorTeamsUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateCountTeamsSalesPerson(status, type, id) {
    try {
      return this.http
        .get(
          `${this.getCountTeamsSalesPersonUrl}/${status}/${type}/${id}/${this.gs.orgID}`
        )
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getWildcardCompanies(params) {
    try {
      return this.http
        .get(`${this.getWildCardCompaniesUrl}${params}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getCompaniesByFilter(query) {
    try {
      // console.log(`${this.getCompaniesByFilterUrl}?${query}`, 'url');
      return this.http
        .get(`${this.getCompaniesByFilterUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneCompany(id) {
    try {
      return this.http
        .get(`${this.getOneCompaniesUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateCompanies(payload) {
    try {
      return this.http
        .put(this.updateCompaniesUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  uploadCompanies(payload) {
    try {
      const url = `${this.endpoints.fourFourSixEndpoint}/clients/imports`;
      return this.http.post(url, payload).pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  addContactToCompany(payload) {
    try {
      return this.http
        .post(`${this.getContactToCompanyUrl}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getContactForCompany(id) {
    try {
      return this.http
        .get(`${this.getOneCompaniesUrl}${id}/contacts`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteCompanies(id) {
    try {
      return this.http
        .delete(`${this.deleteCompaniesUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
