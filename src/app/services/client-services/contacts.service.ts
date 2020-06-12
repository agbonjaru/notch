import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { Observable, of } from "rxjs";
import { UserModel } from "src/app/store/storeModels/user.model";

@Injectable({
  providedIn: "root",
})
export class ContactsService {
  private user: UserModel;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this.user = this.genServ.user;
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
  private get createContactsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.createGetOneUpdateDeleteContacts
    );
  }

  private get getAllContactsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.createGetOneUpdateDeleteContacts
    );
  }
  private get getOneContactsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.createGetOneUpdateDeleteContacts
    );
  }
  private get getContactsByFilterUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.filterContacts
    );
  }
  private get updateContactsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.createGetOneUpdateDeleteContacts
    );
  }
  private get deleteContactsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.createGetOneUpdateDeleteContacts
    );
  }
  private get getCompanyToContactUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.contacts.addCompanyToContact
    );
  }

  // Company Creation
  createContacts(payload) {
    const body = {
      ...payload,
      teamId: this.user.teamID,
      orgId: this.genServ.orgID,
      createdBy: this.user.id,
    };
    try {
      return this.http
        .post(this.createContactsUrl, body)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getAllContacts() {
    try {
      return this.http
        .get(this.getAllContactsUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getContactsByFilter(query) {
    try {
      return this.http
        .get(`${this.getContactsByFilterUrl}?${query}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneContact(id) {
    try {
      return this.http
        .get(`${this.getOneContactsUrl}${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  updateContacts(payload) {
    try {
      return this.http
        .put(this.updateContactsUrl, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  addCompanyToContact(payload) {
    try {
      return this.http
        .post(`${this.getCompanyToContactUrl}`, payload)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getCompanyForContact(id) {
    try {
      return this.http
        .get(`${this.getOneContactsUrl}${id}/companies`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  deleteContacts(id) {
    try {
      return this.http
        .delete(`${this.deleteContactsUrl}${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
}
